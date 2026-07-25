from django.shortcuts import render

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
from users.permissions import IsAdmin, IsOperator

from .selectors import (
    get_admin_dashboard_summary,
    get_admin_period_summary,
    get_admin_recent_users,
    get_admin_recent_bookings,
    get_admin_active_sessions,
    get_admin_revenue_trend,
    get_admin_breakdowns,
    get_admin_system_alerts,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    from django.db.models import Sum, Value
    from django.db.models.functions import Coalesce
    from decimal import Decimal

    user = request.user

    total_vehicles = Vehicle.objects.filter(user=user).count()
    total_trips = Trip.objects.filter(user=user).count()
    total_bookings = Booking.objects.filter(user=user).count()
    active_bookings = Booking.objects.filter(user=user, booking_status__in=["PENDING", "CONFIRMED"]).count()
    active_sessions = ChargingSession.objects.filter(booking__user=user, session_status="ACTIVE").count()
    completed_sessions = ChargingSession.objects.filter(booking__user=user, session_status="COMPLETED").count()

    user_payments = Payment.objects.filter(user=user)
    total_spent = user_payments.filter(payment_status="SUCCESS").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    pending_amount = user_payments.filter(payment_status="PENDING").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    unread_notifications = user.notifications.filter(is_read=False).count()

    return Response({
        "total_vehicles": total_vehicles,
        "total_trips": total_trips,
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "active_sessions": active_sessions,
        "completed_sessions": completed_sessions,
        "total_payments": user_payments.count(),
        "total_spent": str(total_spent),
        "pending_amount": str(pending_amount),
        "notifications": unread_notifications,
        "summary": {
            "vehicles": total_vehicles,
            "active_bookings": active_bookings,
            "completed_sessions": completed_sessions,
            "total_spent": str(total_spent),
            "pending_amount": str(pending_amount),
            "unread_notifications": unread_notifications,
        }
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsOperator])
def operator_dashboard(request):
    from django.db.models import Sum, Value
    from django.db.models.functions import Coalesce
    from decimal import Decimal
    from django.utils import timezone

    user = request.user
    today = timezone.localdate()

    assigned_stations = Station.objects.filter(operator=user)

    if not assigned_stations.exists():
        return Response({
            "operator": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            },
            "summary": {
                "assigned_stations": 0,
                "total_chargers": 0,
                "available_chargers": 0,
                "occupied_chargers": 0,
                "reserved_chargers": 0,
                "active_sessions": 0,
                "today_bookings": 0,
                "today_revenue": "0.00",
                "total_revenue": "0.00"
            },
            "total_chargers": 0,
            "available": 0,
            "occupied": 0,
            "reserved": 0,
            "today_sessions": 0,
            "revenue": "0.00",
            "stations": [],
            "active_sessions": [],
            "upcoming_bookings": [],
            "charger_status_breakdown": []
        })

    chargers = Charger.objects.filter(station__in=assigned_stations)

    total_chargers = chargers.count()
    available_chargers = chargers.filter(status="AVAILABLE").count()
    occupied_chargers = chargers.filter(status="OCCUPIED").count()
    reserved_chargers = chargers.filter(status="RESERVED").count()

    assigned_bookings = Booking.objects.filter(station__in=assigned_stations)
    today_bookings = assigned_bookings.filter(booking_date=today).count()

    assigned_sessions = ChargingSession.objects.filter(charger__station__in=assigned_stations)
    active_sessions_qs = assigned_sessions.filter(session_status="ACTIVE").select_related("charger", "charger__station", "vehicle", "booking__user")
    active_sessions_count = active_sessions_qs.count()

    assigned_payments = Payment.objects.filter(charging_session__charger__station__in=assigned_stations, payment_status="SUCCESS")

    today_revenue = assigned_payments.filter(created_at__date=today).aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    total_revenue = assigned_payments.aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    stations_data = [
        {
            "id": s.id,
            "station_name": s.station_name,
            "city": s.city,
            "status": s.status,
            "rating": str(s.rating),
            "chargers_count": s.chargers.count()
        }
        for s in assigned_stations
    ]

    active_sessions_data = [
        {
            "id": s.id,
            "charger": s.charger.charger_name,
            "station": s.charger.station.station_name,
            "user": s.booking.user.username,
            "battery_before": str(s.battery_before),
            "start_time": s.start_time
        }
        for s in active_sessions_qs
    ]

    upcoming_bookings_data = [
        {
            "id": b.id,
            "station": b.station.station_name,
            "charger": b.charger.charger_name,
            "user": b.user.username,
            "booking_date": b.booking_date,
            "booking_start_time": b.booking_start_time,
            "booking_end_time": b.booking_end_time,
            "booking_status": b.booking_status,
            "is_qr_used": b.is_qr_used
        }
        for b in assigned_bookings.filter(booking_date__gte=today, booking_status__in=["PENDING", "CONFIRMED"]).order_by("booking_date", "booking_start_time")[:5]
    ]

    return Response({
        "operator": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        },
        "summary": {
            "assigned_stations": assigned_stations.count(),
            "total_chargers": total_chargers,
            "available_chargers": available_chargers,
            "occupied_chargers": occupied_chargers,
            "reserved_chargers": reserved_chargers,
            "active_sessions": active_sessions_count,
            "today_bookings": today_bookings,
            "today_revenue": str(today_revenue),
            "total_revenue": str(total_revenue)
        },
        "total_chargers": total_chargers,
        "available": available_chargers,
        "occupied": occupied_chargers,
        "reserved": reserved_chargers,
        "today_sessions": active_sessions_count,
        "revenue": str(total_revenue),
        "stations": stations_data,
        "active_sessions": active_sessions_data,
        "upcoming_bookings": upcoming_bookings_data,
        "charger_status_breakdown": [
            {"status": "AVAILABLE", "count": available_chargers},
            {"status": "OCCUPIED", "count": occupied_chargers},
            {"status": "RESERVED", "count": reserved_chargers},
        ]
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_dashboard(request):
    range_val = request.query_params.get("range", "6m")
    allowed_ranges = ["7d", "30d", "3m", "6m", "12m", "all"]
    if range_val not in allowed_ranges:
        range_val = "6m"

    summary = get_admin_dashboard_summary()
    period_summary = get_admin_period_summary(range_val)
    recent_users = get_admin_recent_users(10)
    recent_bookings = get_admin_recent_bookings(10)
    active_sessions = get_admin_active_sessions()
    breakdowns = get_admin_breakdowns()
    revenue_trend = get_admin_revenue_trend(range_val)
    system_alerts = get_admin_system_alerts()

    return Response({
        "summary": summary,
        "period_summary": period_summary,
        "recent_users": recent_users,
        "recent_bookings": recent_bookings,
        "active_sessions": active_sessions,
        "station_status_breakdown": breakdowns["station_status_breakdown"],
        "charger_status_breakdown": breakdowns["charger_status_breakdown"],
        "payment_status_breakdown": breakdowns["payment_status_breakdown"],
        "revenue_trend": revenue_trend,
        "system_alerts": system_alerts,
    })