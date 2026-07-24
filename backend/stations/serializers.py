from rest_framework import serializers
from .models import Station
from users.models import User


class StationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = "__all__"

    def validate_operator(self, value):
        if value and value.role != "OPERATOR":
            raise serializers.ValidationError("The selected user must have the OPERATOR role.")
        return value

    def to_internal_value(self, data):
        ret = super().to_internal_value(data)
        request = self.context.get("request")
        # Non-admin users cannot assign or mutate the operator field
        if request and request.user and request.user.role != "ADMIN":
            ret.pop("operator", None)
        return ret


class OperatorStationUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = [
            "station_name",
            "address",
            "city",
            "state",
            "pincode",
            "latitude",
            "longitude",
            "opening_time",
            "closing_time",
            "contact_number",
            "email",
            "amenities",
            "status",
        ]
        read_only_fields = ["operator", "rating"]