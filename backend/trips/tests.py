from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from decimal import Decimal
from unittest.mock import patch

from vehicles.models import Vehicle
from stations.models import Station
from charging.models import Charger
from trips.models import Trip

User = get_user_model()


class EVTripPlannerBackendTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="Password123!",
            role="USER"
        )
        self.operator = User.objects.create_user(
            username="operator",
            email="operator@example.com",
            password="Password123!",
            role="OPERATOR"
        )

        self.vehicle_ccs2 = Vehicle.objects.create(
            user=self.user,
            vehicle_type="Car",
            brand="Tata",
            model="Nexon EV",
            registration_number="GJ01EV1111",
            battery_capacity=Decimal("60.00"),
            current_battery_percentage=Decimal("50.00"),
            connector_type="CCS2",
            efficiency=Decimal("6.00"),
            manufacturing_year=2024
        )

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def create_station(self, name, lat, lng, connector_type="CCS2", charger_status="AVAILABLE", power_kw=50.0):
        st = Station.objects.create(
            operator=self.operator,
            station_name=name,
            address="Highway Stop",
            city="Gujarat",
            state="Gujarat",
            latitude=Decimal(str(lat)),
            longitude=Decimal(str(lng)),
            status="OPEN"
        )
        Charger.objects.create(
            station=st,
            charger_name=f"{name} Charger 1",
            charger_number=f"CH_{st.id}_1",
            charger_type="DC",
            connector_type=connector_type,
            power_output_kw=Decimal(str(power_kw)),
            price_per_kwh=Decimal("15.00"),
            status=charger_status
        )
        return st

    # 1. Destination reachable without charging
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_01_destination_reachable_without_charging(self, mock_osrm):
        self.vehicle_ccs2.current_battery_percentage = Decimal("100.00")
        self.vehicle_ccs2.save()

        # Mock direct route: 50 km (battery needed ~13.89%, arrival battery ~86.11% >= 20%)
        mock_osrm.return_value = {
            "distance_km": 50.0,
            "duration_minutes": 45,
            "geometry": {"type": "LineString", "coordinates": [[72.57, 23.02], [72.83, 21.17]]}
        }

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Nadiad",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 22.6916,
            "destination_longitude": 72.8634,
            "current_battery_percentage": 100.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["charging_required"])
        self.assertEqual(len(res.data["stops"]), 0)
        self.assertGreaterEqual(res.data["estimated_destination_battery_percentage"], 20.0)

    # 2. One compatible reachable station selected
    @patch("ml_engine.trip_planner.get_osrm_multi_stop_route")
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_02_one_compatible_reachable_station_selected(self, mock_osrm_route, mock_osrm_multi):
        self.vehicle_ccs2.current_battery_percentage = Decimal("30.00") # 30% battery = 108 km range
        self.vehicle_ccs2.save()

        st = self.create_station("Anand Fast Charger", 22.5645, 72.9289, connector_type="CCS2", charger_status="AVAILABLE")

        def side_effect_osrm(orig_lat, orig_lng, dst_lat, dst_lng, *args, **kwargs):
            # Route direct origin to destination = 200 km
            if abs(orig_lat - 23.0225) < 0.1 and abs(dst_lat - 21.1702) < 0.1:
                return {"distance_km": 200.0, "duration_minutes": 180, "geometry": {"type": "LineString", "coordinates": []}}
            # Origin to Anand station (50 km)
            if abs(orig_lat - 23.0225) < 0.1 and abs(dst_lat - 22.5645) < 0.1:
                return {"distance_km": 50.0, "duration_minutes": 45, "geometry": {"type": "LineString", "coordinates": []}}
            # Anand station to destination (150 km)
            if abs(orig_lat - 22.5645) < 0.1 and abs(dst_lat - 21.1702) < 0.1:
                return {"distance_km": 150.0, "duration_minutes": 135, "geometry": {"type": "LineString", "coordinates": []}}
            return {"distance_km": 100.0, "duration_minutes": 90, "geometry": {"type": "LineString", "coordinates": []}}

        mock_osrm_route.side_effect = side_effect_osrm
        mock_osrm_multi.return_value = {
            "distance_km": 200.0,
            "duration_minutes": 180,
            "geometry": {"type": "LineString", "coordinates": []},
            "legs": [{"distance_km": 50.0, "duration_minutes": 45}, {"distance_km": 150.0, "duration_minutes": 135}]
        }

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 21.1702,
            "destination_longitude": 72.8311,
            "current_battery_percentage": 30.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["charging_required"])
        self.assertEqual(len(res.data["stops"]), 1)
        self.assertEqual(res.data["stops"][0]["station"]["id"], st.id)
        self.assertEqual(res.data["stops"][0]["charger"]["connector_type"], "CCS2")

    # 3. Incompatible chargers are never selected
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_03_incompatible_chargers_never_selected(self, mock_osrm_route):
        self.vehicle_ccs2.current_battery_percentage = Decimal("30.00")
        self.vehicle_ccs2.save()

        # Station has ONLY Type2 charger (vehicle requires CCS2)
        self.create_station("Type2 Only Station", 22.5645, 72.9289, connector_type="Type2", charger_status="AVAILABLE")

        mock_osrm_route.return_value = {
            "distance_km": 200.0,
            "duration_minutes": 180,
            "geometry": {"type": "LineString", "coordinates": []}
        }

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 21.1702,
            "destination_longitude": 72.8311,
            "current_battery_percentage": 30.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["error_code"], "NO_COMPATIBLE_AVAILABLE_CHARGERS")

    # 4. Occupied/reserved/maintenance chargers are never selected
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_04_occupied_or_maintenance_chargers_never_selected(self, mock_osrm_route):
        self.vehicle_ccs2.current_battery_percentage = Decimal("30.00")
        self.vehicle_ccs2.save()

        # Station has CCS2 charger, but status is OCCUPIED
        self.create_station("Busy Station", 22.5645, 72.9289, connector_type="CCS2", charger_status="OCCUPIED")

        mock_osrm_route.return_value = {
            "distance_km": 200.0,
            "duration_minutes": 180,
            "geometry": {"type": "LineString", "coordinates": []}
        }

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 21.1702,
            "destination_longitude": 72.8311,
            "current_battery_percentage": 30.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["error_code"], "NO_COMPATIBLE_AVAILABLE_CHARGERS")

    # 5. Station close by Haversine but unreachable by road rejected
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_05_station_close_by_haversine_unreachable_by_road_rejected(self, mock_osrm_route):
        self.vehicle_ccs2.current_battery_percentage = Decimal("20.00") # 20% battery = 72 km max range
        self.vehicle_ccs2.save()

        # Station lat/lng is close geographically (~15 km), but road driving leg is 200 km
        st = self.create_station("Mountain Top Station", 23.1000, 72.6000, connector_type="CCS2", charger_status="AVAILABLE")

        def side_effect_osrm(orig_lat, orig_lng, dst_lat, dst_lng, *args, **kwargs):
            if abs(dst_lat - 23.1000) < 0.05:
                # Road leg is 200 km (battery available is only 20% = 72 km range, arrival battery would be negative)
                return {"distance_km": 200.0, "duration_minutes": 180, "geometry": {"type": "LineString", "coordinates": []}}
            return {"distance_km": 300.0, "duration_minutes": 270, "geometry": {"type": "LineString", "coordinates": []}}

        mock_osrm_route.side_effect = side_effect_osrm

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Mumbai",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 19.0760,
            "destination_longitude": 72.8777,
            "current_battery_percentage": 20.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn(res.data["error_code"], ["START_BATTERY_TOO_LOW", "NO_REACHABLE_STATION"])

    # 6. Multi-stop route planned with each final OSRM leg reachable
    @patch("ml_engine.trip_planner.get_osrm_multi_stop_route")
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_06_multi_stop_route_planned_with_reachable_legs(self, mock_osrm_route, mock_osrm_multi):
        self.vehicle_ccs2.current_battery_percentage = Decimal("40.00") # 40% battery = 144 km range
        self.vehicle_ccs2.save()

        st1 = self.create_station("Station 1", 22.5645, 72.9289, connector_type="CCS2", charger_status="AVAILABLE")
        st2 = self.create_station("Station 2", 21.7051, 72.9959, connector_type="CCS2", charger_status="AVAILABLE")

        def side_effect_osrm(orig_lat, orig_lng, dst_lat, dst_lng, *args, **kwargs):
            # Origin -> Dest (19.0000, 72.9000) = 410 km
            if abs(orig_lat - 23.0225) < 0.1 and abs(dst_lat - 19.0000) < 0.1:
                return {"distance_km": 410.0, "duration_minutes": 360, "geometry": {"type": "LineString", "coordinates": []}}
            # Origin -> Station 1 = 90 km
            if abs(orig_lat - 23.0225) < 0.1 and abs(dst_lat - 22.5645) < 0.1:
                return {"distance_km": 90.0, "duration_minutes": 80, "geometry": {"type": "LineString", "coordinates": []}}
            # Station 1 -> Dest = 320 km
            if abs(orig_lat - 22.5645) < 0.1 and abs(dst_lat - 19.0000) < 0.1:
                return {"distance_km": 320.0, "duration_minutes": 280, "geometry": {"type": "LineString", "coordinates": []}}
            # Station 1 -> Station 2 = 130 km
            if abs(orig_lat - 22.5645) < 0.1 and abs(dst_lat - 21.7051) < 0.1:
                return {"distance_km": 130.0, "duration_minutes": 110, "geometry": {"type": "LineString", "coordinates": []}}
            # Station 2 -> Dest = 190 km
            if abs(orig_lat - 21.7051) < 0.1 and abs(dst_lat - 19.0000) < 0.1:
                return {"distance_km": 190.0, "duration_minutes": 160, "geometry": {"type": "LineString", "coordinates": []}}
            return {"distance_km": 150.0, "duration_minutes": 120, "geometry": {"type": "LineString", "coordinates": []}}

        mock_osrm_route.side_effect = side_effect_osrm
        mock_osrm_multi.return_value = {
            "distance_km": 410.0,
            "duration_minutes": 350,
            "geometry": {"type": "LineString", "coordinates": []},
            "legs": [
                {"distance_km": 90.0, "duration_minutes": 80},
                {"distance_km": 130.0, "duration_minutes": 110},
                {"distance_km": 190.0, "duration_minutes": 160}
            ]
        }

        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Mumbai Outskirts",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 19.0000,
            "destination_longitude": 72.9000,
            "current_battery_percentage": 40.0
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["charging_required"])
        self.assertEqual(len(res.data["stops"]), 2)

    # 7. Start battery too low returns START_BATTERY_TOO_LOW
    def test_07_start_battery_too_low_returns_422(self):
        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Surat",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 21.1702,
            "destination_longitude": 72.8311,
            "current_battery_percentage": 8.0 # <= 10.0 emergency reserve
        }

        res = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertEqual(res.data["error_code"], "START_BATTERY_TOO_LOW")

    # 8. No feasible route returns HTTP 422 and no trip is saved
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_08_no_feasible_route_returns_422_and_no_trip_saved(self, mock_osrm_route):
        initial_trip_count = Trip.objects.count()

        mock_osrm_route.return_value = {
            "distance_km": 500.0,
            "duration_minutes": 450,
            "geometry": {"type": "LineString", "coordinates": []}
        }

        # No charging stations in DB, destination requires 500km (> max range)
        payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Delhi",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 28.6139,
            "destination_longitude": 77.2090,
            "current_battery_percentage": 50.0
        }

        res_plan = self.client.post("/api/trips/plan/", payload, format="json")
        self.assertEqual(res_plan.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        res_save = self.client.post("/api/trips/", payload, format="json")
        self.assertEqual(res_save.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)

        # Confirm no trip was saved to DB
        self.assertEqual(Trip.objects.count(), initial_trip_count)

    # 9. Saved trip exactly matches planner response
    @patch("ml_engine.trip_planner.get_osrm_route")
    def test_09_saved_trip_matches_planner_response(self, mock_osrm_route):
        self.vehicle_ccs2.current_battery_percentage = Decimal("100.00")
        self.vehicle_ccs2.save()

        mock_osrm_route.return_value = {
            "distance_km": 40.0,
            "duration_minutes": 35,
            "geometry": {"type": "LineString", "coordinates": [[72.57, 23.02], [72.86, 22.69]]}
        }

        plan_payload = {
            "vehicle": self.vehicle_ccs2.id,
            "source": "Ahmedabad",
            "destination": "Nadiad",
            "source_latitude": 23.0225,
            "source_longitude": 72.5714,
            "destination_latitude": 22.6916,
            "destination_longitude": 72.8634,
            "current_battery_percentage": 100.0
        }

        plan_res = self.client.post("/api/trips/plan/", plan_payload, format="json")
        self.assertEqual(plan_res.status_code, status.HTTP_200_OK)

        plan_id = plan_res.data["plan_id"]
        save_res = self.client.post("/api/trips/", {"plan_id": plan_id}, format="json")
        self.assertEqual(save_res.status_code, status.HTTP_201_CREATED)

        saved_trip_data = save_res.data["trip"]
        self.assertEqual(Decimal(str(saved_trip_data["distance_km"])), Decimal(str(plan_res.data["total_distance_km"])))
        self.assertEqual(saved_trip_data["estimated_time"], plan_res.data["total_driving_minutes"])
        self.assertEqual(saved_trip_data["charging_required"], plan_res.data["charging_required"])
        self.assertEqual(saved_trip_data["source"], plan_res.data["origin"]["name"])
        self.assertEqual(saved_trip_data["destination"], plan_res.data["destination"]["name"])
