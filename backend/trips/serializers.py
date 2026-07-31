from rest_framework import serializers
from .models import Trip
from stations.serializers import StationSerializer


class TripSerializer(serializers.ModelSerializer):
    suggested_station_detail = StationSerializer(source="suggested_station", read_only=True)
    vehicle_name = serializers.ReadOnlyField(source="vehicle.name")
    vehicle_model = serializers.ReadOnlyField(source="vehicle.model")

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]