from rest_framework import serializers
from .models import Trip
from vehicles.models import Vehicle
from stations.serializers import StationSerializer


class TripPlanRequestSerializer(serializers.Serializer):
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all())
    source = serializers.CharField(max_length=200)
    destination = serializers.CharField(max_length=200)
    source_latitude = serializers.FloatField(min_value=-90.0, max_value=90.0)
    source_longitude = serializers.FloatField(min_value=-180.0, max_value=180.0)
    destination_latitude = serializers.FloatField(min_value=-90.0, max_value=90.0)
    destination_longitude = serializers.FloatField(min_value=-180.0, max_value=180.0)
    current_battery_percentage = serializers.FloatField(min_value=0.0, max_value=100.0, required=False, allow_null=True)


class TripSerializer(serializers.ModelSerializer):
    suggested_station_detail = StationSerializer(source="suggested_station", read_only=True)
    vehicle_name = serializers.ReadOnlyField(source="vehicle.brand")
    vehicle_model = serializers.ReadOnlyField(source="vehicle.model")

    distance_km = serializers.DecimalField(max_digits=8, decimal_places=2, required=False, allow_null=True)
    estimated_time = serializers.IntegerField(required=False, allow_null=True)
    estimated_battery_needed = serializers.DecimalField(max_digits=5, decimal_places=2, required=False, allow_null=True)

    class Meta:
        model = Trip
        fields = "__all__"
        read_only_fields = ["user", "created_at", "updated_at"]