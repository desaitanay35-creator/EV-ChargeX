from decimal import Decimal
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Charger, ChargingSession
from .serializers import ChargerSerializer, ChargingSessionSerializer, OperatorChargingSessionSerializer
from .services import (
    calculate_cost,
    calculate_energy_used,
    generate_transaction_id,
)
from bookings.models import Booking
from notifications.models import Notification
from payments.models import Payment
from users.permissions import CanManageCharger, IsOperatorOrAdmin


# -------------------- Charger --------------------

class ChargerListCreateView(generics.ListCreateAPIView):
    serializer_class = ChargerSerializer
    permission_classes = [IsAuthenticated, CanManageCharger]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Charger.objects.none()
        if user.role in ["ADMIN", "USER"]:
            return Charger.objects.all().select_related("station")
        return Charger.objects.filter(station__operator=user).select_related("station")

    def perform_create(self, serializer):
        user = self.request.user
        station = serializer.validated_data.get("station")
        charger_number = serializer.validated_data.get("charger_number")
        power = serializer.validated_data.get("power_output_kw")
        price = serializer.validated_data.get("price_per_kwh")

        if user.role == "OPERATOR" and station.operator != user:
            raise ValidationError({"station": "You can only create chargers for your assigned stations."})

        if Charger.objects.filter(charger_number=charger_number).exists():
            raise ValidationError({"charger_number": "A charger with this charger number already exists."})

        if power is not None and Decimal(str(power)) <= Decimal("0"):
            raise ValidationError({"power_output_kw": "Power output must be greater than zero."})

        if price is not None and Decimal(str(price)) < Decimal("0"):
            raise ValidationError({"price_per_kwh": "Price per kWh cannot be negative."})

        serializer.save()


class ChargerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChargerSerializer
    permission_classes = [IsAuthenticated, CanManageCharger]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Charger.objects.none()
        if user.role in ["ADMIN", "USER"]:
            return Charger.objects.all().select_related("station")
        return Charger.objects.filter(station__operator=user).select_related("station")

    def perform_update(self, serializer):
        user = self.request.user
        instance = self.get_object()
        new_station = serializer.validated_data.get("station", instance.station)
        new_status = serializer.validated_data.get("status", instance.status)

        # Immutable station during edit for OPERATOR
        if user.role == "OPERATOR" and new_station != instance.station:
            raise ValidationError({"station": "Station assignment cannot be changed during charger update."})

        # Check Active Session Conflict
        has_active_session = ChargingSession.objects.filter(
            charger=instance,
            session_status="ACTIVE"
        ).exists()

        if has_active_session and new_status in ["AVAILABLE", "MAINTENANCE", "OUT_OF_SERVICE"]:
            raise ValidationError({
                "status": "This charger has an active charging session in progress and cannot be changed to this status."
            })

        # Manual OCCUPIED status restriction
        if new_status == "OCCUPIED" and instance.status != "OCCUPIED" and not has_active_session:
            raise ValidationError({
                "status": "Status 'OCCUPIED' is managed automatically by active charging sessions."
            })

        # Upcoming Bookings Maintenance/Out of Service Guard
        if new_status in ["MAINTENANCE", "OUT_OF_SERVICE"] and instance.status not in ["MAINTENANCE", "OUT_OF_SERVICE"]:
            today = timezone.now().date()
            upcoming_count = Booking.objects.filter(
                charger=instance,
                booking_date__gte=today,
                booking_status__in=["PENDING", "CONFIRMED"]
            ).count()

            if upcoming_count > 0:
                raise ValidationError({
                    "status": f"This charger has {upcoming_count} upcoming reservation(s). Please cancel or resolve bookings before marking maintenance or out of service."
                })

        serializer.save()

    def perform_destroy(self, instance):
        # Operational history deletion protection
        has_bookings = Booking.objects.filter(charger=instance).exists()
        has_sessions = ChargingSession.objects.filter(charger=instance).exists()

        if has_bookings or has_sessions:
            raise ValidationError({
                "detail": "This charger has operational history (bookings or charging sessions) and cannot be deleted. Mark it out of service instead."
            })

        instance.delete()


# ---------------- Charging Session ----------------

class ChargingSessionListCreateView(generics.ListAPIView):
    """
    Read-only list view for charging sessions with strict role-based queryset filtering.
    Direct POST creation is disabled in favor of POST /api/charging/start/.
    """
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user and self.request.user.role in ["OPERATOR", "ADMIN"]:
            return OperatorChargingSessionSerializer
        return ChargingSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return ChargingSession.objects.none()

        qs = ChargingSession.objects.select_related(
            "charger",
            "charger__station",
            "booking",
            "vehicle",
            "booking__user"
        )

        if user.role == "ADMIN":
            return qs.all()
        elif user.role == "OPERATOR":
            return qs.filter(charger__station__operator=user)
        return qs.filter(booking__user=user)


class ChargingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user and self.request.user.role in ["OPERATOR", "ADMIN"]:
            return OperatorChargingSessionSerializer
        return ChargingSessionSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return ChargingSession.objects.none()

        qs = ChargingSession.objects.select_related(
            "charger",
            "charger__station",
            "booking",
            "vehicle",
            "booking__user"
        )

        if user.role == "ADMIN":
            return qs.all()
        elif user.role == "OPERATOR":
            return qs.filter(charger__station__operator=user)
        return qs.filter(booking__user=user)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_charging(request):
    from django.db import transaction

    booking_id = request.data.get("booking_id")
    if not booking_id:
        return Response({"error": "booking_id is required."}, status=400)

    with transaction.atomic():
        booking = get_object_or_404(
            Booking.objects.select_for_update().select_related("station", "charger", "trip__vehicle", "user"),
            id=booking_id
        )

        if request.user.role == "USER" and booking.user != request.user:
            return Response({"error": "Booking does not belong to your account."}, status=403)

        if request.user.role == "OPERATOR" and booking.station.operator != request.user:
            return Response({"error": "Booking does not belong to an assigned station."}, status=403)

        if booking.booking_status != "CONFIRMED":
            return Response({"error": "Booking is not confirmed."}, status=400)

        if not booking.is_qr_used:
            return Response({"error": "Booking QR code has not been verified by operator."}, status=400)

        charger = Charger.objects.select_for_update().get(id=booking.charger.id)

        if ChargingSession.objects.filter(booking=booking, session_status="ACTIVE").exists():
            return Response({"error": "Charging session is already active for this booking."}, status=400)

        if ChargingSession.objects.filter(charger=charger, session_status="ACTIVE").exists():
            return Response({"error": "Charger already has an active charging session."}, status=400)

        charger.status = "OCCUPIED"
        charger.save()

        session = ChargingSession.objects.create(
            booking=booking,
            charger=charger,
            vehicle=booking.trip.vehicle,
            battery_before=booking.trip.vehicle.current_battery_percentage,
            start_time=timezone.now(),
            session_status="ACTIVE"
        )

        Notification.objects.create(
            user=session.booking.user,
            title="Charging Started",
            message=f"Charging has started on {charger.charger_name}.",
            notification_type="CHARGING"
        )

    return Response({
        "message": "Charging started successfully.",
        "session_id": session.id,
        "start_time": session.start_time,
        "status": session.session_status
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def completion_preview(request, pk=None):
    session_id = pk or request.data.get("session_id")
    if not session_id:
        return Response({"error": "session_id is required."}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(
        ChargingSession.objects.select_related("charger__station", "booking__user", "vehicle"),
        id=session_id
    )

    if request.user.role == "USER" and session.booking.user != request.user:
        return Response({"error": "Charging session does not belong to your account."}, status=status.HTTP_403_FORBIDDEN)

    if request.user.role == "OPERATOR" and session.charger.station.operator != request.user:
        return Response({"error": "Charging session does not belong to an assigned station."}, status=status.HTTP_403_FORBIDDEN)

    from .services import estimate_charging_result
    estimate = estimate_charging_result(session)

    return Response({
        "session_id": session.id,
        "session_status": session.session_status,
        "estimate": estimate
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def stop_charging(request):
    from django.db import transaction
    from .services import estimate_charging_result

    session_id = request.data.get("session_id")
    if not session_id:
        return Response({"session_id": ["session_id is required."]}, status=status.HTTP_400_BAD_REQUEST)

    session = get_object_or_404(
        ChargingSession.objects.select_related("charger__station", "booking__user", "vehicle"),
        id=session_id
    )

    if request.user.role == "USER" and session.booking.user != request.user:
        return Response({"error": "Charging session does not belong to your account."}, status=status.HTTP_403_FORBIDDEN)

    if request.user.role == "OPERATOR" and session.charger.station.operator != request.user:
        return Response({"error": "Charging session does not belong to an assigned station."}, status=status.HTTP_403_FORBIDDEN)

    # Idempotent response if already finished
    if session.session_status in ["COMPLETED", "INTERRUPTED"]:
        return Response({
            "message": "Charging session was already completed.",
            "session_id": session.id,
            "energy_consumed_kwh": str(session.energy_consumed_kwh),
            "charging_cost": str(session.charging_cost),
            "status": session.session_status
        }, status=status.HTTP_200_OK)

    now = timezone.now()

    with transaction.atomic():
        session = ChargingSession.objects.select_for_update().get(id=session_id)
        if session.session_status in ["COMPLETED", "INTERRUPTED"]:
            return Response({
                "message": "Charging session was already completed.",
                "session_id": session.id,
                "energy_consumed_kwh": str(session.energy_consumed_kwh),
                "charging_cost": str(session.charging_cost),
                "status": session.session_status
            }, status=status.HTTP_200_OK)

        # Calculate automatic final battery %, energy delivered, and cost via service
        estimate = estimate_charging_result(session, end_time=now)

        battery_after = Decimal(estimate["battery_after"])
        energy_delivered = Decimal(estimate["energy_delivered_kwh"])
        cost = Decimal(estimate["charging_cost"])

        session.battery_after = battery_after
        session.energy_consumed_kwh = energy_delivered
        session.charging_cost = cost
        session.session_status = "COMPLETED"
        session.end_time = now
        session.save()

        vehicle = session.vehicle
        vehicle.current_battery_percentage = battery_after
        vehicle.save()

        booking = session.booking
        booking.booking_status = "COMPLETED"
        booking.save()

        charger = session.charger
        charger.status = "AVAILABLE"
        charger.save()

        Payment.objects.get_or_create(
            charging_session=session,
            defaults={
                "user": session.booking.user,
                "amount": cost,
                "payment_status": "PENDING",
                "transaction_id": generate_transaction_id(),
            }
        )

        Notification.objects.create(
            user=session.booking.user,
            title="Charging Completed",
            message=f"Charging completed. Energy: {energy_delivered:.2f} kWh, Cost: ₹{cost:.2f}",
            notification_type="CHARGING"
        )

    return Response({
        "message": "Charging completed successfully.",
        "session_id": session.id,
        "energy_consumed_kwh": str(energy_delivered),
        "charging_cost": str(cost),
        "battery_after": str(battery_after),
        "status": session.session_status,
        "estimate": estimate
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_charging_session(request, session_id):
    request.data["session_id"] = session_id
    return stop_charging(request)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def compatible_chargers(request):
    station_id = request.GET.get("station_id")
    vehicle_id = request.GET.get("vehicle_id")

    if not station_id or not vehicle_id:
        return Response(
            {"error": "station_id and vehicle_id are required query parameters."},
            status=400
        )

    from vehicles.models import Vehicle
    from stations.models import Station
    from charging.utils import is_connector_compatible

    vehicle = get_object_or_404(Vehicle, id=vehicle_id, user=request.user)
    station = get_object_or_404(Station, id=station_id)

    station_chargers = Charger.objects.filter(station=station)
    compatible_list = []

    for charger in station_chargers:
        if is_connector_compatible(vehicle.connector_type, charger.connector_type):
            compatible_list.append(ChargerSerializer(charger).data)

    return Response({
        "station_id": int(station_id),
        "vehicle_id": int(vehicle_id),
        "vehicle_connector": vehicle.connector_type,
        "compatible_chargers": compatible_list
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def interrupt_charging(request):
    from django.db import transaction

    session_id = request.data.get("session_id")
    reason = request.data.get("reason", "Operator emergency stop")

    if not session_id:
        return Response({"error": "session_id is required."}, status=400)

    session = get_object_or_404(
        ChargingSession.objects.select_related("charger__station", "booking__user", "vehicle"),
        id=session_id
    )

    if request.user.role == "USER" and session.booking.user != request.user:
        return Response({"error": "Charging session does not belong to your account."}, status=403)

    if request.user.role == "OPERATOR" and session.charger.station.operator != request.user:
        return Response({"error": "Charging session does not belong to an assigned station."}, status=403)

    if session.session_status != "ACTIVE":
        return Response({"error": "Charging session is not active."}, status=400)

    with transaction.atomic():
        session = ChargingSession.objects.select_for_update().get(id=session_id)
        if session.session_status != "ACTIVE":
            return Response({"error": "Charging session is not active."}, status=400)

        session.session_status = "INTERRUPTED"
        session.end_time = timezone.now()
        session.save()

        booking = session.booking
        booking.booking_status = "COMPLETED"
        booking.save()

        charger = session.charger
        charger.status = "AVAILABLE"
        charger.save()

        Notification.objects.create(
            user=session.booking.user,
            title="Charging Interrupted",
            message=f"Charging on {charger.charger_name} was interrupted. Reason: {reason}",
            notification_type="CHARGING"
        )

    return Response({
        "message": "Charging session interrupted safely.",
        "session_id": session.id,
        "status": "INTERRUPTED"
    })