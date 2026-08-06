import os
import joblib
from django.utils import timezone
from decimal import Decimal
from charging.models import ChargingSession, Charger
from django.db.models import Avg, F, ExpressionWrapper, DurationField

# Load the ML model if it exists
MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "wait_time_model.joblib")
ml_model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

def predict_wait_time(station):
    """
    Estimate waiting time using the ML model.
    If all chargers are occupied, predicts the remaining time for active sessions
    and returns the minimum remaining time (when the first charger becomes free).
    Falls back to a heuristic if no ML model exists.
    """
    # 1. Check charger availability
    available_chargers = station.chargers.filter(status="AVAILABLE")
    if available_chargers.exists():
        return 0

    active_sessions = ChargingSession.objects.filter(
        charger__station=station,
        session_status="ACTIVE"
    )
    if not active_sessions.exists():
        return 0

    # 2. If ML model is available, perform queue duration prediction
    if ml_model:
        current_time = timezone.now()
        remaining_times = []
        
        for session in active_sessions:
            charger = session.charger
            if not charger:
                continue
                
            # Features: [power_output_kw, hour, day_of_week]
            power = float(charger.power_output_kw) if charger and charger.power_output_kw else 50.0
            hour = session.start_time.hour
            weekday = session.start_time.weekday()
            
            # Predict total duration in minutes
            try:
                predicted_duration = ml_model.predict([[power, hour, weekday]])[0]
            except Exception:
                predicted_duration = 45.0  # Fallback duration
                
            # Calculate elapsed time
            elapsed_mins = (current_time - session.start_time).total_seconds() / 60.0
            
            # Remaining time is predicted duration minus elapsed time
            remaining_mins = max(2.0, predicted_duration - elapsed_mins)

            # Factor in reserved booking end time if available
            if session.booking and session.booking.booking_end_time and session.booking.booking_date:
                try:
                    booking_end_dt = timezone.datetime.combine(session.booking.booking_date, session.booking.booking_end_time)
                    if timezone.is_naive(booking_end_dt):
                        booking_end_dt = timezone.make_aware(booking_end_dt, timezone.get_current_timezone())
                    booking_remaining_mins = (booking_end_dt - current_time).total_seconds() / 60.0
                    if booking_remaining_mins > 0:
                        remaining_mins = max(remaining_mins, booking_remaining_mins)
                except Exception:
                    pass

            remaining_times.append(remaining_mins)
            
        if remaining_times:
            # Wait time is when the first charger becomes free
            return round(min(remaining_times))

    # 3. Fallback Heuristic / Average
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

    return round(active_count * average_minutes)