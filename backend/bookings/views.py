from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Booking
from .serializers import BookingSerializer

from rest_framework.exceptions import ValidationError
from charging.models import Charger


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

        serializer.save(
            user=self.request.user,
            booking_status="CONFIRMED"
        )


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
    