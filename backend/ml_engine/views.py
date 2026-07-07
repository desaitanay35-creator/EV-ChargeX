from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from stations.models import Station
from charging.models import Charger
from vehicles.models import Vehicle
from stations.serializers import StationSerializer
import math



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
        vehicle_id = request.data.get("vehicle_id")
        destination_lat = request.data.get("destination_latitude")
        destination_lng = request.data.get("destination_longitude")

        # Fallback coordinate (e.g. Center of Ahmedabad)
        if destination_lat is None or destination_lng is None:
            destination_lat = 23.0225
            destination_lng = 72.5714
        else:
            destination_lat = float(destination_lat)
            destination_lng = float(destination_lng)

        stations = Station.objects.filter(status='OPEN')
        
        # Filter stations matching vehicle's connector type if vehicle_id is provided
        if vehicle_id:
            try:
                vehicle = Vehicle.objects.get(id=vehicle_id)
                station_ids = Charger.objects.filter(
                    connector_type=vehicle.connector_type
                ).values_list('station_id', flat=True)
                stations = stations.filter(id__in=station_ids)
            except Vehicle.DoesNotExist:
                pass

        if not stations.exists():
            stations = Station.objects.filter(status='OPEN')

        recommended_station = None
        min_dist = float('inf')

        for station in stations:
            # Simple Euclidean distance
            dist = math.sqrt(
                (float(station.latitude) - destination_lat) ** 2 +
                (float(station.longitude) - destination_lng) ** 2
            )
            if dist < min_dist:
                min_dist = dist
                recommended_station = station

        if recommended_station:
            # Simple wait time heuristic: 15 minutes per occupied charger at the station
            occupied_chargers = Charger.objects.filter(
                station=recommended_station,
                status='OCCUPIED'
            ).count()
            estimated_wait_time = occupied_chargers * 15

            station_data = StationSerializer(recommended_station, context={'request': request}).data

            return Response({
                "recommended_station": station_data,
                "estimated_wait_time": estimated_wait_time,
                "message": "Recommended closest station matching EV criteria."
            })
        
        return Response({
            "recommended_station": None,
            "estimated_wait_time": 0,
            "message": "No suitable charging station found."
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