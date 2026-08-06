import os
import sys
from django.core.management.base import BaseCommand
from ml_engine.train_demand_forecast import train_demand_forecast_model
from ml_engine.train_wait_time import train_model as train_wait_time_model

class Command(BaseCommand):
    help = "Re-trains all EV-ChargeX ML models (Demand Forecasting & Wait Time Prediction) from database session records."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Starting Automated ML Model Re-Training ---"))
        try:
            self.stdout.write("1. Training Station Demand Forecasting Model...")
            train_demand_forecast_model()

            self.stdout.write("\n2. Training Wait Time Queue Model...")
            train_wait_time_model()

            self.stdout.write(self.style.SUCCESS("\n[OK] Successfully re-trained and saved all ML model artifacts!"))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"[ERROR] Error during ML model re-training: {str(e)}"))
