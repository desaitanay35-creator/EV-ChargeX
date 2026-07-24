from decimal import Decimal
from datetime import timedelta
from django.db.models import Count, Sum, Value, Q, Exists, OuterRef
from django.db.models.functions import Coalesce, TruncDay, TruncMonth
from django.utils import timezone

from users.models import User
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from payments.models import Payment


def get_admin_dashboard_summary():
    today = timezone.localdate()

    # User Metrics
    total_users = User.objects.count()
    active_users = User.objects.filter(is_active=True).count()
    blocked_users = User.objects.filter(is_active=False).count()
    verified_users = User.objects.filter(is_verified=True).count()
    user_role_count = User.objects.filter(role="USER").count()
    operator_role_count = User.objects.filter(role="OPERATOR").count()
    admin_role_count = User.objects.filter(role="ADMIN").count()

    # Operators with/without stations
    operator_qs = User.objects.filter(role="OPERATOR", is_active=True).annotate(
        station_count=Count("station")
    )
    operators_with_stations = operator_qs.filter(station_count__gt=0).count()
    operators_without_stations = operator_qs.filter(station_count=0).count()

    # Station Metrics
    total_stations = Station.objects.count()
    open_stations = Station.objects.filter(status="OPEN").count()
    closed_stations = Station.objects.filter(status="CLOSED").count()
    maintenance_stations = Station.objects.filter(status="MAINTENANCE").count()
    stations_without_chargers = Station.objects.annotate(
        charger_cnt=Count("chargers")
    ).filter(charger_cnt=0).count()

    # Charger Metrics
    total_chargers = Charger.objects.count()
    available_chargers = Charger.objects.filter(status="AVAILABLE").count()
    occupied_chargers = Charger.objects.filter(status="OCCUPIED").count()
    reserved_chargers = Charger.objects.filter(status="RESERVED").count()
    maintenance_chargers = Charger.objects.filter(status="MAINTENANCE").count()
    out_of_service_chargers = Charger.objects.filter(status="OUT_OF_SERVICE").count()

    # Session & Booking Metrics
    active_sessions_count = ChargingSession.objects.filter(session_status="ACTIVE").count()
    today_bookings_count = Booking.objects.filter(booking_date=today).count()
    upcoming_confirmed_bookings_count = Booking.objects.filter(
        booking_date__gte=today,
        booking_status="CONFIRMED"
    ).count()

    # Revenue Metrics (Lifetime)
    successful_revenue = Payment.objects.filter(payment_status="SUCCESS").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    pending_revenue = Payment.objects.filter(payment_status="PENDING").aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    return {
        "total_users": total_users,
        "active_users": active_users,
        "blocked_users": blocked_users,
        "verified_users": verified_users,
        "user_role_count": user_role_count,
        "operator_role_count": operator_role_count,
        "admin_role_count": admin_role_count,
        "operators": operator_role_count,
        "active_operators": operators_with_stations + operators_without_stations,
        "operators_with_stations": operators_with_stations,
        "operators_without_stations": operators_without_stations,
        "stations": total_stations,
        "open_stations": open_stations,
        "closed_stations": closed_stations,
        "maintenance_stations": maintenance_stations,
        "stations_without_chargers": stations_without_chargers,
        "chargers": total_chargers,
        "available_chargers": available_chargers,
        "occupied_chargers": occupied_chargers,
        "reserved_chargers": reserved_chargers,
        "maintenance_chargers": maintenance_chargers,
        "out_of_service_chargers": out_of_service_chargers,
        "active_sessions": active_sessions_count,
        "today_bookings": today_bookings_count,
        "upcoming_confirmed_bookings": upcoming_confirmed_bookings_count,
        "successful_revenue": str(successful_revenue),
        "pending_revenue": str(pending_revenue),
    }


def get_admin_period_summary(range_value="6m"):
    today = timezone.localdate()

    if range_value == "7d":
        start_date = today - timedelta(days=7)
    elif range_value == "30d":
        start_date = today - timedelta(days=30)
    elif range_value == "3m":
        start_date = today - timedelta(days=90)
    elif range_value == "12m":
        start_date = today - timedelta(days=365)
    elif range_value == "all":
        start_date = None
    else:  # default '6m'
        start_date = today - timedelta(days=180)

    payment_qs = Payment.objects.filter(payment_status="SUCCESS")
    session_qs = ChargingSession.objects.filter(session_status="COMPLETED")

    if start_date:
        payment_qs = payment_qs.filter(created_at__date__gte=start_date)
        session_qs = session_qs.filter(created_at__date__gte=start_date)

    period_revenue = payment_qs.aggregate(
        total=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )["total"]

    period_energy = session_qs.aggregate(
        total=Coalesce(Sum("energy_consumed_kwh"), Value(Decimal("0.00")))
    )["total"]

    return {
        "range": range_value,
        "start_date": start_date.isoformat() if start_date else None,
        "end_date": today.isoformat(),
        "period_successful_revenue": str(period_revenue),
        "period_successful_payments_count": payment_qs.count(),
        "period_completed_sessions": session_qs.count(),
        "period_energy_consumed_kwh": str(period_energy),
    }


def get_admin_recent_users(limit=10):
    qs = User.objects.order_by("-date_joined")[:limit]
    return [
        {
            "id": u.id,
            "username": u.username,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "date_joined": u.date_joined.isoformat() if u.date_joined else None,
        }
        for u in qs
    ]


def get_admin_recent_bookings(limit=10):
    qs = Booking.objects.select_related("user", "station", "charger").order_by("-created_at")[:limit]
    return [
        {
            "id": b.id,
            "booking_date": b.booking_date.isoformat() if b.booking_date else None,
            "booking_start_time": str(b.booking_start_time) if b.booking_start_time else None,
            "booking_end_time": str(b.booking_end_time) if b.booking_end_time else None,
            "booking_status": b.booking_status,
            "station_name": b.station.station_name if b.station else None,
            "charger_name": b.charger.charger_name if b.charger else None,
            "username": b.user.username if b.user else None,
            "is_qr_used": b.is_qr_used,
            "is_verified": b.is_verified,
        }
        for b in qs
    ]


def get_admin_active_sessions():
    qs = ChargingSession.objects.filter(
        session_status="ACTIVE"
    ).select_related(
        "charger",
        "charger__station",
        "vehicle",
        "booking",
        "booking__user"
    ).order_by("-start_time")

    now = timezone.now()
    results = []
    for s in qs:
        elapsed_minutes = int((now - s.start_time).total_seconds() / 60) if s.start_time else 0
        results.append({
            "id": s.id,
            "booking_id": s.booking_id,
            "station_name": s.charger.station.station_name if (s.charger and s.charger.station) else None,
            "charger_name": s.charger.charger_name if s.charger else None,
            "username": s.booking.user.username if (s.booking and s.booking.user) else None,
            "vehicle_reg": s.vehicle.registration_number if s.vehicle else None,
            "battery_before": str(s.battery_before) if s.battery_before is not None else None,
            "start_time": s.start_time.isoformat() if s.start_time else None,
            "elapsed_minutes": max(0, elapsed_minutes),
        })
    return results


def get_admin_revenue_trend(range_value="6m"):
    today = timezone.localdate()

    if range_value in ["7d", "30d"]:
        days = 7 if range_value == "7d" else 30
        start_date = today - timedelta(days=days)
        trunc_func = TruncDay
        date_format = "%Y-%m-%d"
    elif range_value == "3m":
        start_date = today - timedelta(days=90)
        trunc_func = TruncMonth
        date_format = "%Y-%m"
    elif range_value == "12m":
        start_date = today - timedelta(days=365)
        trunc_func = TruncMonth
        date_format = "%Y-%m"
    elif range_value == "all":
        start_date = None
        trunc_func = TruncMonth
        date_format = "%Y-%m"
    else:  # default 6m
        start_date = today - timedelta(days=180)
        trunc_func = TruncMonth
        date_format = "%Y-%m"

    qs = Payment.objects.filter(payment_status="SUCCESS")
    if start_date:
        qs = qs.filter(created_at__date__gte=start_date)

    trend_qs = qs.annotate(
        period=trunc_func("created_at")
    ).values("period").annotate(
        total_revenue=Sum("amount"),
        count=Count("id")
    ).order_by("period")

    return [
        {
            "date": item["period"].strftime(date_format) if item["period"] else None,
            "revenue": str(item["total_revenue"] or Decimal("0.00")),
            "count": item["count"]
        }
        for item in trend_qs
    ]


def get_admin_breakdowns():
    # Station Breakdown
    station_counts = dict(
        Station.objects.values("status").annotate(cnt=Count("id")).values_list("status", "cnt")
    )
    station_breakdown = [
        {"status": choice[0], "count": station_counts.get(choice[0], 0)}
        for choice in Station.STATUS_CHOICES
    ]

    # Charger Breakdown
    charger_counts = dict(
        Charger.objects.values("status").annotate(cnt=Count("id")).values_list("status", "cnt")
    )
    charger_breakdown = [
        {"status": choice[0], "count": charger_counts.get(choice[0], 0)}
        for choice in Charger.STATUS
    ]

    # Payment Breakdown
    payment_agg = Payment.objects.values("payment_status").annotate(
        cnt=Count("id"),
        amt=Coalesce(Sum("amount"), Value(Decimal("0.00")))
    )
    payment_map = {item["payment_status"]: item for item in payment_agg}

    payment_breakdown = []
    for choice in Payment.STATUS:
        code = choice[0]
        data = payment_map.get(code, {"cnt": 0, "amt": Decimal("0.00")})
        payment_breakdown.append({
            "status": code,
            "count": data["cnt"],
            "amount": str(data["amt"])
        })

    return {
        "station_status_breakdown": station_breakdown,
        "charger_status_breakdown": charger_breakdown,
        "payment_status_breakdown": payment_breakdown,
    }


def get_admin_system_alerts():
    today = timezone.localdate()
    alerts = []

    # 1. Operators without stations
    unassigned_ops_cnt = User.objects.filter(
        role="OPERATOR", is_active=True
    ).annotate(
        st_count=Count("station")
    ).filter(st_count=0).count()

    if unassigned_ops_cnt > 0:
        alerts.append({
            "id": "operator-without-station",
            "type": "WARNING",
            "category": "OPERATOR",
            "title": "Operators without Assigned Station",
            "message": f"{unassigned_ops_cnt} active operator(s) have no assigned stations.",
            "count": unassigned_ops_cnt,
            "target": "/system-admin/operators",
            "action_available": True
        })

    # 2. Stations without chargers
    empty_stations_cnt = Station.objects.annotate(
        ch_count=Count("chargers")
    ).filter(ch_count=0).count()

    if empty_stations_cnt > 0:
        alerts.append({
            "id": "station-without-charger",
            "type": "WARNING",
            "category": "STATION",
            "title": "Stations without Chargers",
            "message": f"{empty_stations_cnt} station(s) currently have zero registered chargers.",
            "count": empty_stations_cnt,
            "target": None,
            "action_available": False
        })

    # 3. Closed/Maintenance stations with future pending/confirmed bookings
    impacted_stations_cnt = Station.objects.filter(
        status__in=["CLOSED", "MAINTENANCE"]
    ).filter(
        booking__booking_date__gte=today,
        booking__booking_status__in=["PENDING", "CONFIRMED"]
    ).distinct().count()

    if impacted_stations_cnt > 0:
        alerts.append({
            "id": "closed-station-with-bookings",
            "type": "CRITICAL",
            "category": "STATION",
            "title": "Closed/Maintenance Station Booking Conflicts",
            "message": f"{impacted_stations_cnt} closed or maintenance station(s) have upcoming bookings.",
            "count": impacted_stations_cnt,
            "target": None,
            "action_available": False
        })

    # 4. Chargers under maintenance
    maint_chargers_cnt = Charger.objects.filter(status="MAINTENANCE").count()
    if maint_chargers_cnt > 0:
        alerts.append({
            "id": "charger-under-maintenance",
            "type": "INFO",
            "category": "CHARGER",
            "title": "Chargers Under Maintenance",
            "message": f"{maint_chargers_cnt} charger(s) are currently under scheduled maintenance.",
            "count": maint_chargers_cnt,
            "target": None,
            "action_available": False
        })

    # 5. Out of service chargers
    oos_chargers_cnt = Charger.objects.filter(status="OUT_OF_SERVICE").count()
    if oos_chargers_cnt > 0:
        alerts.append({
            "id": "charger-out-of-service",
            "type": "WARNING",
            "category": "CHARGER",
            "title": "Out of Service Chargers",
            "message": f"{oos_chargers_cnt} charger(s) are reported out of service.",
            "count": oos_chargers_cnt,
            "target": None,
            "action_available": False
        })

    # 6. Occupied charger without active session
    active_session_subquery = ChargingSession.objects.filter(
        charger=OuterRef("pk"),
        session_status="ACTIVE"
    )
    occupied_without_session_cnt = Charger.objects.filter(
        status="OCCUPIED"
    ).annotate(
        has_active=Exists(active_session_subquery)
    ).filter(has_active=False).count()

    if occupied_without_session_cnt > 0:
        alerts.append({
            "id": "occupied-charger-without-session",
            "type": "WARNING",
            "category": "CHARGER",
            "title": "Occupied Charger Status Mismatch",
            "message": f"{occupied_without_session_cnt} charger(s) marked OCCUPIED have no active session.",
            "count": occupied_without_session_cnt,
            "target": None,
            "action_available": False
        })

    # 7. Active session whose charger is not OCCUPIED
    active_session_mismatch_cnt = ChargingSession.objects.filter(
        session_status="ACTIVE"
    ).exclude(
        charger__status="OCCUPIED"
    ).count()

    if active_session_mismatch_cnt > 0:
        alerts.append({
            "id": "active-session-charger-mismatch",
            "type": "WARNING",
            "category": "SESSION",
            "title": "Active Session Charger Mismatch",
            "message": f"{active_session_mismatch_cnt} active session(s) are on chargers not marked OCCUPIED.",
            "count": active_session_mismatch_cnt,
            "target": None,
            "action_available": False
        })

    # 8. Failed payments in past 30 days
    thirty_days_ago = today - timedelta(days=30)
    failed_payments_cnt = Payment.objects.filter(
        payment_status="FAILED",
        created_at__date__gte=thirty_days_ago
    ).count()

    if failed_payments_cnt > 0:
        alerts.append({
            "id": "failed-payments-recent",
            "type": "WARNING",
            "category": "PAYMENT",
            "title": "Failed Payments Detected",
            "message": f"{failed_payments_cnt} failed payment(s) recorded in the last 30 days.",
            "count": failed_payments_cnt,
            "target": None,
            "action_available": False
        })

    # 9. Interrupted sessions in past 7 days
    seven_days_ago = today - timedelta(days=7)
    interrupted_cnt = ChargingSession.objects.filter(
        session_status="INTERRUPTED",
        created_at__date__gte=seven_days_ago
    ).count()

    if interrupted_cnt > 0:
        alerts.append({
            "id": "interrupted-sessions-recent",
            "type": "WARNING",
            "category": "SESSION",
            "title": "Interrupted Charging Sessions",
            "message": f"{interrupted_cnt} session(s) were unexpectedly interrupted in the last 7 days.",
            "count": interrupted_cnt,
            "target": None,
            "action_available": False
        })

    # Sort alerts by severity: CRITICAL -> WARNING -> INFO
    severity_order = {"CRITICAL": 0, "WARNING": 1, "INFO": 2}
    alerts.sort(key=lambda x: severity_order.get(x["type"], 3))

    return alerts
