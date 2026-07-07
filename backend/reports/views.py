from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from trips.models import Trip
from bookings.models import Booking
from charging.models import ChargingSession
from payments.models import Payment


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        total_trips = Trip.objects.filter(user=user).count()

        total_bookings = Booking.objects.filter(user=user).count()

        sessions = ChargingSession.objects.filter(
            vehicle__user=user
        )

        total_sessions = sessions.count()

        total_energy = (
            sessions.aggregate(
                total=Sum("energy_consumed_kwh")
            )["total"] or 0
        )

        total_spent = (
            Payment.objects.filter(user=user)
            .aggregate(total=Sum("amount"))["total"] or 0
        )

        return Response({
            "total_trips": total_trips,
            "total_bookings": total_bookings,
            "charging_sessions": total_sessions,
            "energy_consumed_kwh": total_energy,
            "total_spent": total_spent
        })