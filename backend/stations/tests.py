from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from stations.models import Station
from charging.models import Charger
from stations.serializers import StationSerializer

User = get_user_model()


class StationSerializerChargerSummaryTests(TestCase):
    def setUp(self):
        self.operator = User.objects.create_user(
            username="op_test",
            email="op_test@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.user = User.objects.create_user(
            username="user_test",
            email="user_test@example.com",
            password="Password123!",
            role="USER"
        )
        self.station = Station.objects.create(
            operator=self.operator,
            station_name="Surat Fast Hub",
            address="Ring Road",
            city="Surat",
            state="Gujarat",
            pincode="395002",
            latitude=Decimal("21.1702000"),
            longitude=Decimal("72.8311000"),
            opening_time="06:00:00",
            closing_time="22:00:00",
            contact_number="9876543210",
            email="surat@example.com",
            status="OPEN"
        )
        self.charger1 = Charger.objects.create(
            station=self.station,
            charger_name="DC 1",
            charger_number="CHG-S1",
            charger_type="DC",
            connector_type="Type2",
            power_output_kw=Decimal("50.00"),
            voltage=400,
            current=125,
            price_per_kwh=Decimal("15.00"),
            status="AVAILABLE",
            installation_date="2026-01-01"
        )
        self.charger2 = Charger.objects.create(
            station=self.station,
            charger_name="CCS2 1",
            charger_number="CHG-S2",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=Decimal("120.00"),
            voltage=400,
            current=150,
            price_per_kwh=Decimal("18.00"),
            status="OCCUPIED",
            installation_date="2026-01-01"
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_01_station_serializer_includes_lightweight_chargers(self):
        data = StationSerializer(self.station).data
        self.assertIn("chargers", data)
        self.assertEqual(len(data["chargers"]), 2)

        chg1 = data["chargers"][0]
        # Must contain only lightweight fields: id, connector_type, status, power_output_kw, price_per_kwh
        expected_keys = {"id", "connector_type", "status", "power_output_kw", "price_per_kwh"}
        self.assertEqual(set(chg1.keys()), expected_keys)
        self.assertEqual(chg1["connector_type"], "Type2")
        self.assertEqual(chg1["status"], "AVAILABLE")

    def test_02_station_api_endpoint_returns_chargers_summary(self):
        res = self.client.get("/api/stations/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        stations = res.data if isinstance(res.data, list) else res.data.get("results", [])
        target = next((s for s in stations if s["id"] == self.station.id), None)
        self.assertIsNotNone(target)
        self.assertIn("chargers", target)
        self.assertEqual(len(target["chargers"]), 2)

