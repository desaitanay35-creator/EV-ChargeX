from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Booking
from .serializers import BookingSerializer

from charging.models import Charger
from bookings.utils import generate_booking_qr
from notifications.models import Notification


class BookingListCreateView(generics.ListCreateAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == "ADMIN":
            return Booking.objects.all()

        elif self.request.user.role == "OPERATOR":
            return Booking.objects.filter(
                station__operator=self.request.user
            )

        return Booking.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):

        print("=" * 50)
        print("PERFORM CREATE CALLED")
        print("=" * 50)

        station = serializer.validated_data["station"]
        charger = serializer.validated_data["charger"]

        # Check charger belongs to selected station
        if charger.station != station:
            raise ValidationError(
                {"charger": "Selected charger does not belong to this station."}
            )

        # Check charger availability
        if charger.status != "AVAILABLE":
            raise ValidationError(
                {"charger": "Selected charger is not available."}
            )

        # Check duplicate booking
        if Booking.objects.filter(
            charger=charger,
            booking_date=serializer.validated_data["booking_date"],
            booking_start_time=serializer.validated_data["booking_start_time"],
            booking_status__in=["PENDING", "CONFIRMED"],
        ).exists():

            raise ValidationError(
                {"booking": "This charger is already booked for the selected time."}
            )

        # Reserve charger
        charger.status = "RESERVED"
        charger.save()

        booking = serializer.save(
            user=self.request.user,
            booking_status="CONFIRMED"
        )

        print("Booking created:", booking.id)

        try:
            print("Generating QR...")

            booking.qr_code = generate_booking_qr(booking)

            print("QR Path:", booking.qr_code)

            booking.save()

            # Booking Notification
            Notification.objects.create(
                user=booking.user,
                title="Booking Confirmed",
                message=f"Your booking at {booking.station.station_name} has been confirmed.",
                notification_type="BOOKING"
            )

        except Exception as e:
            print("QR ERROR:", e)


class BookingDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        if self.request.user.role == "ADMIN":
            return Booking.objects.all()

        elif self.request.user.role == "OPERATOR":
            return Booking.objects.filter(
                station__operator=self.request.user
            )

        return Booking.objects.filter(
            user=self.request.user
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def validate_qr(request):

    # Only operator can validate
    if request.user.role != "OPERATOR":
        return Response(
            {"error": "Only operators can scan QR codes."},
            status=403
        )

    qr_code = request.data.get("qr_code")

    if not qr_code:
        return Response(
            {"error": "QR code is required."},
            status=400
        )

    booking = get_object_or_404(
        Booking,
        qr_code=qr_code
    )

    if booking.booking_status != "CONFIRMED":
        return Response(
            {"error": "Booking is not confirmed."},
            status=400
        )

    if booking.is_qr_used:
        return Response(
            {"error": "QR Code already used."},
            status=400
        )

    # Mark QR as verified
    booking.is_qr_used = True
    booking.save()

    # QR Verified Notification
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
    })