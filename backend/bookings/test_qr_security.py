import qrcode
from decimal import Decimal
from datetime import timedelta
from unittest.mock import patch
from django.test import TestCase
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from users.models import User
from stations.models import Station
from charging.models import Charger
from bookings.models import Booking
from trips.models import Trip
from vehicles.models import Vehicle
from bookings.utils import generate_booking_qr, generate_unique_booking_token


class SecureQRWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tomorrow = timezone.localdate() + timedelta(days=1)

        # Users
        self.user = User.objects.create_user(
            username="qr_driver", email="driver@qr.com", password="Password123!", role="USER"
        )
        self.operator_assigned = User.objects.create_user(
            username="op_assigned", email="op1@qr.com", password="Password123!", role="OPERATOR"
        )
        self.operator_unassigned = User.objects.create_user(
            username="op_unassigned", email="op2@qr.com", password="Password123!", role="OPERATOR"
        )

        # Vehicle & Trip
        self.vehicle = Vehicle.objects.create(
            user=self.user, vehicle_type="Car", brand="Tata", model="Nexon EV",
            registration_number="EV-QR-01", battery_capacity=Decimal("40.0"),
            current_battery_percentage=Decimal("50.0"), connector_type="CCS2",
            efficiency=Decimal("6.0"), manufacturing_year=2023
        )
        self.trip = Trip.objects.create(
            user=self.user, vehicle=self.vehicle, source="City A", destination="City B",
            distance_km=Decimal("100.0"), estimated_time=80, estimated_battery_needed=Decimal("25.0")
        )

        # Station & Charger
        self.station = Station.objects.create(
            operator=self.operator_assigned, station_name="Secure QR Station", address="Street 1",
            city="Metropolis", state="State", pincode="110001", latitude=28.61, longitude=77.20,
            opening_time="00:00:00", closing_time="23:59:59", contact_number="9990001112",
            email="station@qr.com", status="OPEN"
        )
        self.charger = Charger.objects.create(
            station=self.station, charger_name="DC Fast", charger_number="CH-QR-01",
            charger_type="DC", connector_type="CCS2", power_output_kw=60.0, voltage=400,
            current=150, price_per_kwh=15.00, status="AVAILABLE", installation_date=self.tomorrow
        )

    def test_booking_creation_generates_unique_token_and_qr_image(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "trip": self.trip.id,
            "station": self.station.id,
            "charger": self.charger.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "14:00:00",
            "booking_end_time": "15:00:00",
            "estimated_duration": 60,
        }

        res = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        data = res.json()
        self.assertTrue(data["qr_code"].startswith("EV-BKG-"))
        self.assertTrue("booking_qr/booking_" in data["qr_image"])
        self.assertIsNotNone(data["qr_image_url"])
        self.assertFalse(data["is_qr_used"])

        booking = Booking.objects.get(id=data["id"])
        self.assertEqual(booking.qr_code, data["qr_code"])
        self.assertEqual(booking.qr_image, data["qr_image"])

    def test_qrcode_make_encodes_verification_token_not_image_path(self):
        booking = Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station, charger=self.charger,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED"
        )
        token = generate_unique_booking_token(booking.id)
        booking.qr_code = token
        booking.save()

        with patch("qrcode.make") as mock_make:
            mock_make.return_value.save = lambda *args, **kwargs: None
            generate_booking_qr(booking)
            mock_make.assert_called_once_with(token)
            self.assertNotIn("booking_qr/", mock_make.call_args[0][0])
            self.assertNotIn(".png", mock_make.call_args[0][0])

    def test_valid_operator_validates_assigned_booking(self):
        booking = Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station, charger=self.charger,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED",
            qr_code=f"EV-BKG-TEST-1"
        )

        self.client.force_authenticate(user=self.operator_assigned)
        res = self.client.post("/api/bookings/validate-qr/", {"qr_code": "  EV-BKG-TEST-1  "}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        booking.refresh_from_db()
        self.assertTrue(booking.is_qr_used)

    def test_wrong_operator_receives_403_forbidden(self):
        booking = Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station, charger=self.charger,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED",
            qr_code="EV-BKG-WRONG-OP"
        )

        self.client.force_authenticate(user=self.operator_unassigned)
        res = self.client.post("/api/bookings/validate-qr/", {"qr_code": "EV-BKG-WRONG-OP"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn("another station", res.json()["error"])
        self.assertNotIn("user", res.json())
        self.assertNotIn("vehicle", res.json())

    def test_driver_cannot_validate_qr(self):
        self.client.force_authenticate(user=self.user)
        res = self.client.post("/api/bookings/validate-qr/", {"qr_code": "EV-BKG-SOME-CODE"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_token_or_image_path_rejected(self):
        self.client.force_authenticate(user=self.operator_assigned)
        # Random non-existent token
        res1 = self.client.post("/api/bookings/validate-qr/", {"qr_code": "INVALID-TOKEN-999"}, format="json")
        self.assertEqual(res1.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res1.json()["error"], "This booking verification code is invalid.")

        # Image path string rejected
        res2 = self.client.post("/api/bookings/validate-qr/", {"qr_code": "booking_qr/booking_11.png"}, format="json")
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res2.json()["error"], "This booking verification code is invalid.")

    def test_used_token_rejected(self):
        booking = Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station, charger=self.charger,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CONFIRMED",
            qr_code="EV-BKG-USED", is_qr_used=True
        )

        self.client.force_authenticate(user=self.operator_assigned)
        res = self.client.post("/api/bookings/validate-qr/", {"qr_code": "EV-BKG-USED"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.json()["error"], "This QR code has already been used.")

    def test_cancelled_or_completed_booking_rejected(self):
        booking = Booking.objects.create(
            user=self.user, trip=self.trip, station=self.station, charger=self.charger,
            booking_date=self.tomorrow, booking_start_time="10:00:00", booking_end_time="11:00:00",
            estimated_duration=60, booking_status="CANCELLED",
            qr_code="EV-BKG-CANCELLED"
        )

        self.client.force_authenticate(user=self.operator_assigned)
        res = self.client.post("/api/bookings/validate-qr/", {"qr_code": "EV-BKG-CANCELLED"}, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(res.json()["error"], "Only confirmed bookings can be validated.")

    def test_serializer_read_only_fields_cannot_be_overridden(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "trip": self.trip.id,
            "station": self.station.id,
            "charger": self.charger.id,
            "booking_date": self.tomorrow.isoformat(),
            "booking_start_time": "16:00:00",
            "booking_end_time": "17:00:00",
            "estimated_duration": 60,
            "qr_code": "HACKED_CODE",
            "is_qr_used": True,
        }

        res = self.client.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        data = res.json()
        self.assertNotEqual(data["qr_code"], "HACKED_CODE")
        self.assertFalse(data["is_qr_used"])
