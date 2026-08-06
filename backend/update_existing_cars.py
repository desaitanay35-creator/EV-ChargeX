import os
import sys
from decimal import Decimal
import django

# Setup Django Environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
django.setup()

from vehicles.models import Vehicle

def update_cars():
    print("--- Updating all car efficiencies in database ---")
    cars = Vehicle.objects.filter(vehicle_type="Car")
    updated_count = 0
    for car in cars:
        cap = float(car.battery_capacity)
        if cap > 0:
            # Set target range to 275 km (middle of 250 - 300 km)
            target_eff = 275.0 / cap
            car.efficiency = Decimal(f"{target_eff:.2f}")
            car.save()
            updated_count += 1
            print(f"Updated {car.brand} {car.model} ({car.registration_number}): Capacity={cap} kWh -> New Efficiency={car.efficiency} km/kWh (Range = {cap * float(car.efficiency):.1f} km)")
    print(f"Completed! Updated {updated_count} cars.")

if __name__ == "__main__":
    update_cars()
