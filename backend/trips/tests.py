from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from vehicles.models import Vehicle


User = get_user_model()


class TripSaveWorkflowTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="triptester",
            password="password123",
            email="triptester@example.com",
        )
        self.vehicle = Vehicle.objects.create(
            user=self.user,
            vehicle_type="Car",
            brand="Tesla",
            model="Model 3",
            variant="RWD",
            registration_number="ABC123",
            battery_capacity=Decimal("60.00"),
            current_battery_percentage=Decimal("80.00"),
            connector_type="CCS2",
            efficiency=Decimal("0.18"),
            manufacturing_year=2023,
            color="White",
        )
        self.client.force_authenticate(self.user)

    def test_create_trip_accepts_external_station_snapshot(self):
        payload = {
            "vehicle": self.vehicle.id,
            "source": "Ahmedabad",
            "destination": "Gandhinagar",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 23.2156,
            "destination_longitude": 72.6369,
            "route_distance": "120.50",
            "estimated_duration": 45,
            "battery_before": "80.00",
            "predicted_battery_after": "45.00",
            "recommended_station": {
                "external_station_id": "ocm-123",
                "station_name": "Fast Charge Hub",
                "operator": "ChargeCo",
                "latitude": 23.2156,
                "longitude": 72.6369,
                "connector_type": "CCS2",
                "estimated_wait_time": 10,
            },
        }

        response = self.client.post("/api/trips/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["trip"]["external_station_name"], "Fast Charge Hub")
        self.assertEqual(response.data["trip"]["external_station_operator"], "ChargeCo")
        self.assertEqual(response.data["trip"]["external_station_id"], "ocm-123")

    def test_create_trip_accepts_legacy_payload_fields(self):
        payload = {
            "vehicle": self.vehicle.id,
            "source": "Ahmedabad",
            "destination": "Vadodara",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 22.3072,
            "destination_longitude": 73.1812,
            "distance_km": "90.00",
            "estimated_time": 60,
            "estimated_battery_needed": "20.00",
        }

        response = self.client.post("/api/trips/", payload, format="json")

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["trip"]["distance_km"], "90.00")
        self.assertEqual(response.data["trip"]["estimated_time"], 60)
