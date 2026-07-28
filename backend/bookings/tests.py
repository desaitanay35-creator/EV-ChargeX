from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from vehicles.models import Vehicle
from trips.models import Trip
from stations.models import Station
from charging.models import Charger, ChargingSession
from bookings.models import Booking

User = get_user_model()


class DirectBookingAndChargeNearbyTests(TestCase):
    def setUp(self):
        self.userA = User.objects.create_user(
            username="userA",
            email="userA@example.com",
            password="Password123!",
            role="USER"
        )
        self.userB = User.objects.create_user(
            username="userB",
            email="userB@example.com",
            password="Password123!",
            role="USER"
        )
        self.operator = User.objects.create_user(
            username="op1",
            email="op1@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.vehicleA = Vehicle.objects.create(
            user=self.userA,
            vehicle_type="Car",
            brand="Tata",
            model="Nexon EV",
            registration_number="GJ01AA1111",
            battery_capacity=Decimal("60.00"),
            current_battery_percentage=Decimal("40.00"),
            connector_type="Type2",
            efficiency=Decimal("6.00"),
            manufacturing_year=2024
        )

        self.vehicleB = Vehicle.objects.create(
            user=self.userB,
            vehicle_type="Car",
            brand="Tesla",
            model="Model 3",
            registration_number="GJ01BB2222",
            battery_capacity=Decimal("75.00"),
            current_battery_percentage=Decimal("50.00"),
            connector_type="CCS2",
            efficiency=Decimal("6.50"),
            manufacturing_year=2024
        )

        self.station = Station.objects.create(
            operator=self.operator,
            station_name="CG Road Charging Station",
            address="CG Road",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380009",
            latitude=Decimal("23.0225000"),
            longitude=Decimal("72.5714000"),
            opening_time="06:00:00",
            closing_time="23:00:00",
            contact_number="9876543210",
            email="cgroad@example.com",
            status="OPEN"
        )

        self.charger_type2 = Charger.objects.create(
            station=self.station,
            charger_name="AC Type2 1",
            charger_number="CHG-T2-01",
            charger_type="AC",
            connector_type="Type2",
            power_output_kw=Decimal("7.20"),
            voltage=230,
            current=32,
            price_per_kwh=Decimal("12.00"),
            status="AVAILABLE",
            installation_date="2026-01-01"
        )

        self.charger_ccs2 = Charger.objects.create(
            station=self.station,
            charger_name="DC CCS2 1",
            charger_number="CHG-CCS2-01",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=Decimal("50.00"),
            voltage=400,
            current=125,
            price_per_kwh=Decimal("18.00"),
            status="AVAILABLE",
            installation_date="2026-01-01"
        )

        self.tripA = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Ahmedabad",
            destination="Gandhinagar",
            distance_km=Decimal("28.00"),
            estimated_time=40,
            estimated_battery_needed=Decimal("7.50"),
            trip_status="PLANNED"
        )

        self.clientA = APIClient()
        self.clientA.force_authenticate(user=self.userA)

        self.clientB = APIClient()
        self.clientB.force_authenticate(user=self.userB)

        self.clientOp = APIClient()
        self.clientOp.force_authenticate(user=self.operator)

    def test_01_direct_booking_without_trip_succeeds(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-01",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(res.data["trip"])
        self.assertEqual(res.data["vehicle"], self.vehicleA.id)
        self.assertIsNotNone(res.data["qr_code"])

    def test_02_booking_without_vehicle_rejected(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "booking_date": "2026-12-01",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle", res.data)

    def test_03_another_users_vehicle_rejected(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_ccs2.id,
            "vehicle": self.vehicleB.id, # belongs to userB
            "trip": None,
            "booking_date": "2026-12-01",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle", res.data)

    def test_04_trip_and_vehicle_mismatch_rejected(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleB.id,
            "trip": self.tripA.id, # tripA belongs to vehicleA
            "booking_date": "2026-12-01",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_05_incompatible_connector_rejected(self):
        # vehicleA is Type2, charger_ccs2 is CCS2
        payload = {
            "station": self.station.id,
            "charger": self.charger_ccs2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-01",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("charger", res.data)

    def test_06_overlapping_booking_rejected(self):
        payload1 = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-05",
            "booking_start_time": "14:00:00",
            "booking_end_time": "15:00:00",
            "estimated_duration": 60
        }
        res1 = self.clientA.post("/api/bookings/", payload1, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Make charger AVAILABLE again for next user booking attempt
        self.charger_type2.status = "AVAILABLE"
        self.charger_type2.save()

        # userB tries to book same charger during 14:30 - 15:30
        payload2 = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleB.id,
            "trip": None,
            "booking_date": "2026-12-05",
            "booking_start_time": "14:30:00",
            "booking_end_time": "15:30:00",
            "estimated_duration": 60
        }
        res2 = self.clientB.post("/api/bookings/", payload2, format="json")
        self.assertEqual(res2.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("charger", res2.data)

    def test_07_cancelled_booking_does_not_block_slot(self):
        payload1 = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-06",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res1 = self.clientA.post("/api/bookings/", payload1, format="json")
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        b1_id = res1.data["id"]

        # Cancel b1
        b1 = Booking.objects.get(id=b1_id)
        b1.booking_status = "CANCELLED"
        b1.save()

        self.charger_type2.status = "AVAILABLE"
        self.charger_type2.save()

        # Re-booking same slot should now succeed
        payload2 = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-06",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res2 = self.clientA.post("/api/bookings/", payload2, format="json")
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

    def test_08_operator_validates_direct_booking_qr(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-10",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        qr_code = res.data["qr_code"]

        val_res = self.clientOp.post("/api/bookings/validate-qr/", {"qr_code": qr_code}, format="json")
        self.assertEqual(val_res.status_code, status.HTTP_200_OK)
        self.assertTrue(val_res.data["can_start_charging"])

    def test_09_charging_session_starts_and_completes_without_trip(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": None,
            "booking_date": "2026-12-12",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        booking_id = res.data["id"]
        qr_code = res.data["qr_code"]

        # 1. Validate QR
        self.clientOp.post("/api/bookings/validate-qr/", {"qr_code": qr_code}, format="json")

        # 2. Start Charging
        start_res = self.clientA.post("/api/charging/start/", {"booking_id": booking_id}, format="json")
        self.assertIn(start_res.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])
        session_id = start_res.data["session_id"]

        # Verify session has vehicleA attached directly
        sess_obj = ChargingSession.objects.get(id=session_id)
        self.assertEqual(sess_obj.vehicle, self.vehicleA)

        # Shift start_time back by 30 mins to simulate charging duration
        from datetime import timedelta
        from django.utils import timezone
        sess_obj.start_time = timezone.now() - timedelta(minutes=30)
        sess_obj.save()

        # 3. Stop Charging
        stop_res = self.clientA.post("/api/charging/stop/", {"session_id": session_id}, format="json")
        self.assertEqual(stop_res.status_code, status.HTTP_200_OK)
        self.assertEqual(stop_res.data["message"], "Charging completed successfully.")

        # 4. Check vehicle battery updated
        self.vehicleA.refresh_from_db()
        self.assertGreater(self.vehicleA.current_battery_percentage, Decimal("40.00"))

    def test_10_existing_trip_based_booking_still_succeeds(self):
        payload = {
            "station": self.station.id,
            "charger": self.charger_type2.id,
            "vehicle": self.vehicleA.id,
            "trip": self.tripA.id,
            "booking_date": "2026-12-15",
            "booking_start_time": "10:00:00",
            "booking_end_time": "11:00:00",
            "estimated_duration": 60
        }
        res = self.clientA.post("/api/bookings/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["trip"], self.tripA.id)
        self.assertEqual(res.data["vehicle"], self.vehicleA.id)
