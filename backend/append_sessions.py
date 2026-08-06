import os
import sys
import random
import uuid
import numpy as np
from datetime import datetime, timedelta, timezone
from decimal import Decimal
import django

# Setup Django environment
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "evchargex.settings")
django.setup()

from django.db import transaction
from stations.models import Station
from charging.models import Charger, ChargingSession
from vehicles.models import Vehicle
from bookings.models import Booking
from users.models import User

def generate_and_append_sessions(num_records=4000):
    print(f"--- EV-ChargeX Seed Generator: Appending {num_records} Charging Sessions ---")

    stations = list(Station.objects.all().prefetch_related('chargers'))
    chargers = list(Charger.objects.select_related('station').all())
    vehicles = list(Vehicle.objects.all())
    users = list(User.objects.filter(role='USER')) or list(User.objects.all())

    if not stations or not chargers or not vehicles or not users:
        print("Error: Missing required base models in DB.")
        return

    print(f"Found {len(stations)} stations, {len(chargers)} chargers, {len(vehicles)} vehicles, {len(users)} users.")

    random.seed(42)
    np.random.seed(42)

    # Build station profiles
    station_profiles = {}
    for st in stations:
        tier = random.choice(['HIGHWAY_HUB', 'CITY_CENTER', 'SUBURBAN', 'LOCAL_MALL'])
        if tier == 'HIGHWAY_HUB':
            weight = random.uniform(3.5, 6.0)
            weekend_mult = random.uniform(1.8, 2.5)
            peak_hours = [11, 12, 13, 17, 18, 19, 20]
        elif tier == 'CITY_CENTER':
            weight = random.uniform(2.0, 3.5)
            weekend_mult = random.uniform(0.5, 0.8)
            peak_hours = [8, 9, 10, 12, 17, 18, 19]
        elif tier == 'LOCAL_MALL':
            weight = random.uniform(1.0, 2.0)
            weekend_mult = random.uniform(1.5, 2.0)
            peak_hours = [13, 14, 17, 18, 19, 20, 21]
        else: # SUBURBAN
            weight = random.uniform(0.2, 0.7)
            weekend_mult = random.uniform(0.9, 1.1)
            peak_hours = [18, 19, 20]

        station_profiles[st.id] = {
            "weight": weight,
            "weekend_mult": weekend_mult,
            "peak_hours": peak_hours,
            "tier": tier
        }

    station_weights = np.array([station_profiles[st.id]["weight"] for st in stations])
    station_probs = station_weights / station_weights.sum()

    print("Generating 4000 realistic sessions with high station-to-station & peak-to-off-peak contrast...")

    now_date = datetime.now(timezone.utc).date()
    created_count = 0

    with transaction.atomic():
        for i in range(num_records):
            chosen_station = np.random.choice(stations, p=station_probs)
            st_chargers = list(chosen_station.chargers.all())
            if not st_chargers:
                st_chargers = chargers

            chosen_charger = random.choice(st_chargers)
            chosen_vehicle = random.choice(vehicles)
            chosen_user = random.choice(users)

            profile = station_profiles[chosen_station.id]

            days_ago = random.randint(0, 90)
            session_date = now_date - timedelta(days=days_ago)
            weekday = session_date.weekday()

            # Hourly distribution
            hourly_weights = np.ones(24) * 0.05
            for h in range(24):
                if h in profile["peak_hours"]:
                    hourly_weights[h] = random.uniform(4.0, 8.0)
                elif 8 <= h <= 22:
                    hourly_weights[h] = random.uniform(0.6, 1.4)
                else:
                    hourly_weights[h] = random.uniform(0.01, 0.08)

                if weekday >= 5:
                    hourly_weights[h] *= profile["weekend_mult"]

            h_probs = hourly_weights / hourly_weights.sum()
            chosen_hour = np.random.choice(range(24), p=h_probs)
            chosen_minute = random.randint(0, 59)

            start_time = datetime(
                session_date.year, session_date.month, session_date.day,
                chosen_hour, chosen_minute, tzinfo=timezone.utc
            )

            power = float(chosen_charger.power_output_kw or 50.0)
            if power >= 100:
                duration_mins = random.uniform(15, 35)
            elif power >= 40:
                duration_mins = random.uniform(30, 65)
            else:
                duration_mins = random.uniform(90, 240)

            end_time = start_time + timedelta(minutes=duration_mins)

            battery_before = Decimal(str(round(random.uniform(10.0, 35.0), 2)))
            battery_after = Decimal(str(round(random.uniform(80.0, 98.0), 2)))
            diff = battery_after - battery_before

            capacity = Decimal(str(chosen_vehicle.battery_capacity or 40.0))
            energy_consumed = round((diff / Decimal('100.0')) * capacity, 2)

            price_per_kwh = Decimal(str(chosen_charger.price_per_kwh or 15.0))
            cost = round(energy_consumed * price_per_kwh, 2)

            # Create Booking
            booking = Booking.objects.create(
                user=chosen_user,
                vehicle=chosen_vehicle,
                station=chosen_station,
                charger=chosen_charger,
                booking_date=session_date,
                booking_start_time=start_time.time(),
                booking_end_time=end_time.time(),
                estimated_duration=int(duration_mins),
                booking_status='COMPLETED',
                qr_code=str(uuid.uuid4()),
                is_qr_used=True,
                is_verified=True
            )

            # Create ChargingSession
            ChargingSession.objects.create(
                booking=booking,
                charger=chosen_charger,
                vehicle=chosen_vehicle,
                start_time=start_time,
                end_time=end_time,
                battery_before=battery_before,
                battery_after=battery_after,
                energy_consumed_kwh=energy_consumed,
                charging_cost=cost,
                session_status='COMPLETED'
            )

            created_count += 1
            if created_count % 1000 == 0:
                print(f"Created {created_count} / {num_records} sessions...")

    total_now = ChargingSession.objects.count()
    print(f"\nSuccessfully appended {created_count} sessions to DB!")
    print(f"Total Charging Sessions in DB now: {total_now}")

if __name__ == "__main__":
    generate_and_append_sessions(4000)
