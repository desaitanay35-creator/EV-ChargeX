from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal

from vehicles.models import Vehicle
from stations.models import Station
from trips.models import Trip

User = get_user_model()


class TripSaveRegressionTests(TestCase):
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
            username="operator1",
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
            connector_type="CCS2",
            efficiency=Decimal("6.00"),
            manufacturing_year=2024
        )

        self.vehicleB = Vehicle.objects.create(
            user=self.userB,
            vehicle_type="Car",
            brand="BMW",
            model="iX",
            registration_number="GJ01BB2222",
            battery_capacity=Decimal("80.00"),
            current_battery_percentage=Decimal("50.00"),
            connector_type="CCS2",
            efficiency=Decimal("5.50"),
            manufacturing_year=2024
        )

        self.station = Station.objects.create(
            operator=self.operator,
            station_name="Anand Charging Station",
            address="Expressway Hub",
            city="Anand",
            state="Gujarat",
            pincode="388001",
            latitude=Decimal("22.5645000"),
            longitude=Decimal("72.9289000"),
            opening_time="00:00:00",
            closing_time="23:59:59",
            contact_number="9876543210",
            email="anand@example.com",
            status="OPEN"
        )

        self.clientA = APIClient()
        self.clientA.force_authenticate(user=self.userA)

        self.clientB = APIClient()
        self.clientB.force_authenticate(user=self.userB)

    def test_01_user_creates_valid_trip(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad, Gujarat",
            "destination": "Surat, Gujarat",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 21.1702,
            "destination_longitude": 72.8311,
            "distance_km": 265.40,
            "estimated_time": 270,
            "estimated_battery_needed": 75.30,
            "suggested_station": self.station.id
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["trip"]["trip_status"], "PLANNED")
        self.assertEqual(res.data["trip"]["user"], self.userA.id)

    def test_02_created_trip_belongs_to_request_user(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Vadodara",
            "distance_km": 110.00,
            "estimated_time": 120,
            "estimated_battery_needed": 30.50
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        trip_id = res.data["trip"]["id"]
        trip_obj = Trip.objects.get(id=trip_id)
        self.assertEqual(trip_obj.user, self.userA)

    def test_03_another_users_vehicle_rejected(self):
        payload = {
            "vehicle": self.vehicleB.id, # belongs to userB
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 260.00,
            "estimated_time": 270,
            "estimated_battery_needed": 70.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle", res.data)

    def test_04_missing_vehicle_rejected(self):
        payload = {
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 260.00,
            "estimated_time": 270,
            "estimated_battery_needed": 70.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("vehicle", res.data)

    def test_05_zero_distance_rejected(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 0.00,
            "estimated_time": 270,
            "estimated_battery_needed": 70.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("distance_km", res.data)

    def test_06_zero_estimated_time_rejected(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 260.00,
            "estimated_time": 0,
            "estimated_battery_needed": 70.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("estimated_time", res.data)

    def test_07_negative_battery_estimate_rejected(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 260.00,
            "estimated_time": 270,
            "estimated_battery_needed": -5.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("estimated_battery_needed", res.data)

    def test_08_suggested_station_optional(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Gandhinagar",
            "distance_km": 28.00,
            "estimated_time": 40,
            "estimated_battery_needed": 7.50,
            "suggested_station": None
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIsNone(res.data["trip"]["suggested_station"])

    def test_09_new_trip_appears_in_get_list(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Rajkot",
            "distance_km": 215.00,
            "estimated_time": 240,
            "estimated_battery_needed": 60.00
        }
        create_res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

        list_res = self.clientA.get("/api/trips/")
        self.assertEqual(list_res.status_code, status.HTTP_200_OK)
        trip_ids = [t["id"] for t in list_res.data]
        self.assertIn(create_res.data["trip"]["id"], trip_ids)

    def test_10_user_a_cannot_see_user_b_trip(self):
        payload_B = {
            "vehicle": self.vehicleB.id,
            "source": "Surat",
            "destination": "Mumbai",
            "distance_km": 280.00,
            "estimated_time": 300,
            "estimated_battery_needed": 70.00
        }
        create_B = self.clientB.post("/api/trips/", payload_B, format="json")
        self.assertEqual(create_B.status_code, status.HTTP_201_CREATED)
        trip_b_id = create_B.data["trip"]["id"]

        list_A = self.clientA.get("/api/trips/")
        self.assertEqual(list_A.status_code, status.HTTP_200_OK)
        trip_a_ids = [t["id"] for t in list_A.data]
        self.assertNotIn(trip_b_id, trip_a_ids)

    def test_13_formatted_distance_string_rejected(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": "354.98 km",
            "estimated_time": 265,
            "estimated_battery_needed": 78.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("distance_km", res.data)

    def test_14_formatted_duration_string_rejected(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "distance_km": 354.98,
            "estimated_time": "4 hr 25 min",
            "estimated_battery_needed": 78.00
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("estimated_time", res.data)

    def test_15_battery_needed_greater_than_current_battery_accepted(self):
        # Current battery is 40.00%, needed is 78.00%
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Valsad",
            "distance_km": 354.98,
            "estimated_time": 265,
            "estimated_battery_needed": 78.00,
            "suggested_station": self.station.id
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["trip"]["trip_status"], "PLANNED")
        self.assertEqual(Decimal(str(res.data["trip"]["estimated_battery_needed"])), Decimal("78.00"))

    def test_16_battery_needed_greater_than_100_accepted(self):
        payload = {
            "vehicle": self.vehicleA.id,
            "source": "Ahmedabad",
            "destination": "Mumbai",
            "distance_km": 530.00,
            "estimated_time": 540,
            "estimated_battery_needed": 140.00,
            "suggested_station": self.station.id
        }
        res = self.clientA.post("/api/trips/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["trip"]["trip_status"], "PLANNED")

    def test_17_start_trip_lifecycle(self):
        trip = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Ahmedabad",
            destination="Vadodara",
            distance_km=Decimal("114.40"),
            estimated_time=105,
            estimated_battery_needed=Decimal("25.10"),
            trip_status="PLANNED"
        )
        res = self.clientA.post(f"/api/trips/{trip.id}/start/", {"actual_start_latitude": 23.0225, "actual_start_longitude": 72.5714}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["trip_status"], "ONGOING")
        self.assertIsNotNone(res.data["start_time"])

    def test_18_cannot_start_multiple_ongoing_trips(self):
        trip1 = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Ahmedabad",
            destination="Vadodara",
            distance_km=Decimal("114.40"),
            estimated_time=105,
            estimated_battery_needed=Decimal("25.10"),
            trip_status="ONGOING"
        )
        trip2 = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Vadodara",
            destination="Surat",
            distance_km=Decimal("150.00"),
            estimated_time=160,
            estimated_battery_needed=Decimal("35.00"),
            trip_status="PLANNED"
        )
        res = self.clientA.post(f"/api/trips/{trip2.id}/start/", format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("active trip", res.data["detail"])

    def test_19_end_trip_lifecycle(self):
        trip = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Ahmedabad",
            destination="Vadodara",
            distance_km=Decimal("114.40"),
            estimated_time=105,
            estimated_battery_needed=Decimal("25.10"),
            trip_status="ONGOING"
        )
        res = self.clientA.post(f"/api/trips/{trip.id}/end/", {"actual_end_latitude": 22.3072, "actual_end_longitude": 73.1812}, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data["trip_status"], "COMPLETED")
        self.assertIsNotNone(res.data["end_time"])

    def test_20_cannot_delete_ongoing_trip(self):
        trip = Trip.objects.create(
            user=self.userA,
            vehicle=self.vehicleA,
            source="Ahmedabad",
            destination="Vadodara",
            distance_km=Decimal("114.40"),
            estimated_time=105,
            estimated_battery_needed=Decimal("25.10"),
            trip_status="ONGOING"
        )
        res = self.clientA.delete(f"/api/trips/{trip.id}/")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


