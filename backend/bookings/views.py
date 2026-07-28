from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from charging.models import Charger
from .models import Booking
from .serializers import BookingSerializer, OperatorBookingSerializer
from notifications.models import Notification
from .utils import generate_unique_booking_token, generate_booking_qr
from users.permissions import IsOperatorOrAdmin


class BookingListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user and self.request.user.role in ["OPERATOR", "ADMIN"]:
            return OperatorBookingSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Booking.objects.none()

        qs = Booking.objects.select_related(
            "station",
            "charger",
            "user",
            "vehicle",
            "trip"
        ).prefetch_related("chargingsession_set")

        if user.role == "ADMIN":
            return qs.all()
        elif user.role == "OPERATOR":
            return qs.filter(station__operator=user)
        return qs.filter(user=user)

    def perform_create(self, serializer):
        station = serializer.validated_data["station"]
        charger_instance = serializer.validated_data["charger"]
        vehicle = serializer.validated_data["vehicle"]
        booking_date = serializer.validated_data["booking_date"]
        start_time = serializer.validated_data["booking_start_time"]
        end_time = serializer.validated_data["booking_end_time"]

        # Transaction Atomic Block with Select For Update Locking
        with transaction.atomic():
            charger = Charger.objects.select_for_update().get(id=charger_instance.id)

            if charger.station_id != station.id or charger.station.status != "OPEN":
                raise ValidationError({"charger": "Selected station or charger is unavailable."})

            from charging.utils import is_connector_compatible
            if not is_connector_compatible(vehicle.connector_type, charger.connector_type):
                raise ValidationError({"charger": "Selected charger is incompatible with vehicle connector."})

            if charger.status != "AVAILABLE":
                raise ValidationError({"charger": "Selected charger is currently unavailable."})

            # Strict Overlap Check (only PENDING & CONFIRMED block)
            overlapping = Booking.objects.filter(
                charger=charger,
                booking_date=booking_date,
                booking_status__in=["PENDING", "CONFIRMED"],
                booking_start_time__lt=end_time,
                booking_end_time__gt=start_time,
            ).exists()

            if overlapping:
                raise ValidationError(
                    {"charger": "This charger is already booked during the selected time slot."}
                )

            # Reserve charger
            charger.status = "RESERVED"
            charger.save()

            # 1. Save booking first so booking.id exists
            booking = serializer.save(
                user=self.request.user,
                vehicle=vehicle,
                booking_status="CONFIRMED"
            )

            # 2. Generate unique verification token explicitly
            booking.qr_code = generate_unique_booking_token(booking.id)

            # 3. Generate QR image file encoding ONLY verification token
            try:
                booking.qr_image = generate_booking_qr(booking)
                booking.save(update_fields=["qr_code", "qr_image"])
            except Exception as e:
                print("QR file generation error:", e)

            Notification.objects.create(
                user=booking.user,
                title="Booking Confirmed",
                message=f"Your booking at {booking.station.station_name} has been confirmed.",
                notification_type="BOOKING"
            )


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.request.user and self.request.user.role in ["OPERATOR", "ADMIN"]:
            return OperatorBookingSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Booking.objects.none()

        qs = Booking.objects.select_related(
            "station",
            "charger",
            "user",
            "vehicle",
            "trip"
        ).prefetch_related("chargingsession_set")

        if user.role == "ADMIN":
            return qs.all()
        elif user.role == "OPERATOR":
            return qs.filter(station__operator=user)
        return qs.filter(user=user)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsOperatorOrAdmin])
def validate_qr(request):
    raw_code = request.data.get("qr_code")

    if not raw_code or not str(raw_code).strip():
        return Response(
            {"error": "Enter a booking verification code."},
            status=status.HTTP_400_BAD_REQUEST
        )

    code = str(raw_code).strip().upper()

    with transaction.atomic():
        # Atomically lock the booking row by exact verification token
        booking = Booking.objects.select_for_update().select_related("station", "user").filter(qr_code=code).first()

        if not booking:
            return Response(
                {"error": "This booking verification code is invalid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Station Ownership Security Check: wrong station error does NOT reveal customer/vehicle details
        if request.user.role == "OPERATOR" and booking.station.operator != request.user:
            return Response(
                {"error": "This booking belongs to another station and cannot be validated by your account."},
                status=status.HTTP_403_FORBIDDEN
            )

        if booking.booking_status != "CONFIRMED":
            return Response(
                {"error": "Only confirmed bookings can be validated."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if booking.is_qr_used:
            return Response(
                {"error": "This QR code has already been used."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Mark QR as verified atomically
        booking.is_qr_used = True
        booking.is_verified = True
        booking.save(update_fields=["is_qr_used", "is_verified"])

        Notification.objects.create(
            user=booking.user,
            title="QR Verified",
            message="Your QR code has been verified. You can now start charging.",
            notification_type="BOOKING"
        )

        return Response({
            "message": "QR verified successfully.",
            "booking_id": booking.id,
            "can_start_charging": True
        }, status=status.HTTP_200_OK)