import os
import joblib
import numpy as np
import pandas as pd
from django.utils import timezone
from stations.models import Station
from charging.models import Charger, ChargingSession
from django.db.models import Count, Avg, Sum

MODEL_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "demand_forecast_model.joblib")
forecast_data = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

def predict_station_demand(station_id, timeframe="day"):
    """
    Predicts station charging demand using the trained ML model.
    Returns daily hourly forecast or 7-day weekly forecast breakdown.
    """
    try:
        station = Station.objects.get(id=station_id)
    except Station.DoesNotExist:
        return {"error": f"Station with ID {station_id} not found."}

    chargers = station.chargers.exclude(status="OUT_OF_SERVICE")
    total_chargers = max(1, chargers.count())
    avg_price_per_kwh = float(chargers.aggregate(Avg("price_per_kwh"))["price_per_kwh__avg"] or 15.0)
    avg_power_kw = float(chargers.aggregate(Avg("power_output_kw"))["power_output_kw__avg"] or 50.0)

    now = timezone.now()
    current_weekday = now.weekday()

    # Load ML models if available
    model_sessions = forecast_data.get("model_sessions") if forecast_data else None
    model_energy = forecast_data.get("model_energy") if forecast_data else None

    # Days mapping
    days_map = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    # 1. 24-HOUR DAILY HOURLY FORECAST
    raw_hourly = []
    all_session_counts = []

    for h in range(24):
        if model_sessions and model_energy:
            try:
                input_df = pd.DataFrame([[station.id, h, current_weekday]], columns=["station_id", "hour", "day_of_week"])
                pred_sessions = float(model_sessions.predict(input_df)[0])
                pred_energy = float(model_energy.predict(input_df)[0])
            except Exception:
                pred_sessions = 1.5 if 12 <= h <= 20 else 0.5
                pred_energy = pred_sessions * (avg_power_kw * 0.6)
        else:
            # Fallback heuristic
            if h in [12, 13, 17, 18, 19, 20]:
                pred_sessions = 3.5
            elif 8 <= h <= 22:
                pred_sessions = 2.0
            else:
                pred_sessions = 0.6
            pred_energy = pred_sessions * (avg_power_kw * 0.5)

        pred_sessions = max(0.2, round(pred_sessions, 1))
        pred_energy = max(1.0, round(pred_energy, 1))
        raw_hourly.append((h, pred_sessions, pred_energy))
        all_session_counts.append(pred_sessions)

    # Relative ranking: highest sessions -> PEAK, lowest -> LOW, remaining -> MODERATE
    high_threshold = np.percentile(all_session_counts, 70)
    low_threshold = np.percentile(all_session_counts, 30)

    hourly_forecast = []
    total_daily_sessions = 0
    total_daily_energy_kwh = 0.0
    peak_hour = 17
    max_hour_sessions = -1

    for h, pred_sessions, pred_energy in raw_hourly:
        utilization_pct = min(100.0, round((pred_sessions * 0.75 / total_chargers) * 100.0, 1))

        if pred_sessions >= high_threshold:
            status = "PEAK"
        elif pred_sessions <= low_threshold:
            status = "LOW"
        else:
            status = "MODERATE"

        if pred_sessions > max_hour_sessions:
            max_hour_sessions = pred_sessions
            peak_hour = h

        revenue = round(pred_energy * avg_price_per_kwh, 2)
        total_daily_sessions += pred_sessions
        total_daily_energy_kwh += pred_energy

        hourly_forecast.append({
            "hour": h,
            "time_label": f"{h:02d}:00",
            "expected_sessions": pred_sessions,
            "expected_energy_kwh": pred_energy,
            "utilization_pct": utilization_pct,
            "status": status,
            "projected_revenue_inr": revenue
        })


    total_daily_sessions = round(total_daily_sessions, 1)
    total_daily_energy_kwh = round(total_daily_energy_kwh, 1)
    total_daily_revenue = round(total_daily_energy_kwh * avg_price_per_kwh, 2)

    # 2. 7-DAY WEEKLY FORECAST
    weekly_forecast = []
    max_day_sessions = -1
    peak_day_name = "Friday"

    for w in range(7):
        day_name = days_map[w]
        day_sessions_sum = 0.0
        day_energy_sum = 0.0

        for h in range(24):
            if model_sessions and model_energy:
                try:
                    w_df = pd.DataFrame([[station.id, h, w]], columns=["station_id", "hour", "day_of_week"])
                    s_val = float(model_sessions.predict(w_df)[0])
                    e_val = float(model_energy.predict(w_df)[0])
                except Exception:
                    s_val = 1.5 if 12 <= h <= 20 else 0.5
                    e_val = s_val * (avg_power_kw * 0.6)

            else:
                s_val = 2.5 if w in [4, 5] else 1.8
                e_val = s_val * 25.0

            day_sessions_sum += max(0.1, s_val)
            day_energy_sum += max(0.5, e_val)

        day_sessions_sum = round(day_sessions_sum, 1)
        day_energy_sum = round(day_energy_sum, 1)
        day_revenue = round(day_energy_sum * avg_price_per_kwh, 2)
        avg_utilization = min(100.0, round((day_sessions_sum * 0.75 / (24 * total_chargers)) * 100.0 * 24, 1))

        if day_sessions_sum > max_day_sessions:
            max_day_sessions = day_sessions_sum
            peak_day_name = day_name

        weekly_forecast.append({
            "day_index": w,
            "day_name": day_name,
            "is_today": (w == current_weekday),
            "expected_sessions": day_sessions_sum,
            "expected_energy_kwh": day_energy_sum,
            "projected_revenue_inr": day_revenue,
            "avg_utilization_pct": avg_utilization
        })

    total_weekly_sessions = round(sum(d["expected_sessions"] for d in weekly_forecast), 1)
    total_weekly_energy = round(sum(d["expected_energy_kwh"] for d in weekly_forecast), 1)
    total_weekly_revenue = round(sum(d["projected_revenue_inr"] for d in weekly_forecast), 2)

    return {
        "station_id": station.id,
        "station_name": station.station_name,
        "city": station.city,
        "state": station.state,
        "total_chargers": total_chargers,
        "timeframe": timeframe,
        "today_summary": {
            "expected_sessions": total_daily_sessions,
            "expected_energy_kwh": total_daily_energy_kwh,
            "projected_revenue_inr": total_daily_revenue,
            "peak_demand_hour": f"{peak_hour:02d}:00",
            "peak_demand_day": peak_day_name,
            "avg_occupancy_pct": min(100.0, round((total_daily_sessions * 0.75 / (24 * total_chargers)) * 100, 1))
        },
        "weekly_summary": {
            "expected_sessions": total_weekly_sessions,
            "expected_energy_kwh": total_weekly_energy,
            "projected_revenue_inr": total_weekly_revenue,
            "peak_demand_day": peak_day_name,
            "avg_occupancy_pct": min(100.0, round((total_weekly_sessions * 0.75 / (7 * 24 * total_chargers)) * 100, 1))
        },
        "hourly_forecast": hourly_forecast,
        "weekly_forecast": weekly_forecast
    }

