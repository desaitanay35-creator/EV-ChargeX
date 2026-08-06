import os
import sys
import random
from decimal import Decimal
import django

# Setup Django Environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
django.setup()

from stations.models import Station
from charging.models import Charger

# Defined Routes with Coordinate Checkpoints
HIGHWAY_ROUTES = {
    "NH-48 (Ahmedabad-Vapi)": [
        (23.0225, 72.5714), (22.6916, 72.8634), (22.3072, 73.1812), 
        (21.7051, 72.9982), (21.1702, 72.8311), (20.5993, 72.9342), (20.3779, 72.9041)
    ],
    "NH-47 (Ahmedabad-Rajkot)": [
        (23.0225, 72.5714), (22.8122, 72.2612), (22.5654, 71.8152),
        (22.4285, 71.4231), (22.3039, 70.8022)
    ],
    "NH-27 (Rajkot-Somnath)": [
        (22.3039, 70.8022), (21.9612, 70.7911), (21.7610, 70.6272),
        (21.5222, 70.4578), (20.9018, 70.4005)
    ],
    "NH-41 (Morbi-Bhuj)": [
        (22.8121, 70.8234), (23.2512, 70.6121), (23.0805, 70.1264), (23.2718, 69.6698)
    ]
}

def generate_network():
    print("--- Generating Gujarat Highway EV Charging Network ---")
    station_count = 0
    charger_count = 0

    for route_name, coords in HIGHWAY_ROUTES.items():
        for idx, (lat, lng) in enumerate(coords):
            station_name = f"Highway Stop ({route_name}) - Point {idx+1}"
            
            # Create Station
            station, created = Station.objects.get_or_create(
                station_name=station_name,
                defaults={
                    "address": f"KM {idx * 50} on {route_name}",
                    "city": "Highway Point",
                    "state": "Gujarat",
                    "latitude": Decimal(str(lat)),
                    "longitude": Decimal(str(lng)),
                    "status": "OPEN",
                    "rating": round(random.uniform(4.0, 4.9), 1),
                    "booking_enabled": True,
                    "external_source": "MANUAL"
                }
            )
            if created:
                station_count += 1
                
                # Determine randomized charger count (minimum 2, maximum 5)
                num_chargers = random.randint(2, 5)
                for c_idx in range(1, num_chargers + 1):
                    # Randomize connector and power configurations
                    connector = random.choice(["CCS2", "CCS2", "Type2"])
                    power = random.choice([Decimal("30.0"), Decimal("60.0"), Decimal("120.0")])
                    
                    Charger.objects.create(
                        station=station,
                        charger_name=f"Charger #{c_idx}",
                        charger_number=f"CH-{station_count:03d}-{c_idx}",
                        charger_type="DC" if power > 30 else "AC",
                        connector_type=connector,
                        power_output_kw=power,
                        voltage=400,
                        current=150,
                        price_per_kwh=Decimal("15.50"),
                        status="AVAILABLE"
                    )
                    charger_count += 1

    print(f"COMPLETED: Generated {station_count} new highway stations and {charger_count} chargers.")

if __name__ == "__main__":
    generate_network()
