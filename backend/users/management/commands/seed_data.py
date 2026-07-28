
"""
EV-ChargeX Demo Seed Command (starter template)

Place this file in:
<your_app>/management/commands/seed_data.py

Run:
    python manage.py seed_data

NOTE:
This is a starter seed command. Adjust the imports (APP_NAME below) to
match the Django app where you place this file.
"""

import random
from decimal import Decimal
from datetime import timedelta, time

from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from faker import Faker

# Update these imports to match your project if needed
from vehicles.models import Vehicle
from stations.models import Station
from charging.models import Charger, ChargingSession
from trips.models import Trip
from bookings.models import Booking
from payments.models import Payment

fake = Faker("en_IN")
User = get_user_model()


CITIES = [
    ("Bengaluru", "Karnataka"),
    ("Mumbai", "Maharashtra"),
    ("Delhi", "Delhi"),
    ("Pune", "Maharashtra"),
    ("Hyderabad", "Telangana"),
    ("Chennai", "Tamil Nadu"),
    ("Ahmedabad", "Gujarat"),
    ("Jaipur", "Rajasthan"),
    ("Kolkata", "West Bengal"),
]

VEHICLES = [
    ("Tata", "Nexon EV", Decimal("40"), Decimal("7.5")),
    ("Tata", "Tiago EV", Decimal("24"), Decimal("8.5")),
    ("MG", "ZS EV", Decimal("50"), Decimal("6.8")),
    ("Hyundai", "Kona Electric", Decimal("39"), Decimal("7.2")),
    ("Mahindra", "XUV400", Decimal("39"), Decimal("7.1")),
    ("BYD", "Atto 3", Decimal("60"), Decimal("6.5")),
]


class Command(BaseCommand):
    help = "Populate EV-ChargeX with demo data."

    def handle(self, *args, **kwargs):
        self.stdout.write("Creating demo data...")

        admins = []
        for i in range(3):
            obj, _ = User.objects.get_or_create(
                username=f"admin{i+1}",
                defaults=dict(
                    email=f"admin{i+1}@evchargex.com",
                    role="ADMIN",
                    is_staff=True,
                    is_superuser=True,
                ),
            )
            obj.set_password("admin123")
            obj.save()
            admins.append(obj)

        operators = []
        for i in range(20):
            obj, _ = User.objects.get_or_create(
                username=f"operator{i+1}",
                defaults=dict(
                    email=f"operator{i+1}@evchargex.com",
                    role="OPERATOR",
                    phone=f"900000{i:04d}",
                    city=random.choice(CITIES)[0],
                    is_verified=True,
                ),
            )
            operators.append(obj)

        users = []
        for i in range(180):
            obj, _ = User.objects.get_or_create(
                username=f"user{i+1}",
                defaults=dict(
                    email=f"user{i+1}@gmail.com",
                    role="USER",
                    phone=f"800000{i:04d}",
                    city=random.choice(CITIES)[0],
                    is_verified=True,
                ),
            )
            users.append(obj)

        vehicles = []
        for i, user in enumerate(users):
            brand, model, cap, eff = random.choice(VEHICLES)
            v, _ = Vehicle.objects.get_or_create(
                registration_number=f"EV{i:04d}",
                defaults=dict(
                    user=user,
                    vehicle_type="Car",
                    brand=brand,
                    model=model,
                    battery_capacity=cap,
                    current_battery_percentage=random.randint(25,95),
                    connector_type="CCS2",
                    efficiency=eff,
                    manufacturing_year=random.randint(2021,2026),
                ),
            )
            vehicles.append(v)

        stations = []
        for i in range(30):
            city, state = random.choice(CITIES)
            s, _ = Station.objects.get_or_create(
                station_name=f"{city} EV Hub {i+1}",
                defaults=dict(
                    operator=random.choice(operators),
                    address=fake.address(),
                    city=city,
                    state=state,
                    pincode=fake.postcode(),
                    latitude=Decimal(str(round(random.uniform(12,29),7))),
                    longitude=Decimal(str(round(random.uniform(72,88),7))),
                    opening_time=time(6,0),
                    closing_time=time(23,0),
                    contact_number=fake.msisdn()[:10],
                    email=f"station{i+1}@evhub.com",
                    amenities="Cafe, Washroom, WiFi",
                    rating=Decimal("4.5"),
                    status="OPEN",
                ),
            )
            stations.append(s)

        chargers=[]
        for station in stations:
            for j in range(4):
                c,_=Charger.objects.get_or_create(
                    charger_number=f"{station.id}-{j+1}",
                    defaults=dict(
                        station=station,
                        charger_name=f"Charger {j+1}",
                        charger_type=random.choice(["AC","DC"]),
                        connector_type="CCS2",
                        power_output_kw=Decimal(random.choice([30,60,120])),
                        voltage=400,
                        current=150,
                        price_per_kwh=Decimal("18.50"),
                        installation_date=timezone.now().date()-timedelta(days=300),
                        status="AVAILABLE",
                    )
                )
                chargers.append(c)

        for i in range(300):
            user=random.choice(users)
            vehicle=Vehicle.objects.filter(user=user).first()
            station=random.choice(stations)
            charger=random.choice([c for c in chargers if c.station_id==station.id])

            trip=Trip.objects.create(
                user=user,
                vehicle=vehicle,
                source="Source City",
                destination=station.city,
                distance_km=random.randint(20,300),
                estimated_duration=random.randint(30,240),
                estimated_battery_needed=random.randint(20,70),
                battery_before=random.randint(20,70),
                predicted_battery_after=random.randint(75,100),
                suggested_station=station,
                trip_status="COMPLETED",
            )

            booking=Booking.objects.create(
                user=user,
                trip=trip,
                station=station,
                charger=charger,
                booking_date=timezone.now().date(),
                booking_start_time=time(10,0),
                booking_end_time=time(11,0),
                estimated_duration=60,
                booking_status="COMPLETED",
                qr_code=f"QR-{trip.id}",
            )

            session=ChargingSession.objects.create(
                booking=booking,
                charger=charger,
                vehicle=vehicle,
                start_time=timezone.now()-timedelta(hours=1),
                end_time=timezone.now(),
                battery_before=30,
                battery_after=90,
                energy_consumed_kwh=Decimal("24"),
                charging_cost=Decimal("444"),
                session_status="COMPLETED",
            )

            Payment.objects.get_or_create(
                charging_session=session,
                defaults=dict(
                    user=user,
                    amount=session.charging_cost,
                    payment_method="UPI",
                    payment_status="SUCCESS",
                    transaction_id=f"TXN{session.id}",
                    paid_at=timezone.now(),
                ),
            )

        self.stdout.write(self.style.SUCCESS("Demo data created successfully."))
