from rest_framework import serializers


class BatteryPredictionSerializer(serializers.Serializer):
    vehicle_id = serializers.IntegerField()
    distance = serializers.FloatField()
    traffic = serializers.ChoiceField(
        choices=["LOW", "MEDIUM", "HIGH"]
    )
    ac_on = serializers.BooleanField()
    average_speed = serializers.FloatField()


class StationRecommendationSerializer(serializers.Serializer):
    trip_id = serializers.IntegerField()


class ChargingTimeSerializer(serializers.Serializer):
    charger_id = serializers.IntegerField()
    battery_before = serializers.FloatField()
    battery_target = serializers.FloatField()


class WaitTimeSerializer(serializers.Serializer):
    station_id = serializers.IntegerField()