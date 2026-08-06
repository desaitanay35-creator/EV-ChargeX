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

from charging.models import ChargingSession

def train_model():
    print("--- EV-ChargeX Wait Time ML Model Training Script ---")
    
    # 1. Fetch data from Django database
    completed_sessions = ChargingSession.objects.filter(
        session_status="COMPLETED",
        end_time__isnull=False
    )
    
    session_count = completed_sessions.count()
    print(f"Found {session_count} completed charging sessions in database.")
    
    records = []
    
    if session_count >= 10:
        print("Using historical database records to train the model...")
        for s in completed_sessions:
            duration_mins = (s.end_time - s.start_time).total_seconds() / 60.0
            power_kw = float(s.charger.power_output_kw) if s.charger else 50.0
            hour = s.start_time.hour
            weekday = s.start_time.weekday()
            records.append({
                "power_output_kw": power_kw,
                "hour": hour,
                "day_of_week": weekday,
                "duration_mins": duration_mins
            })
        df = pd.DataFrame(records)
    else:
        print("Insufficient database records (< 10). Generating synthetic training dataset...")
        np.random.seed(42)
        n_samples = 500
        
        # Randomly choose charger power, hours, and weekdays
        power_choices = [7.2, 22.0, 50.0, 150.0]
        powers = np.random.choice(power_choices, size=n_samples)
        hours = np.random.randint(0, 24, size=n_samples)
        weekdays = np.random.randint(0, 7, size=n_samples)
        
        durations = []
        for p, h, w in zip(powers, hours, weekdays):
            # Base charging duration in minutes depending on charger power
            if p == 7.2:
                base = np.random.uniform(200, 360)
            elif p == 22.0:
                base = np.random.uniform(70, 150)
            elif p == 50.0:
                base = np.random.uniform(30, 60)
            else:  # 150 kW
                base = np.random.uniform(12, 30)
                
            # Traffic/peak hours adjustment (12-14h, 17-20h)
            if h in [12, 13, 17, 18, 19]:
                base *= np.random.uniform(1.1, 1.25)
                
            # Weekend adjustment (longer charges on Saturday/Sunday)
            if w >= 5:
                base *= np.random.uniform(1.05, 1.15)
                
            durations.append(round(base, 2))
            
        df = pd.DataFrame({
            "power_output_kw": powers,
            "hour": hours,
            "day_of_week": weekdays,
            "duration_mins": durations
        })
        
    # Save the training data to a CSV file for user inspection
    data_csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "training_data.csv")
    df.to_csv(data_csv_path, index=False)
    print(f"Training data saved for inspection to: {data_csv_path}")
    print("\nPreview of training data (First 10 rows):")
    print(df.head(10).to_string())
    print("\n")

    # 2. Split features and target
    X = df[["power_output_kw", "hour", "day_of_week"]]
    y = df["duration_mins"]
    
    print(f"Training RandomForestRegressor on {len(df)} samples...")
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    
    # 3. Save the model
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "wait_time_model.joblib")
    joblib.dump(model, model_path)
    
    print(f"Model successfully saved to: {model_path}")
    print("Feature importances:")
    for feature, importance in zip(X.columns, model.feature_importances_):
        print(f" - {feature}: {importance:.4f}")
    print("-----------------------------------------------------")

if __name__ == "__main__":
    train_model()
