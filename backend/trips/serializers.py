from rest_framework import serializers
from .models import Trip


class TripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            "id",
            "user",
            "vehicle",
            "source",
            "destination",
            "source_latitude",
            "source_longitude",
            "destination_latitude",
            "destination_longitude",
            "distance_km",
            "route_distance",
            "estimated_time",
            "estimated_duration",
            "estimated_battery_needed",
            "battery_before",
            "predicted_battery_after",
            "external_station_id",
            "external_station_name",
            "external_station_operator",
            "external_station_latitude",
            "external_station_longitude",
            "external_station_connector_type",
            "external_station_estimated_wait_time",
            "trip_status",
            "start_time",
            "end_time",
            "created_at",
        ]
        read_only_fields = ["user", "id", "created_at", "trip_status"]