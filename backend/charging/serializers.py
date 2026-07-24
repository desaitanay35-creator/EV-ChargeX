from rest_framework import serializers
from .models import Charger, ChargingSession
from stations.models import Station
from users.models import User
from vehicles.models import Vehicle


class ChargerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Charger
        fields = "__all__"


class ChargingSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChargingSession
        fields = "__all__"
        read_only_fields = [
            "energy_consumed_kwh",
            "charging_cost",
            "created_at",
        ]


class NestedSessionStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ["id", "station_name", "city", "address"]


class NestedSessionChargerSerializer(serializers.ModelSerializer):
    station = NestedSessionStationSerializer(read_only=True)

    class Meta:
        model = Charger
        fields = ["id", "charger_name", "charger_number", "charger_type", "connector_type", "power_output_kw", "price_per_kwh", "station"]


class NestedSessionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class NestedSessionVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["id", "brand", "model", "registration_number", "connector_type", "current_battery_percentage"]


class OperatorChargingSessionSerializer(serializers.ModelSerializer):
    charger = NestedSessionChargerSerializer(read_only=True)
    user = serializers.SerializerMethodField()
    vehicle = NestedSessionVehicleSerializer(read_only=True)

    class Meta:
        model = ChargingSession
        fields = "__all__"

    def get_user(self, obj):
        if obj.booking and getattr(obj.booking, "user", None):
            return NestedSessionUserSerializer(obj.booking.user).data
        return None