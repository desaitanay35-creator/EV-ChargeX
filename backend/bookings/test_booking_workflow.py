from decimal import Decimal
from datetime import date, timedelta
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from users.models import User
from stations.models import Station
from charging.models import Charger
from bookings.models import Booking
from trips.models import Trip
from vehicles.models import Vehicle


class BookingWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tomorrow = timezone.localdate() + timedelta(days=1)

        # Users
        self.user = User.objects.create_user(
            username="bkg_user", email="bkg_user@test.com", password="password123", role="USER"
        )
        self.other_user = User.objects.create_user(
            username="other_user", email="other@test.com", password="password123", role="USER"
        )
        self.operator = User.objects.create_user(
            username="bkg_op", email="bkg_op@test.com", password="password123", role="OPERATOR"
        )

        # Vehicles
        self.vehicle_ccs2 = Vehicle.objects.create(
            user=self.user, vehicle_type="Car", brand="Tata", model="Nexon EV",
            registration_number="EV-BKG-01", battery_capacity=Decimal("40.5"),
            current_battery_percentage=Decimal("70.0"), connector_type="CCS2",
            efficiency=Decimal("6.0"), manufacturing_year=2023
        )
        self.vehicle_type2 = Vehicle.objects.create(
            user=self.user, vehicle_type="Car", brand="MG", model="ZS EV",
            registration_number="EV-BKG-02", battery_capacity=Decimal("50.0"),
            current_battery_percentage=Decimal("80.0"), connector_type="Type2",
            efficiency=Decimal("6.5"), manufacturing_year=2024
        )

        # Trip
        self.trip = Trip.objects.create(
            user=self.user, vehicle=self.vehicle_ccs2, source="City A", destination="City B",
            distance_km=Decimal("120.0"), estimated_time=90, estimated_battery_needed=Decimal("30.0")
        )
        self.other_trip = Trip.objects.create(
            user=self.other_user, vehicle=self.vehicle_type2, source="City X", destination="City Y",
            distance_km=Decimal("80.0"), estimated_time=60, estimated_battery_needed=Decimal("20.0")
        )

        # Stations & Chargers
        self.station1 = Station.objects.create(
            operator=self.operator, station_name="Hub Alpha", address="Road 1",
            city="Metropolis", state="State", pincode="110001", latitude=28.61, longitude=77.20,
            opening_time="00:00:00", closing_time="23:59:59", contact_number="9998887770",
            email="hub@test.com", status="OPEN"
        )
        self.station2 = Station.objects.create(
            operator=self.operator, station_name="Hub Beta", address="Road 2",
            city="Metropolis", state="State", pincode="110002", latitude=28.65, longitude=77.25,
            opening_time="00:00:00", closing_time="23:59:59", contact_number="9998887771",
            email="beta@test.com", status="OPEN"
        )

        self.charger_ccs2 = Charger.objects.create(
            station=self.station1, charger_name="Fast CCS2 #1", charger_number="CH-BKG-01",
            charger_type="DC", connector_type="CCS2", power_output_kw=60.0, voltage=400,
            current=150, price_per_kwh=18.00, status="AVAILABLE", installation_date=self.tomorrow
        )
        self.charger_type2 = Charger.objects.create(
            station=self.station1, charger_name="AC Type2 #2", charger_number="CH-BKG-02",
            charger_type="AC", connector_type="Type2", power_output_kw=22.0, voltage=230,
            current=32, price_per_kwh=12.00, status="AVAILABLE", installation_date=self.tomorrow
        )
        self.charger_station2 = Charger.objects.create(
            station=self.station2, charger_name="Station2 Charger", charger_number="CH-BKG-03",
            charger_type="DC", connector_type="CCS2", power_output_kw=50.0, voltage=400,
            current=125, price_per_kwh=15.00, status="AVAILABLE", installation_date=self.tomorrow
        )
        self.charger_occupied = Charger.objects.create(
            station=self.station1, charger_name="Occupied Charger", charger_number="CH-BKG-04",
            charger_type="DC", connector_type="CCS2", power_output_kw=50.0, voltage=400,
            current=125, price_per_kwh=15.00, status="OCCUPIED", installation_date=self.tomorrow
        )

    def test_valid_booking_creation_succeeds_and_generates_qr(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_ccs2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 201)

        data = response.json()
        self.assertEqual(data["booking_status"], "CONFIRMED")
        self.assertTrue(len(data["qr_code"]) > 0)

        # Verify DB row created
        booking = Booking.objects.get(id=data["id"])
        self.assertEqual(booking.user, self.user)
        self.assertEqual(booking.station, self.station1)

        # Verify charger status updated to RESERVED
        self.charger_ccs2.refresh_from_db()
        self.assertEqual(self.charger_ccs2.status, "RESERVED")

    def test_incompatible_charger_rejected(self):
        self.client.force_authenticate(user=self.user)
        # self.trip uses self.vehicle_ccs2 (CCS2 connector). Trying to book self.charger_type2 (Type2 connector).
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_type2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("charger", response.json())

    def test_charger_from_another_station_rejected(self):
        self.client.force_authenticate(user=self.user)
        # Station is station1, but charger belongs to station2
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_station2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("charger", response.json())

    def test_unavailable_charger_rejected(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_occupied.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("charger", response.json())

    def test_overlapping_slot_rejected(self):
        # Create existing booking from 10:00 to 11:30
        Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station1, charger=self.charger_ccs2,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:30:00",
            estimated_duration=90, booking_status="CONFIRMED"
        )

        self.client.force_authenticate(user=self.user)
        # Attempt overlap from 11:00 to 12:00
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_ccs2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "11:00:00",
            "booking_end_time": "12:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("charger", response.json())

    def test_adjacent_slot_allowed(self):
        # Existing booking from 10:00 to 11:00
        Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station1, charger=self.charger_ccs2,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED"
        )

        self.client.force_authenticate(user=self.user)
        # Adjacent booking starting exactly at 11:00 to 12:00
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_ccs2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "11:00:00",
            "booking_end_time": "12:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 201)

    def test_past_booking_date_rejected(self):
        yesterday = timezone.localdate() - timedelta(days=1)
        self.client.force_authenticate(user=self.user)
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_ccs2.id,
            "booking_date": yesterday.isoformat(),
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("booking_date", response.json())

    def test_cross_midnight_or_invalid_time_range_rejected(self):
        self.client.force_authenticate(user=self.user)
        # End time earlier than start time
        payload = {
            "trip": self.trip.id,
            "station": self.station1.id,
            "charger": self.charger_ccs2.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "23:00:00",
            "booking_end_time": "01:00:00",
            "estimated_duration": 120,
        }

        response = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("booking_start_time", response.json())
