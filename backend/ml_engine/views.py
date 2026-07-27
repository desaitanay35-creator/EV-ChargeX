from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from charging.models import Charger
from vehicles.models import Vehicle
from rest_framework.decorators import api_view
from .open_charge_map import fetch_stations
from charging.utils import normalize_connector
import math
from .services import estimate_charging_time


def _normalize_connection_type(connection):
    if not isinstance(connection, dict):
        return ""

    connection_type = connection.get("ConnectionType")
    title = None
    if isinstance(connection_type, dict):
        title = connection_type.get("Title")
    if not title:
        title = connection.get("ConnectionTypeTitle") or connection.get("Title")

    return normalize_connector(title)


def _extract_station_summary(raw_station):
    address = raw_station.get("AddressInfo", {}) or {}
    operator = raw_station.get("OperatorInfo") or {}
    status_type = raw_station.get("StatusType") or {}
    connections = raw_station.get("Connections") or []
    num_points = raw_station.get("NumberOfPoints") or len(connections)

    return {
        "id": raw_station.get("ID"),
        "station_name": address.get("Title") or raw_station.get("AddressInfo", {}).get("Title") or "Unknown Station",
        "address": address.get("AddressLine1") or "",
        "city": address.get("Town") or address.get("StateOrProvince") or "",
        "state": address.get("StateOrProvince") or "",
        "postcode": address.get("Postcode") or "",
        "latitude": address.get("Latitude"),
        "longitude": address.get("Longitude"),
        "connections": [
            {
                "id": connection.get("ID"),
                "connection_type": _normalize_connection_type(connection),
                "title": (connection.get("ConnectionType") or {}).get("Title") if isinstance(connection.get("ConnectionType"), dict) else connection.get("ConnectionTypeTitle") or connection.get("Title"),
                "power_kw": connection.get("PowerKW") or 0,
                "status": (connection.get("StatusType") or {}).get("Title") if isinstance(connection.get("StatusType"), dict) else connection.get("StatusTypeTitle"),
                "level": (connection.get("Level") or {}).get("Title") if isinstance(connection.get("Level"), dict) else connection.get("Level"),
            }
            for connection in connections
        ],
        "number_of_points": num_points,
        "available_chargers_count": num_points,
        "total_chargers_count": num_points,
        "operator": {
            "id": operator.get("ID"),
            "title": operator.get("Title") if isinstance(operator, dict) else operator,
        },
        "usage_cost": raw_station.get("UsageCost"),
        "status_type": status_type.get("Title") if isinstance(status_type, dict) else status_type,
        "usage_type": (raw_station.get("UsageType") or {}).get("Title") if isinstance(raw_station.get("UsageType"), dict) else raw_station.get("UsageType"),
        "metadata": {
            "website": address.get("RelatedURL"),
            "last_status_update": raw_station.get("DateLastStatusUpdate"),
            "submission_status": (raw_station.get("SubmissionStatus") or {}).get("Title") if isinstance(raw_station.get("SubmissionStatus"), dict) else raw_station.get("SubmissionStatus"),
        },
        "raw": raw_station,
    }


def _has_connector_match(raw_station, desired_connector):
    if not desired_connector:
        return False
    desired = normalize_connector(desired_connector)
    for connection in raw_station.get("Connections", []) or []:
        if _normalize_connection_type(connection) == desired:
            return True
    return False


def _station_score(raw_station, destination_lat, destination_lng, desired_connector, battery_capacity, current_battery_percentage, route_distance):
    summary = _extract_station_summary(raw_station)
    station_lat = summary.get("latitude")
    station_lng = summary.get("longitude")
    if station_lat is None or station_lng is None:
        return -999999

    try:
        dist = math.sqrt(
            (float(station_lat) - destination_lat) ** 2 +
            (float(station_lng) - destination_lng) ** 2
        )
    except (TypeError, ValueError):
        dist = 9999

    connector_match = 1 if _has_connector_match(raw_station, desired_connector) else 0
    total_points = summary.get("number_of_points") or 0
    max_power_kw = max((connection.get("power_kw") or 0) for connection in summary.get("connections", [])) if summary.get("connections") else 0

    battery_penalty = max(0, 100 - (current_battery_percentage or 0))
    estimated_charge_minutes = 0
    if battery_capacity and max_power_kw > 0:
        needed_kwh = battery_capacity * max(0, (100 - (current_battery_percentage or 0))) / 100.0
        estimated_charge_minutes = (needed_kwh / max_power_kw) * 60

    score = 0
    score += connector_match * 250
    score += total_points * 12
    score += max_power_kw * 18
    score -= dist * 8
    score -= battery_penalty * 1.2
    score -= estimated_charge_minutes * 0.4
    score += (route_distance or 0) * 0.1

    return score


class BatteryPredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        battery_percentage = float(request.data.get("battery_percentage", 100))
        distance = float(request.data.get("distance", 0))
        vehicle_id = request.data.get("vehicle_id")

        efficiency = 0.15  # kWh/km default
        battery_capacity = 40.0  # kWh default

        if vehicle_id:
            try:
                vehicle = Vehicle.objects.get(id=vehicle_id)
                efficiency = float(vehicle.efficiency)
                battery_capacity = float(vehicle.battery_capacity)
            except Vehicle.DoesNotExist:
                pass

        # Check efficiency unit and calculate energy consumed in kWh
        # 1. If efficiency is stored in Wh/km (e.g., 150.00), energy = distance * (efficiency / 1000)
        # 2. If efficiency is stored in kWh/100km (e.g., 20.00), energy = distance * (efficiency / 100)
        # 3. If efficiency is stored in kWh/km (e.g., 0.20), energy = distance * efficiency
        if efficiency > 50:
            energy_consumed = distance * (efficiency / 1000.0)
        elif efficiency >= 5:
            energy_consumed = distance * (efficiency / 100.0)
        else:
            energy_consumed = distance * efficiency

        percent_consumed = (energy_consumed / battery_capacity) * 100.0
        predicted_remaining_battery = max(0.0, float(battery_percentage) - percent_consumed)

        return Response({
            "battery_percentage": battery_percentage,
            "distance": distance,
            "predicted_remaining_battery": round(predicted_remaining_battery, 2),
            "energy_consumed_kwh": round(energy_consumed, 2),
            "status": "Success"
        })


class StationRecommendationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("Received payload:", request.data)
        source_lat = request.data.get("source_latitude")
        source_lng = request.data.get("source_longitude")
        destination_lat = request.data.get("destination_latitude")
        destination_lng = request.data.get("destination_longitude")
        connector_type = request.data.get("connector_type")
        battery_capacity = float(request.data.get("battery_capacity", 0) or 0)
        current_battery_percentage = float(request.data.get("current_battery_percentage", 0) or 0)
        route_distance = float(request.data.get("route_distance", 0) or 0)

        try:
            destination_lat = float(destination_lat)
        except (TypeError, ValueError):
            destination_lat = 23.0225

        try:
            destination_lng = float(destination_lng)
        except (TypeError, ValueError):
            destination_lng = 72.5714

        print("Fetching OpenChargeMap stations...")
        try:
            raw_stations = fetch_stations(destination_lat, destination_lng, 20)
        except Exception as exc:
            print("OpenChargeMap fetch failed:", exc)
            return Response({
                "recommended_station": None,
                "recommended_stations": [],
                "estimated_wait_time": 0,
                "message": "Unable to fetch charging stations from OpenChargeMap. Please try again later."
            }, status=502)

        if not isinstance(raw_stations, list):
            raw_stations = []

        print("Fetched", len(raw_stations), "stations")

        filtered = [station for station in raw_stations if station.get("AddressInfo") and station.get("AddressInfo").get("Latitude") is not None and station.get("AddressInfo").get("Longitude") is not None]

        connector_matches = [station for station in filtered if _has_connector_match(station, connector_type)]
        print("Stations after connector filter:", len(connector_matches))

        candidates = connector_matches or filtered
        if not candidates:
            return Response({
                "recommended_station": None,
                "recommended_stations": [],
                "estimated_wait_time": 0,
                "message": "No charging stations were found near the destination."
            })

        scored = []
        for station in candidates:
            score = _station_score(
                station,
                destination_lat,
                destination_lng,
                connector_type,
                battery_capacity,
                current_battery_percentage,
                route_distance,
            )
            scored.append((score, station))

        scored.sort(key=lambda item: item[0], reverse=True)

        recommended_stations = [_extract_station_summary(station) for _, station in scored[:3]]
        recommended_station = recommended_stations[0] if recommended_stations else None

        print("Top recommendation:", recommended_station)

        estimated_wait_time = 15
        if len(recommended_stations) > 0:
            points = recommended_stations[0].get("number_of_points") or 0
            estimated_wait_time = max(5, 30 - points * 2)

        if not connector_matches and filtered:
            return Response({
                "recommended_station": recommended_station,
                "recommended_stations": recommended_stations,
                "estimated_wait_time": estimated_wait_time,
                "message": "OpenChargeMap stations were found, but none matched the requested connector type exactly. Returning nearest stations for review."
            })

        return Response({
            "recommended_station": recommended_station,
            "recommended_stations": recommended_stations,
            "estimated_wait_time": estimated_wait_time,
            "message": "Recommended station(s) returned based on OpenChargeMap data and vehicle criteria."
        })


class WaitTimePredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        station_id = request.data.get("station_id")
        
        if not station_id:
            return Response({
                "predicted_wait_time": 0,
                "message": "station_id is required."
            }, status=400)

        occupied_chargers = Charger.objects.filter(
            station_id=station_id,
            status='OCCUPIED'
        ).count()
        
        predicted_wait_time = occupied_chargers * 15

        return Response({
            "predicted_wait_time": predicted_wait_time,
            "message": "Predicted waiting time computed from active charger occupancy."
        })


class ChargingTimePredictionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        charger_id = request.data.get("charger_id")
        vehicle_id = request.data.get("vehicle_id")
        battery_before = float(request.data.get("battery_before"))
        battery_target = float(request.data.get("battery_target"))

        try:
            charger = Charger.objects.get(id=charger_id)
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except (Charger.DoesNotExist, Vehicle.DoesNotExist):
            return Response(
                {"error": "Invalid charger or vehicle."},
                status=404
            )

        minutes = estimate_charging_time(
            battery_before,
            battery_target,
            float(vehicle.battery_capacity),
            float(charger.power_output_kw)
        )

        return Response({
            "estimated_time_minutes": minutes,
            "charger": charger.charger_name,
            "battery_before": battery_before,
            "battery_target": battery_target,
            "status": "Success"
        })
    
@api_view(["GET"])
def nearby_stations(request):

    latitude = request.GET.get("lat")
    longitude = request.GET.get("lng")

    data = fetch_stations(
        latitude,
        longitude,
    )

    return Response(data)