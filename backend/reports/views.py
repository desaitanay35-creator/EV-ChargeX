from decimal import Decimal
from django.db.models import Count, Sum, Value
from django.db.models.functions import Coalesce
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from datetime import timedelta

from bookings.models import Booking
from charging.models import Charger, ChargingSession
from payments.models import Payment
from stations.models import Station
from trips.models import Trip
from users.models import User
from vehicles.models import Vehicle
from users.permissions import IsOperator


def get_user_report_data(user, range_param="all"):
    """
    Computes real summary metrics and monthly time-series charts for a driver user.
    """
    user_trips = Trip.objects.filter(user=user)
    user_bookings = Booking.objects.filter(user=user)
    user_sessions = ChargingSession.objects.filter(booking__user=user)
    user_payments = Payment.objects.filter(user=user)

    total_trips = user_trips.count()
    total_bookings = user_bookings.count()
    completed_sessions = user_sessions.filter(session_status="COMPLETED").count()

    total_energy = user_sessions.filter(session_status="COMPLETED").aggregate(
        total=Coalesce(Sum("energy_consumed_kwh"), Value(Decimal("0.00")))
    )["total"]

    total_spent = user_payments.filter(payment_status="SUCCESS").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    # Monthly Spending Aggregation (SUCCESS payments only)
    spending_payments = user_payments.filter(payment_status="SUCCESS").order_by("created_at")
    spending_map = {}
    for p in spending_payments:
        if p.created_at:
            m_key = p.created_at.strftime("%Y-%m")
            m_label = p.created_at.strftime("%b %Y")
            if m_key not in spending_map:
                spending_map[m_key] = {"month": m_key, "label": m_label, "amount": Decimal("0.00")}
            spending_map[m_key]["amount"] += (p.amount or Decimal("0.00"))

    monthly_spending = [
        {"month": k, "label": v["label"], "amount": str(v["amount"])}
        for k, v in spending_map.items()
    ]

    # Monthly Energy Aggregation (COMPLETED sessions only)
    energy_sessions = user_sessions.filter(session_status="COMPLETED").order_by("created_at")
    energy_map = {}
    for s in energy_sessions:
        if s.created_at:
            m_key = s.created_at.strftime("%Y-%m")
            m_label = s.created_at.strftime("%b %Y")
            if m_key not in energy_map:
                energy_map[m_key] = {"month": m_key, "label": m_label, "energy_kwh": Decimal("0.00")}
            energy_map[m_key]["energy_kwh"] += (s.energy_consumed_kwh or Decimal("0.00"))

    monthly_energy = [
        {"month": k, "label": v["label"], "energy_kwh": str(v["energy_kwh"])}
        for k, v in energy_map.items()
    ]

    # Sessions by status
    status_qs = (
        user_sessions.values("session_status")
        .annotate(count=Count("id"))
    )
    sessions_by_status = [
        {"status": item["session_status"], "count": item["count"]}
        for item in status_qs
    ]

    # Recent sessions (latest 5)
    recent_sessions = [
        {
            "id": s.id,
            "charger": s.charger.charger_name,
            "energy_consumed_kwh": str(s.energy_consumed_kwh),
            "charging_cost": str(s.charging_cost),
            "session_status": s.session_status,
            "start_time": s.start_time,
            "end_time": s.end_time,
        }
        for s in user_sessions.order_by("-created_at")[:5]
    ]

    # Recent payments (latest 5)
    recent_payments = [
        {
            "id": p.id,
            "amount": str(p.amount),
            "payment_status": p.payment_status,
            "payment_method": p.payment_method or "N/A",
            "transaction_id": p.transaction_id or "Pending",
            "created_at": p.created_at,
        }
        for p in user_payments.order_by("-created_at")[:5]
    ]

    return {
        "summary": {
            "total_trips": total_trips,
            "total_bookings": total_bookings,
            "completed_sessions": completed_sessions,
            "energy_consumed_kwh": str(total_energy),
            "total_spent": str(total_spent),
        },
        "total_trips": total_trips,
        "total_bookings": total_bookings,
        "charging_sessions": completed_sessions,
        "energy_consumed_kwh": str(total_energy),
        "total_spent": str(total_spent),
        "monthly_spending": monthly_spending,
        "monthly_energy": monthly_energy,
        "sessions_by_status": sessions_by_status,
        "recent_sessions": recent_sessions,
        "recent_payments": recent_payments,
    }


def get_operator_report_data(operator_user, range_param="30d"):
    """
    Computes comprehensive operational analytics for an operator across assigned stations.
    """
    assigned_stations = Station.objects.filter(operator=operator_user)

    if not assigned_stations.exists():
        return {
            "summary": {
                "assigned_stations": 0,
                "total_chargers": 0,
                "available_chargers": 0,
                "occupied_chargers": 0,
                "reserved_chargers": 0,
                "maintenance_chargers": 0,
                "active_sessions": 0,
                "completed_sessions": 0,
                "interrupted_sessions": 0,
                "energy_delivered_kwh": "0.00",
                "successful_revenue": "0.00",
                "pending_revenue": "0.00",
                "total_bookings": 0,
            },
            "monthly_revenue": [],
            "monthly_energy": [],
            "bookings_by_status": [],
            "sessions_by_status": [],
            "charger_status_breakdown": [],
            "station_performance": [],
            "recent_sessions": [],
            "recent_payments": [],
        }

    now = timezone.now()
    start_date = None

    if range_param == "7d":
        start_date = now - timedelta(days=7)
    elif range_param == "30d":
        start_date = now - timedelta(days=30)
    elif range_param == "3m":
        start_date = now - timedelta(days=90)
    elif range_param == "6m":
        start_date = now - timedelta(days=180)
    elif range_param == "12m":
        start_date = now - timedelta(days=365)

    chargers = Charger.objects.filter(station__in=assigned_stations)
    bookings_qs = Booking.objects.filter(station__in=assigned_stations)
    sessions_qs = ChargingSession.objects.filter(charger__station__in=assigned_stations)
    payments_qs = Payment.objects.filter(charging_session__charger__station__in=assigned_stations)

    if start_date:
        bookings_qs = bookings_qs.filter(created_at__gte=start_date)
        sessions_qs = sessions_qs.filter(created_at__gte=start_date)
        payments_qs = payments_qs.filter(created_at__gte=start_date)

    total_chargers = chargers.count()
    available_chargers = chargers.filter(status="AVAILABLE").count()
    occupied_chargers = chargers.filter(status="OCCUPIED").count()
    reserved_chargers = chargers.filter(status="RESERVED").count()
    maintenance_chargers = chargers.filter(status__in=["MAINTENANCE", "OUT_OF_SERVICE"]).count()

    active_sessions = sessions_qs.filter(session_status="ACTIVE").count()
    completed_sessions = sessions_qs.filter(session_status="COMPLETED").count()
    interrupted_sessions = sessions_qs.filter(session_status="INTERRUPTED").count()

    total_energy = sessions_qs.filter(session_status="COMPLETED").aggregate(
        total=Coalesce(Sum("energy_consumed_kwh"), Value(Decimal("0.00")))
    )["total"]

    successful_revenue = payments_qs.filter(payment_status="SUCCESS").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    pending_revenue = payments_qs.filter(payment_status="PENDING").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    # Time-series: Monthly Revenue
    spending_payments = payments_qs.filter(payment_status="SUCCESS").order_by("created_at")
    revenue_map = {}
    for p in spending_payments:
        if p.created_at:
            m_key = p.created_at.strftime("%Y-%m")
            m_label = p.created_at.strftime("%b %Y")
            if m_key not in revenue_map:
                revenue_map[m_key] = {"month": m_key, "label": m_label, "amount": Decimal("0.00")}
            revenue_map[m_key]["amount"] += (p.amount or Decimal("0.00"))

    monthly_revenue = [
        {"month": k, "label": v["label"], "amount": str(v["amount"])}
        for k, v in revenue_map.items()
    ]

    # Time-series: Monthly Energy
    completed_sessions_list = sessions_qs.filter(session_status="COMPLETED").order_by("created_at")
    energy_map = {}
    for s in completed_sessions_list:
        if s.created_at:
            m_key = s.created_at.strftime("%Y-%m")
            m_label = s.created_at.strftime("%b %Y")
            if m_key not in energy_map:
                energy_map[m_key] = {"month": m_key, "label": m_label, "energy_kwh": Decimal("0.00")}
            energy_map[m_key]["energy_kwh"] += (s.energy_consumed_kwh or Decimal("0.00"))

    monthly_energy = [
        {"month": k, "label": v["label"], "energy_kwh": str(v["energy_kwh"])}
        for k, v in energy_map.items()
    ]

    # Bookings by status
    b_status_qs = bookings_qs.values("booking_status").annotate(count=Count("id"))
    bookings_by_status = [
        {"status": item["booking_status"], "count": item["count"]}
        for item in b_status_qs
    ]

    # Sessions by status
    s_status_qs = sessions_qs.values("session_status").annotate(count=Count("id"))
    sessions_by_status = [
        {"status": item["session_status"], "count": item["count"]}
        for item in s_status_qs
    ]

    # Charger status breakdown
    charger_status_breakdown = [
        {"status": "AVAILABLE", "count": available_chargers},
        {"status": "OCCUPIED", "count": occupied_chargers},
        {"status": "RESERVED", "count": reserved_chargers},
        {"status": "MAINTENANCE", "count": maintenance_chargers},
    ]

    # Station performance
    station_performance = [
        {
            "id": s.id,
            "station_name": s.station_name,
            "city": s.city,
            "chargers_count": s.chargers.count(),
            "completed_sessions": sessions_qs.filter(charger__station=s, session_status="COMPLETED").count(),
            "revenue": str(payments_qs.filter(charging_session__charger__station=s, payment_status="SUCCESS").aggregate(
                total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
            )["total"])
        }
        for s in assigned_stations
    ]

    # Recent sessions (latest 5)
    recent_sessions = [
        {
            "id": s.id,
            "station": s.charger.station.station_name,
            "charger": s.charger.charger_name,
            "driver": s.booking.user.username if s.booking else "Driver",
            "energy_consumed_kwh": str(s.energy_consumed_kwh),
            "charging_cost": str(s.charging_cost),
            "session_status": s.session_status,
            "created_at": s.created_at,
        }
        for s in sessions_qs.order_by("-created_at")[:5]
    ]

    # Recent payments (latest 5)
    recent_payments = [
        {
            "id": p.id,
            "amount": str(p.amount),
            "payment_status": p.payment_status,
            "transaction_id": p.transaction_id or "Pending",
            "created_at": p.created_at,
        }
        for p in payments_qs.order_by("-created_at")[:5]
    ]

    return {
        "summary": {
            "assigned_stations": assigned_stations.count(),
            "total_chargers": total_chargers,
            "available_chargers": available_chargers,
            "occupied_chargers": occupied_chargers,
            "reserved_chargers": reserved_chargers,
            "maintenance_chargers": maintenance_chargers,
            "active_sessions": active_sessions,
            "completed_sessions": completed_sessions,
            "interrupted_sessions": interrupted_sessions,
            "energy_delivered_kwh": str(total_energy),
            "successful_revenue": str(successful_revenue),
            "pending_revenue": str(pending_revenue),
            "total_bookings": bookings_qs.count(),
        },
        "monthly_revenue": monthly_revenue,
        "monthly_energy": monthly_energy,
        "bookings_by_status": bookings_by_status,
        "sessions_by_status": sessions_by_status,
        "charger_status_breakdown": charger_status_breakdown,
        "station_performance": station_performance,
        "recent_sessions": recent_sessions,
        "recent_payments": recent_payments,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_dashboard(request):
    range_param = request.GET.get("range", "all")
    data = get_user_report_data(request.user, range_param)
    data["user"] = request.user.first_name or request.user.username
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsOperator])
def operator_dashboard(request):
    range_param = request.GET.get("range", "30d")
    data = get_operator_report_data(request.user, range_param)
    return Response(data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_dashboard(request):
    if request.user.role != "ADMIN":
        return Response({"error": "Only admin can access this dashboard."}, status=403)

    today = timezone.now().date()
    payments = Payment.objects.filter(payment_status="SUCCESS")

    today_rev = payments.filter(created_at__date=today).aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    total_rev = payments.aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

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
            "active_sessions": ChargingSession.objects.filter(session_status="ACTIVE").count(),
            "completed_sessions": ChargingSession.objects.filter(session_status="COMPLETED").count(),
        },
        "bookings": {
            "total_bookings": Booking.objects.count(),
            "today_bookings": Booking.objects.filter(booking_date=today).count(),
        },
        "revenue": {
            "today_revenue": str(today_rev),
            "total_revenue": str(total_rev),
        }
    })


class UserDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        range_param = request.GET.get("range", "all")
        return Response(get_user_report_data(request.user, range_param))