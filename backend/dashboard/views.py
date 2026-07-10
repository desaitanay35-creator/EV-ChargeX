from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.models import User
from vehicles.models import Vehicle
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from payments.models import Payment
from trips.models import Trip

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):

    user = request.user

    return Response({
        "total_vehicles": Vehicle.objects.filter(user=user).count(),
        "total_trips": Trip.objects.filter(user=user).count(),
        "total_bookings": Booking.objects.filter(user=user).count(),
        "active_sessions": ChargingSession.objects.filter(
            booking__user=user,
            session_status="ACTIVE"
        ).count(),
        "total_payments": Payment.objects.filter(user=user).count(),
        "notifications": user.notifications.filter(is_read=False).count()
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def operator_dashboard(request):

    if request.user.role != "OPERATOR":
        return Response({"error": "Access Denied"}, status=403)

    chargers = Charger.objects.filter(
        station__operator=request.user
    )

    return Response({

        "total_chargers": chargers.count(),

        "available": chargers.filter(
            status="AVAILABLE"
        ).count(),

        "occupied": chargers.filter(
            status="OCCUPIED"
        ).count(),

        "reserved": chargers.filter(
            status="RESERVED"
        ).count(),

        "today_sessions": ChargingSession.objects.filter(
            charger__station__operator=request.user
        ).count(),

        "revenue": sum(
            session.charging_cost
            for session in ChargingSession.objects.filter(
                charger__station__operator=request.user,
                session_status="COMPLETED"
            )
        )
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):

    if request.user.role != "ADMIN":
        return Response({"error": "Access Denied"}, status=403)

    return Response({

        "users": User.objects.filter(
            role="USER"
        ).count(),

        "operators": User.objects.filter(
            role="OPERATOR"
        ).count(),

        "stations": Station.objects.count(),

        "chargers": Charger.objects.count(),

        "bookings": Booking.objects.count(),

        "charging_sessions": ChargingSession.objects.count(),

        "payments": Payment.objects.count(),

        "revenue": sum(
            session.charging_cost
            for session in ChargingSession.objects.filter(
                session_status="COMPLETED"
            )
        )
    })