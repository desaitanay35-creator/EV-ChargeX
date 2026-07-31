from rest_framework import serializers
from django.core.files.storage import default_storage
from .models import Booking
from stations.models import Station
from charging.models import Charger
from users.models import User
from vehicles.models import Vehicle
from trips.models import Trip


class BookingSerializer(serializers.ModelSerializer):
    vehicle = serializers.PrimaryKeyRelatedField(
        queryset=Vehicle.objects.all(),
        required=False,
        allow_null=True
    )
    booking_type = serializers.SerializerMethodField()
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

    def get_booking_type(self, obj):
        return "TRIP_BASED" if obj.trip_id else "CHARGING_ONLY"

    def get_qr_image_url(self, obj):
        if not obj.qr_image:
            return None
        request = self.context.get("request")
        url = default_storage.url(obj.qr_image)
        if request:
            return request.build_absolute_uri(url)
        return url if url.startswith("http") or url.startswith("/") else f"/media/{url}"

    def validate(self, attrs):
        request = self.context.get("request")
        user = request.user if request else None

        vehicle = attrs.get("vehicle")
        trip = attrs.get("trip")
        station = attrs.get("station")
        charger = attrs.get("charger")
        booking_date = attrs.get("booking_date")
        start_time = attrs.get("booking_start_time")
        end_time = attrs.get("booking_end_time")

        # Resolve vehicle from trip if not explicitly provided
        if not vehicle and trip:
            vehicle = trip.vehicle
            attrs["vehicle"] = vehicle

        if not vehicle:
            raise serializers.ValidationError({"vehicle": "A vehicle must be selected for every booking."})

        # Vehicle ownership validation
        if user and user.role == "USER" and vehicle.user != user:
            raise serializers.ValidationError({"vehicle": "Selected vehicle does not belong to your account."})

        # Trip ownership & consistency validation
        if trip:
            if user and user.role == "USER" and trip.user != user:
                raise serializers.ValidationError({"trip": "Selected trip does not belong to your account."})
            if trip.vehicle != vehicle:
                raise serializers.ValidationError({"vehicle": "Selected vehicle does not match the trip's vehicle."})

        # Station & Charger consistency
        if station:
            if not getattr(station, "booking_enabled", True):
                raise serializers.ValidationError({"station": "Discovery only — direct booking is not yet available at this station."})
            if station.status != "OPEN":
                raise serializers.ValidationError({"station": "Selected station is currently closed or inactive."})


        if charger and station and charger.station != station:
            raise serializers.ValidationError({"charger": "Selected charger does not belong to this station."})

        # Connector compatibility
        if vehicle and charger:
            from charging.utils import is_connector_compatible
            if not is_connector_compatible(vehicle.connector_type, charger.connector_type):
                raise serializers.ValidationError({
                    "charger": f"Selected charger ({charger.connector_type}) is not compatible with vehicle ({vehicle.connector_type})."
                })

        # Date & time range validation
        if booking_date and start_time and end_time:
            from django.utils import timezone
            now = timezone.localtime()
            today = now.date()

            if booking_date < today:
                raise serializers.ValidationError({"booking_date": "Booking date cannot be in the past."})

            if start_time >= end_time:
                raise serializers.ValidationError({"booking_start_time": "Booking start time must be earlier than end time."})

            if booking_date == today and start_time <= now.time():
                raise serializers.ValidationError({"booking_start_time": "Booking start time has already passed for today."})

            if station:
                if station.opening_time and start_time < station.opening_time:
                    raise serializers.ValidationError({"booking_start_time": f"Station opens at {station.opening_time}."})
                if station.closing_time and end_time > station.closing_time:
                    raise serializers.ValidationError({"booking_end_time": f"Station closes at {station.closing_time}."})

        return attrs


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
    vehicle = NestedVehicleSerializer(read_only=True)
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