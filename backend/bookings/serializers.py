from rest_framework import serializers
from django.core.files.storage import default_storage
from .models import Booking
from stations.models import Station
from charging.models import Charger
from users.models import User
from vehicles.models import Vehicle
from trips.models import Trip


class BookingSerializer(serializers.ModelSerializer):
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = [
            "user",
            "booking_status",
            "qr_code",
            "qr_image",
            "qr_image_url",
            "is_qr_used",
            "created_at",
        ]

    def get_qr_image_url(self, obj):
        if not obj.qr_image:
            return None
        request = self.context.get("request")
        url = default_storage.url(obj.qr_image)
        if request:
            return request.build_absolute_uri(url)
        return url


class NestedStationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ["id", "station_name", "city", "state", "address"]


class NestedChargerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Charger
        fields = ["id", "charger_name", "charger_number", "charger_type", "connector_type", "price_per_kwh"]


class NestedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]


class NestedVehicleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vehicle
        fields = ["id", "brand", "model", "registration_number", "connector_type", "current_battery_percentage"]


class NestedTripSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = ["id", "source", "destination", "distance_km", "trip_status", "created_at"]


class OperatorBookingSerializer(serializers.ModelSerializer):
    station = NestedStationSerializer(read_only=True)
    charger = NestedChargerSerializer(read_only=True)
    user = NestedUserSerializer(read_only=True)
    vehicle = serializers.SerializerMethodField()
    trip = NestedTripSerializer(read_only=True)
    active_session_id = serializers.SerializerMethodField()
    qr_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = "__all__"
        read_only_fields = [
            "user",
            "booking_status",
            "qr_code",
            "qr_image",
            "qr_image_url",
            "is_qr_used",
            "created_at",
        ]

    def get_vehicle(self, obj):
        if obj.trip and getattr(obj.trip, "vehicle", None):
            return NestedVehicleSerializer(obj.trip.vehicle).data
        return None

    def get_active_session_id(self, obj):
        session = obj.chargingsession_set.filter(session_status="ACTIVE").first()
        return session.id if session else None

    def get_qr_image_url(self, obj):
        if not obj.qr_image:
            return None
        request = self.context.get("request")
        url = default_storage.url(obj.qr_image)
        if request:
            return request.build_absolute_uri(url)
        return url