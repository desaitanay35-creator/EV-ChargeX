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
        chg1 = data["chargers"][0]
        expected_keys = {"id", "connector_type", "status", "power_output_kw", "price_per_kwh"}
        self.assertTrue(expected_keys.issubset(set(chg1.keys())))

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


from unittest.mock import patch, MagicMock
from stations.integrations.open_charge_map import (
    fetch_open_charge_map_pois,
    normalize_poi_data,
    process_import_records,
)
from ml_engine.services import recommend_station


class OpenChargeMapIntegrationTests(TestCase):

    def setUp(self):
        self.operator_user = User.objects.create_user(
            username="op_ocm_test",
            email="op_ocm@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.managed_station = Station.objects.create(
            operator=self.operator_user,
            station_name="Managed Station Hub",
            address="123 Main St",
            city="Ahmedabad",
            state="Gujarat",
            pincode="380001",
            latitude=Decimal("23.0225000"),
            longitude=Decimal("72.5714000"),
            contact_number="9876543210",
            email="station@example.com",
            status="OPEN",
            external_source="MANUAL",
            booking_enabled=True,
        )

        self.managed_charger = Charger.objects.create(
            station=self.managed_station,
            charger_name="Managed CCS2 Charger",
            charger_number="MAN-001",
            charger_type="DC",
            connector_type="CCS2",
            power_output_kw=Decimal("50.00"),
            voltage=400,
            current=125,
            price_per_kwh=Decimal("15.00"),
            status="AVAILABLE"
        )

        self.mock_poi_sample = {
            "ID": 99901,
            "UUID": "abc-123-uuid",
            "AddressInfo": {
                "Title": "OCM Test Hub Baroda",
                "AddressLine1": "Station Road",
                "Town": "Vadodara",
                "StateOrProvince": "Gujarat",
                "Postcode": "390001",
                "Latitude": 22.3072,
                "Longitude": 73.1812,
                "ContactTelephone1": "0265123456",
            },
            "OperatorInfo": {
                "Title": "Zeon Charge Network",
                "PhonePrimaryContact": "0265123456"
            },
            "StatusType": {
                "ID": 50,
                "Title": "Operational",
                "IsOperational": True
            },
            "Connections": [
                {
                    "ID": 1001,
                    "ConnectionType": {"ID": 33, "Title": "CCS (Type 2)"},
                    "PowerKW": 60,
                    "Quantity": 2,
                    "StatusType": {"ID": 50, "IsOperational": True}
                },
                {
                    "ID": 1002,
                    "ConnectionType": {"ID": 999, "Title": "Custom Proprietary Plug"},
                    "PowerKW": 11,
                    "Quantity": 1,
                    "StatusType": {"ID": 50, "IsOperational": True}
                }
            ]
        }

    @patch("stations.integrations.open_charge_map.requests.get")
    def test_custom_user_agent_and_header_auth(self, mock_get):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = [self.mock_poi_sample]
        mock_get.return_value = mock_resp

        fetch_open_charge_map_pois(max_results=10)

        mock_get.assert_called_once()
        headers = mock_get.call_args.kwargs["headers"]
        self.assertEqual(headers["User-Agent"], "EV-ChargeX/1.0")
        self.assertIn("X-API-Key", headers)

    def test_api_key_absence_error_without_leaking_secret(self):
        with patch("django.conf.settings.OPEN_CHARGE_MAP_API_KEY", ""):
            with patch("django.conf.settings.OPENCHARGEMAP_API_KEY", ""):
                with self.assertRaises(ValueError) as cm:
                    fetch_open_charge_map_pois()
                self.assertIn("Open Charge Map API key is missing", str(cm.exception))
                self.assertNotIn("secret", str(cm.exception).lower())

    def test_unknown_connector_persistence(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        chargers = norm["chargers"]

        ccs_charger = next(c for c in chargers if c["external_connection_id"] == "1001")
        self.assertEqual(ccs_charger["connector_type"], "CCS2")

        unknown_charger = next(c for c in chargers if c["external_connection_id"] == "1002")
        self.assertEqual(unknown_charger["connector_type"], "UNKNOWN")
        self.assertEqual(unknown_charger["raw_connector_type"], "Custom Proprietary Plug")

    def test_deterministic_charger_number_and_source_quantity(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        c = norm["chargers"][0]
        self.assertEqual(c["charger_number"], "OCM-99901-1001")
        self.assertEqual(c["source_quantity"], 2)

    def test_null_external_price(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        for c in norm["chargers"]:
            self.assertIsNone(c["price_per_kwh"])

    def test_conservative_station_status(self):
        poi_closed = dict(self.mock_poi_sample)
        poi_closed["StatusType"] = {"ID": 100, "Title": "Not Operational", "IsOperational": False}
        norm = normalize_poi_data(poi_closed)
        self.assertEqual(norm["status"], "CLOSED")

    def test_imported_station_available_as_discovery_only(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        process_import_records([norm], dry_run=False)

        station = Station.objects.get(external_id="99901")
        self.assertEqual(station.external_source, "OPEN_CHARGE_MAP")
        self.assertFalse(station.booking_enabled)
        self.assertFalse(station.availability_is_live)
        self.assertIsNone(station.operator)

    def test_imported_unknown_charger_excluded_from_live_availability(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        process_import_records([norm], dry_run=False)

        station = Station.objects.get(external_id="99901")
        unknown_charger = station.chargers.get(external_connection_id="1002")
        self.assertEqual(unknown_charger.status, "UNKNOWN")
        self.assertFalse(unknown_charger.availability_is_live)

    def test_managed_stations_ranked_before_external_stations(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        process_import_records([norm], dry_run=False)

        mock_trip = MagicMock()
        mock_trip.distance_km = 10
        mock_trip.vehicle.efficiency = 5

        recommended = recommend_station(mock_trip)
        self.assertEqual(recommended.id, self.managed_station.id)

    def test_local_fields_preserved_after_sync(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        process_import_records([norm], dry_run=False)

        station = Station.objects.get(external_id="99901")
        station.station_name = "Locally Renamed Hub"
        station.is_locally_verified = True
        station.save()

        process_import_records([norm], dry_run=False, update_existing=True)
        station.refresh_from_db()
        self.assertEqual(station.station_name, "Locally Renamed Hub")

    def test_deleting_internal_operator_does_not_delete_station(self):
        station_id = self.managed_station.id
        self.operator_user.delete()

        station = Station.objects.get(id=station_id)
        self.assertIsNone(station.operator)
        self.assertEqual(station.station_name, "Managed Station Hub")

    def test_repeated_imports_create_no_duplicates(self):
        norm = normalize_poi_data(self.mock_poi_sample)
        count_before = Station.objects.count()

        process_import_records([norm], dry_run=False, update_existing=True)
        count_after_first = Station.objects.count()
        self.assertEqual(count_after_first, count_before + 1)

        process_import_records([norm], dry_run=False, update_existing=True)
        count_after_second = Station.objects.count()
        self.assertEqual(count_after_second, count_after_first)


class OpenChargeMapExpansionTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.operator = User.objects.create_user(
            username="op_manual_exp",
            email="op_manual_exp@example.com",
            password="Password123!",
            role="OPERATOR"
        )
        self.manual_station = Station.objects.create(
            external_source="MANUAL",
            station_name="Legacy Manual Hub - Mumbai",
            address="BKC Mumbai",
            city="Mumbai",
            state="Maharashtra",
            latitude=Decimal("19.0760"),
            longitude=Decimal("72.8777"),
            operator=self.operator,
            booking_enabled=True,
            availability_is_live=True
        )
        self.manual_charger = Charger.objects.create(
            station=self.manual_station,
            charger_number="MANUAL-EXP-001",
            charger_name="Type2 Fast Charger",
            charger_type="FAST",
            connector_type="Type2",
            power_output_kw=Decimal("22.0"),
            price_per_kwh=Decimal("15.00"),
            status="AVAILABLE",
            availability_is_live=True
        )

    def test_01_india_coordinate_validation(self):
        from stations.integrations.open_charge_map import is_valid_india_coordinate
        self.assertTrue(is_valid_india_coordinate(23.0225, 72.5714))
        self.assertTrue(is_valid_india_coordinate(19.0760, 72.8777))
        self.assertFalse(is_valid_india_coordinate(0, 0))
        self.assertFalse(is_valid_india_coordinate(50.0, 10.0))
        self.assertFalse(is_valid_india_coordinate(None, 72.5))

    def test_02_state_normalization(self):
        from stations.integrations.open_charge_map import normalize_state_name
        self.assertEqual(normalize_state_name("gujrat"), "Gujarat")
        self.assertEqual(normalize_state_name("GUJARAT"), "Gujarat")
        self.assertEqual(normalize_state_name("mh"), "Maharashtra")
        self.assertEqual(normalize_state_name("KA"), "Karnataka")
        self.assertEqual(normalize_state_name("nct of delhi"), "Delhi")
        self.assertEqual(normalize_state_name(""), "Unknown")

    def test_03_unknown_state_handled(self):
        from stations.integrations.open_charge_map import normalize_state_name
        self.assertEqual(normalize_state_name("Custom Territory"), "Custom Territory")

    def test_04_normalize_poi_data(self):
        from stations.integrations.open_charge_map import normalize_poi_data
        raw = {
            "ID": 500101,
            "UUID": "uuid-500101",
            "AddressInfo": {
                "Title": "Tata Power - Cyber City",
                "AddressLine1": "DLF Cyber City",
                "Town": "Gurugram",
                "StateOrProvince": "hr",
                "Postcode": "122002",
                "Latitude": 28.4595,
                "Longitude": 77.0266,
            },
            "OperatorInfo": {"Title": "Tata Power EZ Charge"},
            "StatusType": {"ID": 50, "IsOperational": True},
            "Connections": [
                {
                    "ID": 9001,
                    "ConnectionType": {"ID": 33, "Title": "CCS (Type 2)"},
                    "PowerKW": 60,
                    "Quantity": 2
                }
            ]
        }
        norm = normalize_poi_data(raw)
        self.assertIsNotNone(norm)
        self.assertEqual(norm["external_id"], "500101")
        self.assertEqual(norm["state"], "Haryana")
        self.assertEqual(norm["booking_enabled"], False)

    def test_05_valid_ocm_station_created(self):
        from stations.integrations.open_charge_map import process_import_records
        norm = {
            "external_source": "OPEN_CHARGE_MAP",
            "external_id": "900001",
            "external_uuid": "uuid-900001",
            "station_name": "Zeon Fast Hub - Bengaluru",
            "address": "MG Road",
            "city": "Bengaluru",
            "state": "Karnataka",
            "pincode": "560001",
            "latitude": Decimal("12.9716"),
            "longitude": Decimal("77.5946"),
            "contact_number": "",
            "email": "",
            "operator_name": "Zeon Charging",
            "amenities": None,
            "status": "OPEN",
            "raw_source_status": "Operational",
            "source_last_verified_at": None,
            "data_quality_score": 85,
            "booking_enabled": False,
            "availability_is_live": False,
            "chargers": [
                {
                    "external_connection_id": "901",
                    "charger_number": "OCM-900001-901",
                    "charger_name": "CCS2 (CCS (Type 2))",
                    "charger_type": "FAST",
                    "connector_type": "CCS2",
                    "raw_connector_type": "CCS (Type 2)",
                    "power_output_kw": Decimal("60.0"),
                    "voltage": 400,
                    "current": 150,
                    "price_per_kwh": None,
                    "status": "UNKNOWN",
                    "source_quantity": 2,
                    "availability_is_live": False
                }
            ]
        }
        report = process_import_records([norm], dry_run=False)
        self.assertEqual(report["created_stations"], 1)

        st = Station.objects.get(external_id="900001")
        self.assertEqual(st.station_name, "Zeon Fast Hub - Bengaluru")
        self.assertEqual(st.booking_enabled, False)
        self.assertEqual(st.chargers.count(), 1)
        ch = st.chargers.first()
        self.assertIsNone(ch.price_per_kwh)
        self.assertEqual(ch.connector_type, "CCS2")

    def test_06_existing_ocm_station_updated_idempotently(self):
        from stations.integrations.open_charge_map import process_import_records
        norm = {
            "external_source": "OPEN_CHARGE_MAP",
            "external_id": "900002",
            "external_uuid": "uuid-900002",
            "station_name": "Initial Name",
            "address": "Initial Addr",
            "city": "Chennai",
            "state": "Tamil Nadu",
            "pincode": "600001",
            "latitude": Decimal("13.0827"),
            "longitude": Decimal("80.2707"),
            "contact_number": "",
            "email": "",
            "operator_name": "Jio-bp",
            "amenities": None,
            "status": "OPEN",
            "raw_source_status": "Operational",
            "source_last_verified_at": None,
            "data_quality_score": 75,
            "booking_enabled": False,
            "availability_is_live": False,
            "chargers": []
        }
        process_import_records([norm], dry_run=False)

        norm["station_name"] = "Updated Name"
        report2 = process_import_records([norm], dry_run=False, update_existing=True)
        self.assertEqual(report2["created_stations"], 0)
        self.assertEqual(report2["updated_stations"], 1)

        st = Station.objects.get(external_id="900002")
        self.assertEqual(st.station_name, "Updated Name")

    def test_07_existing_manual_station_preserved(self):
        from stations.integrations.open_charge_map import fetch_open_charge_map_pois_india, normalize_poi_data, process_import_records
        initial_manual_count = Station.objects.filter(external_source="MANUAL").count()
        initial_charger_count = Charger.objects.filter(station__external_source="MANUAL").count()

        pois = fetch_open_charge_map_pois_india(target_count=50)
        norm_pois = [normalize_poi_data(p) for p in pois if normalize_poi_data(p)]
        process_import_records(norm_pois, dry_run=False)

        self.assertEqual(Station.objects.filter(external_source="MANUAL").count(), initial_manual_count)
        self.assertEqual(Charger.objects.filter(station__external_source="MANUAL").count(), initial_charger_count)

        ms = Station.objects.get(id=self.manual_station.id)
        self.assertEqual(ms.booking_enabled, True)
        self.assertEqual(ms.operator, self.operator)

    def test_08_api_key_not_in_report(self):
        import json
        from stations.integrations.open_charge_map import fetch_open_charge_map_pois_india, normalize_poi_data, process_import_records
        pois = fetch_open_charge_map_pois_india(target_count=10)
        norm_pois = [normalize_poi_data(p) for p in pois if normalize_poi_data(p)]
        report = process_import_records(norm_pois, dry_run=True)
        report_str = json.dumps(report)
        self.assertNotIn("d4a7692a", report_str)
        self.assertNotIn("X-API-Key", report_str)

    def test_09_fetch_india_pois_target_stop(self):
        from stations.integrations.open_charge_map import fetch_open_charge_map_pois_india
        pois = fetch_open_charge_map_pois_india(target_count=100)
        self.assertLessEqual(len(pois), 100)
        ids = [p.get("ID") for p in pois if "ID" in p]
        self.assertEqual(len(ids), len(set(ids)))



