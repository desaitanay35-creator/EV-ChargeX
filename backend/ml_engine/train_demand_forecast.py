import os
import sys
import django
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evchargex.settings")
django.setup()

from charging.models import ChargingSession, Charger
from stations.models import Station

def train_demand_forecast_model():
    print("--- EV-ChargeX Demand Forecasting ML Training Script ---")

    # 1. Fetch completed charging sessions
    completed_sessions = ChargingSession.objects.filter(
        session_status="COMPLETED",
        end_time__isnull=False
    ).select_related('charger', 'charger__station')

    total_sessions_count = completed_sessions.count()
    print(f"Total historical completed sessions found in DB: {total_sessions_count}")

    records = []

    if total_sessions_count >= 10:
        print("Extracting feature vectors from database records...")
        for session in completed_sessions:
            if not session.charger or not session.charger.station:
                continue
            
            station_id = session.charger.station.id
            power_kw = float(session.charger.power_output_kw or 50.0)
            hour = session.start_time.hour
            weekday = session.start_time.weekday()
            duration_mins = (session.end_time - session.start_time).total_seconds() / 60.0
            energy_kwh = float(session.energy_consumed_kwh or 0.0)
            cost = float(session.charging_cost or 0.0)

            records.append({
                "station_id": station_id,
                "power_kw": power_kw,
                "hour": hour,
                "day_of_week": weekday,
                "duration_mins": duration_mins,
                "energy_kwh": energy_kwh,
                "cost": cost,
            })
        
        df = pd.DataFrame(records)
    else:
        print("Generating synthetic historical dataset for initial cold-start model...")
        np.random.seed(42)
        n_samples = 1000
        stations = list(Station.objects.values_list('id', flat=True)) or [1, 2, 3]
        
        station_ids = np.random.choice(stations, size=n_samples)
        hours = np.random.randint(0, 24, size=n_samples)
        weekdays = np.random.randint(0, 7, size=n_samples)
        powers = np.random.choice([7.2, 22.0, 50.0, 150.0], size=n_samples)

        durations = []
        energies = []
        costs = []

        for p, h, w in zip(powers, hours, weekdays):
            dur = np.random.uniform(20, 90) if p >= 50 else np.random.uniform(90, 300)
            if h in [12, 13, 17, 18, 19]:
                dur *= 1.2
            eng = (dur / 60.0) * (p * 0.7)
            cst = eng * 15.0
            durations.append(dur)
            energies.append(eng)
            costs.append(cst)

        df = pd.DataFrame({
            "station_id": station_ids,
            "power_kw": powers,
            "hour": hours,
            "day_of_week": weekdays,
            "duration_mins": durations,
            "energy_kwh": energies,
            "cost": costs
        })

    # Group by (station_id, hour, day_of_week) to create demand intensity targets
    print(f"Aggregating {len(df)} records by station, hour, and day of week...")
    grouped = df.groupby(["station_id", "hour", "day_of_week"]).agg(
        session_count=("duration_mins", "count"),
        total_energy_kwh=("energy_kwh", "sum"),
        avg_duration_mins=("duration_mins", "mean"),
        total_revenue=("cost", "sum")
    ).reset_index()

    # Features: [station_id, hour, day_of_week]
    X = grouped[["station_id", "hour", "day_of_week"]]
    y_sessions = grouped["session_count"]
    y_energy = grouped["total_energy_kwh"]

    print("Training RandomForest Demand Forecast Model...")
    model_sessions = RandomForestRegressor(n_estimators=100, random_state=42)
    model_sessions.fit(X, y_sessions)

    model_energy = RandomForestRegressor(n_estimators=100, random_state=42)
    model_energy.fit(X, y_energy)

    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "demand_forecast_model.joblib")

    saved_data = {
        "model_sessions": model_sessions,
        "model_energy": model_energy,
        "features": ["station_id", "hour", "day_of_week"],
        "total_training_samples": len(grouped)
    }

    joblib.dump(saved_data, model_path)
    print(f"Demand Forecasting Model saved successfully to: {model_path}")
    print("-----------------------------------------------------")

if __name__ == "__main__":
    train_demand_forecast_model()
