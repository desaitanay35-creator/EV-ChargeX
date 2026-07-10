from django.db.models import Sum

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from trips.models import Trip
from bookings.models import Booking

from payments.models import Payment
from rest_framework.decorators import api_view, permission_classes
from vehicles.models import Vehicle

from django.utils import timezone

from stations.models import Station
from charging.models import Charger, ChargingSession


from users.models import User


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):

    user = request.user

    total_vehicles = Vehicle.objects.filter(
        user=user
    ).count()

    total_bookings = Booking.objects.filter(
        user=user
    ).count()

    active_sessions = ChargingSession.objects.filter(
        booking__user=user,
        session_status="ACTIVE"
    ).count()

    total_payments = Payment.objects.filter(
        user=user,
        payment_status="COMPLETED"
    ).count()

    return Response({
        "user": user.first_name,
        "total_vehicles": total_vehicles,
        "total_bookings": total_bookings,
        "active_sessions": active_sessions,
        "completed_payments": total_payments,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_dashboard(request):

    if request.user.role != "OPERATOR":
        return Response(
            {
                "error": "Only operators can access this dashboard."
            },
            status=403
        )

    today = timezone.now().date()

    stations = Station.objects.filter(
        operator=request.user
    )

    chargers = Charger.objects.filter(
        station__operator=request.user
    )

    bookings = Booking.objects.filter(
        station__operator=request.user
    )

    sessions = ChargingSession.objects.filter(
        charger__station__operator=request.user
    )

    payments = Payment.objects.filter(
        charging_session__charger__station__operator=request.user,
        payment_status="COMPLETED"
    )

    today_payments = payments.filter(
        created_at__date=today
    )

    return Response({

        "total_stations": stations.count(),

        "total_chargers": chargers.count(),

        "available_chargers": chargers.filter(
            status="AVAILABLE"
        ).count(),

        "reserved_chargers": chargers.filter(
            status="RESERVED"
        ).count(),

        "occupied_chargers": chargers.filter(
            status="OCCUPIED"
        ).count(),

        "today_bookings": bookings.filter(
            booking_date=today
        ).count(),

        "active_sessions": sessions.filter(
            session_status="ACTIVE"
        ).count(),

        "today_revenue":
            today_payments.aggregate(
                total=Sum("amount")
            )["total"] or 0,

        "total_revenue":
            payments.aggregate(
                total=Sum("amount")
            )["total"] or 0,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):

    if request.user.role != "ADMIN":
        return Response(
            {
                "error": "Only admin can access this dashboard."
            },
            status=403
        )

    today = timezone.now().date()

    payments = Payment.objects.filter(
        payment_status="COMPLETED"
    )

    return Response({

        "users": {
            "total_users": User.objects.filter(role="USER").count(),
            "total_operators": User.objects.filter(role="OPERATOR").count(),
            "total_admins": User.objects.filter(role="ADMIN").count(),
        },

        "vehicles": {
            "total_vehicles": Vehicle.objects.count(),
        },

        "stations": {
            "total_stations": Station.objects.count(),
            "open": Station.objects.filter(status="OPEN").count(),
            "closed": Station.objects.filter(status="CLOSED").count(),
            "maintenance": Station.objects.filter(status="MAINTENANCE").count(),
        },

        "chargers": {
            "total": Charger.objects.count(),
            "available": Charger.objects.filter(status="AVAILABLE").count(),
            "reserved": Charger.objects.filter(status="RESERVED").count(),
            "occupied": Charger.objects.filter(status="OCCUPIED").count(),
        },

        "charging": {
            "active_sessions": ChargingSession.objects.filter(
                session_status="ACTIVE"
            ).count(),

            "completed_sessions": ChargingSession.objects.filter(
                session_status="COMPLETED"
            ).count(),
        },

        "bookings": {
            "total_bookings": Booking.objects.count(),
            "today_bookings": Booking.objects.filter(
                booking_date=today
            ).count(),
        },

        "revenue": {

            "today_revenue":
                payments.filter(
                    created_at__date=today
                ).aggregate(
                    total=Sum("amount")
                )["total"] or 0,

            "total_revenue":
                payments.aggregate(
                    total=Sum("amount")
                )["total"] or 0,
        }

    })


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