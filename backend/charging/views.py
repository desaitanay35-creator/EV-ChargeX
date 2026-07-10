from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Charger, ChargingSession
from .serializers import ChargerSerializer, ChargingSessionSerializer
from users.permissions import IsAdminOrOperatorOrReadOnly

from rest_framework import status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from bookings.models import Booking
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404

from payments.models import Payment
from notifications.models import Notification

from .services import (
    calculate_energy_used,
    calculate_cost,
    generate_transaction_id,
)

from payments.models import Payment

# -------------------- Charger --------------------

class ChargerListCreateView(generics.ListCreateAPIView):
    serializer_class = ChargerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperatorOrReadOnly]

    def get_queryset(self):
        if self.request.user.role in ["ADMIN", "USER"]:
            return Charger.objects.all()
        return Charger.objects.filter(station__operator=self.request.user)


class ChargerDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChargerSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperatorOrReadOnly]

    def get_queryset(self):
        if self.request.user.role in ["ADMIN", "USER"]:
            return Charger.objects.all()
        return Charger.objects.filter(station__operator=self.request.user)


# ---------------- Charging Session ----------------

class ChargingSessionListCreateView(generics.ListCreateAPIView):
    queryset = ChargingSession.objects.all()
    serializer_class = ChargingSessionSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        booking = serializer.validated_data["booking"]
        charger = serializer.validated_data["charger"]

        # Booking must be confirmed
        if booking.booking_status != "CONFIRMED":
            raise ValidationError({
                "booking": "Booking is not confirmed."
            })

        # Charger must be reserved
        if charger.status != "RESERVED":
            raise ValidationError({
                "charger": "Charger is not reserved."
            })

        # Update charger status
        charger.status = "OCCUPIED"
        charger.save()

        # Update booking
        booking.booking_status = "COMPLETED"
        booking.save()

        session = serializer.save(
            start_time=timezone.now(),
            session_status="ACTIVE"
        )

        


        return Response(
            ChargingSessionSerializer(session).data,
            status=status.HTTP_201_CREATED
        )


class ChargingSessionDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ChargingSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == "ADMIN":
            return ChargingSession.objects.all()

        elif self.request.user.role == "OPERATOR":
            return ChargingSession.objects.filter(
                charger__station__operator=self.request.user
            )

        return ChargingSession.objects.filter(
            booking__user=self.request.user
        )
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_charging_session(request, session_id):

    # raise Exception("THIS FUNCTION IS RUNNING")
    print("Content-Type:", request.content_type)
    print("Raw Body:", request.body)
    print("Parsed Data:", request.data)

    session = get_object_or_404(
        ChargingSession,
        id=session_id
    )

    if session.session_status != "ACTIVE":
        return Response(
            {"error": "Charging session already finished."},
            status=400
        )

    battery_after = request.data.get("battery_after")

    if battery_after is None:
        return Response(
            {"error": "battery_after is required."},
            status=400
        )

    battery_after = float(battery_after)

    session.battery_after = battery_after

    energy = calculate_energy_used(
        session.battery_before,
        battery_after,
        session.vehicle.battery_capacity,
    )

    session.energy_consumed_kwh = energy

    cost = calculate_cost(
        energy,
        session.charger.price_per_kwh,
    )

    session.charging_cost = cost
    session.session_status = "COMPLETED"
    session.end_time = timezone.now()
    session.save()

    charger = session.charger
    charger.status = "AVAILABLE"
    charger.save()

    Payment.objects.create(
        session=session,
        user=session.booking.user,
        amount=cost,
        payment_method="UPI",
        transaction_id=generate_transaction_id(),
        payment_status="PENDING",
    )

    return Response(
        {
            "message": "Charging completed successfully.",
            "energy_used": energy,
            "charging_cost": cost,
        }
    )

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_charging(request):

    booking_id = request.data.get("booking_id")

    if not booking_id:
        return Response(
            {"error": "booking_id is required."},
            status=400
        )

    booking = get_object_or_404(
        Booking,
        id=booking_id,
        user=request.user
    )

    # QR must be verified
    if not booking.is_qr_used:
        return Response(
            {"error": "Booking QR is not verified."},
            status=400
        )

    if ChargingSession.objects.filter(
        booking=booking,
        session_status="ACTIVE"
    ).exists():
        return Response(
            {"error": "Charging session already active."},
            status=400
        )

    charger = booking.charger

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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def stop_charging(request):

    session_id = request.data.get("session_id")
    battery_after = request.data.get("battery_after")

    if not session_id:
        return Response(
            {"error": "session_id is required."},
            status=400
        )

    if battery_after is None:
        return Response(
            {"error": "battery_after is required."},
            status=400
        )

    session = get_object_or_404(
        ChargingSession,
        id=session_id
    )

    if session.session_status != "ACTIVE":
        return Response(
            {"error": "Charging session is not active."},
            status=400
        )

    # Stop charging
    session.end_time = timezone.now()
    session.battery_after = battery_after
    session.session_status = "COMPLETED"

    # Update vehicle battery
    vehicle = session.vehicle
    vehicle.current_battery_percentage = battery_after
    vehicle.save()

    # Booking completed
    booking = session.booking
    booking.booking_status = "COMPLETED"
    booking.save()

    # Auto calculation happens in model's save()
    session.save()

    charger = session.charger
    charger.status = "AVAILABLE"
    charger.save()

    Notification.objects.create(
        user=session.booking.user,
        title="Charger Available",
        message=f"{charger.charger_name} is now available.",
        notification_type="CHARGING"
    )

    Notification.objects.create(
    user=session.booking.user,
    title="Charging Completed",
    message=(
        f"Charging completed successfully.\n"
        f"Energy: {session.energy_consumed_kwh} kWh\n"
        f"Cost: ₹{session.charging_cost}"
    ),
    notification_type="CHARGING")
    
    Payment.objects.create(
    user=session.booking.user,
    charging_session=session,
    amount=session.charging_cost,
    payment_status="PENDING"
)

    return Response({
        "message": "Charging completed successfully.",
        "session_id": session.id,
        "energy_consumed_kwh": session.energy_consumed_kwh,
        "charging_cost": session.charging_cost,
        "status": session.session_status
    })