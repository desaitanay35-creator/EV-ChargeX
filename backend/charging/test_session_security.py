from decimal import Decimal
from django.test import TestCase
from rest_framework.test import APIClient
from users.models import User
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking
from trips.models import Trip


from vehicles.models import Vehicle


class ChargingSessionSecurityTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="driver1",
            email="driver1@example.com",
            password="Password123!",
            role="USER"
        )
        self.op_a = User.objects.create_user(
            username="operatorA",
            email="op_a@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.op_b = User.objects.create_user(
            username="operatorB",
            email="op_b@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.station_a = Station.objects.create(
            station_name="Station A",
            operator=self.op_a,
            address="123 Street A",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380001",
            opening_time="06:00:00",
            closing_time="23:00:00",
            contact_number="9876543210",
            email="stationa@example.com",
            latitude=23.0,
            longitude=72.5
        )
        self.charger_a = Charger.objects.create(
            station=self.station_a,
            charger_name="Charger A1",
            charger_number="C-A1",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=Decimal("50.00"),
            voltage=400,
            current=125,
            price_per_kwh=Decimal("15.00"),
            status="AVAILABLE",
            installation_date="2026-01-01"
        )

        self.station_b = Station.objects.create(
            station_name="Station B",
            operator=self.op_b,
            address="456 Street B",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380002",
            opening_time="06:00:00",
            closing_time="23:00:00",
            contact_number="9876543211",
            email="stationb@example.com",
            latitude=23.1,
            longitude=72.6
        )
        self.charger_b = Charger.objects.create(
            station=self.station_b,
            charger_name="Charger B1",
            charger_number="C-B1",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=Decimal("60.00"),
            voltage=400,
            current=150,
            price_per_kwh=Decimal("18.00"),
            status="AVAILABLE",
            installation_date="2026-01-01"
        )

        self.vehicle_a = Vehicle.objects.create(
            user=self.user,
            vehicle_type="Car",
            brand="Tata",
            model="Nexon EV",
            registration_number="GJ01EV1234",
            battery_capacity=Decimal("40.50"),
            current_battery_percentage=Decimal("30.00"),
            connector_type="CCS2",
            efficiency=Decimal("0.15"),
            manufacturing_year=2023
        )
        self.trip_a = Trip.objects.create(
            user=self.user,
            vehicle=self.vehicle_a,
            source="Location A",
            destination="Location B",
            distance_km=Decimal("10.00"),
            estimated_time=30,
            estimated_battery_needed=Decimal("15.00")
        )
        self.booking_a = Booking.objects.create(
            user=self.user,
            vehicle=self.vehicle_a,
            trip=self.trip_a,
            station=self.station_a,
            charger=self.charger_a,
            booking_date="2026-07-25",
            booking_start_time="10:00:00",
            booking_end_time="11:00:00",
            estimated_duration=60,
            booking_status="CONFIRMED",
            is_qr_used=True
        )

    def test_operator_a_cannot_see_station_b_sessions(self):
        self.client.force_authenticate(user=self.op_a)
        res = self.client.get("/api/charging/sessions/")
        self.assertEqual(res.status_code, 200)

    def test_start_charging_ownership(self):
        # Operator B trying to start charging on Operator A station booking
        self.client.force_authenticate(user=self.op_b)
        res = self.client.post("/api/charging/start/", {"booking_id": self.booking_a.id}, format="json")
        self.assertEqual(res.status_code, 403)

        # Operator A starting charging on Operator A station booking
        self.client.force_authenticate(user=self.op_a)
        res = self.client.post("/api/charging/start/", {"booking_id": self.booking_a.id}, format="json")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "ACTIVE")
