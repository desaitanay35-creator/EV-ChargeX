import os
import sys
import random
from datetime import datetime, timedelta, time
from decimal import Decimal
from django.utils import timezone

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'evchargex.settings')
import django
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()
from vehicles.models import Vehicle
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from payments.models import Payment
from reviews.models import Review

def seed():
    print("--- Starting EV-ChargeX Database Seeder ---")

    # 1. Fetch Gujarat Stations and Chargers
    stations = [s for s in Station.objects.all() if s.chargers.exists()]
    if not stations:
        print("ERROR: No stations with chargers found in the database. Please add stations and chargers first.")
        sys.exit(1)
        
    print(f"Found {len(stations)} existing stations with chargers.")

    # 2. Clear old transactions to start fresh and avoid conflicts
    print("Clearing old transaction tables (Review, Payment, ChargingSession, Booking, Vehicle, non-admin Users)...")
    Review.objects.all().delete()
    Payment.objects.all().delete()
    ChargingSession.objects.all().delete()
    Booking.objects.all().delete()
    Vehicle.objects.all().delete()
    User.objects.filter(role='USER').delete()

    # 3. Create Test Users (Customers)
    print("Seeding test users...")
    users = []
    user_data = [
        ("aravind_shah", "aravind@example.com", "Aravind", "Shah"),
        ("priya_patel", "priya@example.com", "Priya", "Patel"),
        ("rahul_sharma", "rahul@example.com", "Rahul", "Sharma"),
        ("neha_mehta", "neha@example.com", "Neha", "Mehta"),
        ("amit_joshi", "amit@example.com", "Amit", "Joshi"),
        ("pooja_desai", "pooja@example.com", "Pooja", "Desai"),
        ("vikram_rathod", "vikram@example.com", "Vikram", "Rathod"),
        ("sanjana_vyas", "sanjana@example.com", "Sanjana", "Vyas"),
        ("deepak_trivedi", "deepak@example.com", "Deepak", "Trivedi"),
        ("ananya_dave", "ananya@example.com", "Ananya", "Dave")
    ]
    
    for username, email, first, last in user_data:
        u = User.objects.create_user(
            username=username,
            email=email,
            password="password123",
            first_name=first,
            last_name=last,
            role="USER",
            is_verified=True,
            phone=f"+9198{random.randint(10000000, 99999999)}"
        )
        users.append(u)

    # 4. Create Vehicles
    print("Seeding vehicles...")
    vehicles = {u: [] for u in users}
    vehicle_models = [
        ("Car", "Tata", "Nexon EV", 40.0, 140.0, "CCS2"),
        ("Car", "MG", "ZS EV", 50.3, 150.0, "CCS2"),
        ("Car", "BYD", "Atto 3", 60.4, 160.0, "CCS2"),
        ("Car", "Hyundai", "Ioniq 5", 72.6, 170.0, "CCS2"),
        ("Car", "Tata", "Tiago EV", 24.0, 120.0, "CCS2"),
        ("Bike", "Ola", "S1 Pro", 4.0, 40.0, "Type2"),
        ("Bike", "TVS", "iQube", 3.0, 35.0, "Type2"),
        ("Bike", "Ather", "450X", 3.7, 38.0, "Type2")
    ]

    reg_num_counter = 1000
    for u in users:
        # Each user gets 1 or 2 vehicles
        num_veh = random.choice([1, 2])
        for _ in range(num_veh):
            v_type, brand, model, cap, eff, conn = random.choice(vehicle_models)
            if v_type == "Car":
                eff = round(275.0 / cap, 2)
            v = Vehicle.objects.create(
                user=u,
                vehicle_type=v_type,
                brand=brand,
                model=model,
                registration_number=f"GJ01EV{reg_num_counter}",
                battery_capacity=Decimal(str(cap)),
                current_battery_percentage=Decimal("50.0"),
                connector_type=conn,
                efficiency=Decimal(str(eff)),
                manufacturing_year=random.choice([2021, 2022, 2023, 2024]),
                color=random.choice(["White", "Grey", "Blue", "Black", "Silver"])
            )
            vehicles[u].append(v)
            reg_num_counter += 1

    # 5. Generate Historical Bookings, Sessions, and Payments
    print("Generating timeseries booking & charging history for the past 30 days...")
    start_date = timezone.now().date() - timedelta(days=30)
    end_date = timezone.now().date() - timedelta(days=1)
    
    sessions_created = 0
    current_date = start_date
    
    while current_date <= end_date:
        # Generate 100 to 130 sessions per day across the network
        num_sessions = random.randint(100, 130)
        for _ in range(num_sessions):
            station = random.choice(stations)
            charger = random.choice(station.chargers.all())
            user = random.choice(users)
            vehicle = random.choice(vehicles[user])

            # Ensure connector type compatibility
            if vehicle.connector_type != charger.connector_type:
                # Dynamically set vehicle connector type to match charger for this simulation
                vehicle.connector_type = charger.connector_type
                vehicle.save()

            # Hour of day distribution (peak times vs off-peak times)
            if random.random() < 0.65:
                hour = random.choice([9, 10, 11, 12, 17, 18, 19, 20])
            else:
                hour = random.choice([0, 1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15, 16, 21, 22, 23])

            minute = random.choice([0, 15, 30, 45])
            start_time = timezone.make_aware(datetime.combine(current_date, time(hour, minute)))

            # Calculate charging metrics based on battery capacity & charger speed
            battery_before = random.uniform(10.0, 30.0)
            battery_after = random.uniform(75.0, 95.0)
            pct_gain = battery_after - battery_before
            energy_delivered = (Decimal(str(pct_gain)) / Decimal("100.0")) * vehicle.battery_capacity
            
            # Duration (mins) = (energy_delivered / power_output_kw) * 60
            duration_mins = int((float(energy_delivered) / float(charger.power_output_kw)) * 60)
            duration_mins = max(15, min(duration_mins, 360)) # Bounded between 15m and 6h
            
            end_time = start_time + timedelta(minutes=duration_mins)

            # Create Booking
            booking = Booking.objects.create(
                user=user,
                vehicle=vehicle,
                station=station,
                charger=charger,
                booking_date=current_date,
                booking_start_time=start_time.time(),
                booking_end_time=end_time.time(),
                estimated_duration=duration_mins,
                booking_status="COMPLETED",
                is_verified=True,
                is_qr_used=True
            )
            Booking.objects.filter(id=booking.id).update(created_at=start_time)

            # Create ChargingSession
            cost = energy_delivered * charger.price_per_kwh
            session = ChargingSession.objects.create(
                booking=booking,
                charger=charger,
                vehicle=vehicle,
                start_time=start_time,
                end_time=end_time,
                battery_before=Decimal(str(battery_before)),
                battery_after=Decimal(str(battery_after)),
                energy_consumed_kwh=energy_delivered,
                charging_cost=cost,
                session_status="COMPLETED"
            )
            ChargingSession.objects.filter(id=session.id).update(created_at=start_time)

            # Create Payment
            payment = Payment.objects.create(
                user=user,
                charging_session=session,
                amount=cost,
                payment_method=random.choice(["UPI", "DEBIT_CARD", "CASH"]),
                payment_status="SUCCESS",
                transaction_id=f"TXN{random.randint(1000000000, 9999999999)}",
                paid_at=end_time
            )
            Payment.objects.filter(id=payment.id).update(created_at=start_time)

            # Create Review (with unique constraint check)
            if random.random() < 0.35:
                if not Review.objects.filter(user=user, station=station).exists():
                    review = Review.objects.create(
                        user=user,
                        station=station,
                        rating=random.choice([4, 5, 4, 5, 3]),
                        comment=random.choice([
                            "Highly recommended. Speed was close to advertised rate.",
                            "Clean and well-maintained facility. Highly recommended.",
                            "Fast charging hub, easy payment via UPI.",
                            "Very convenient stop along this highway route.",
                            "Excellent infrastructure. Chargers are always functional."
                        ])
                    )
                    Review.objects.filter(id=review.id).update(created_at=start_time)
            
            sessions_created += 1

        current_date += timedelta(days=1)

    print(f"SUCCESS: Seeded {sessions_created} charging sessions, bookings, and payments over the last 30 days!")
    print("Database seeding completed.")

if __name__ == "__main__":
    seed()
