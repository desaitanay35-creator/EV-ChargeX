from charging.models import ChargingSession
from django.db.models import Avg, F, ExpressionWrapper, DurationField


def predict_wait_time(station):
    """
    Estimate waiting time using previous charging sessions.
    Falls back to 45 minutes if no history exists.
    """

    active_sessions = ChargingSession.objects.filter(
        charger__station=station,
        session_status="ACTIVE"
    ).count()

    completed = ChargingSession.objects.filter(
        charger__station=station,
        session_status="COMPLETED",
        end_time__isnull=False
    ).annotate(
        duration=ExpressionWrapper(
            F("end_time") - F("start_time"),
            output_field=DurationField()
        )
    )

    avg = completed.aggregate(avg=Avg("duration"))["avg"]

    if avg:
        average_minutes = avg.total_seconds() / 60
    else:
        average_minutes = 45

    return round(active_sessions * average_minutes)