from rest_framework import serializers
from .models import Charger, ChargingSession


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