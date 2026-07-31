from rest_framework import serializers
from .models import User
from stations.models import Station
from charging.models import ChargingSession



class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")
    phone = serializers.CharField(required=True)
    username = serializers.CharField(required=False)

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'password',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
        ]

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        email = validated_data.get('email')
        username = validated_data.pop('username', email)
        user = User.objects.create_user(
            username=username,
            password=password,
            role='USER',
            **validated_data
        )
        return user



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'profile_image',
            'address',
            'city',
            'state',
            'pincode',
            'is_verified',
        ]


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
            'profile_image',
        ]

    def validate_email(self, value):
        user = self.context['request'].user
        if value and User.objects.filter(email__iexact=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Another user is already registered with this email.")
        return value

    def validate_phone(self, value):
        user = self.context['request'].user
        if value and User.objects.filter(phone=value).exclude(pk=user.pk).exists():
            raise serializers.ValidationError("Another user is already registered with this phone number.")
        return value


class AdminUserListSerializer(serializers.ModelSerializer):
    vehicles_count = serializers.IntegerField(read_only=True, default=0)
    bookings_count = serializers.IntegerField(read_only=True, default=0)
    assigned_stations_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'is_active',
            'is_verified',
            'is_staff',
            'is_superuser',
            'date_joined',
            'last_login',
            'vehicles_count',
            'bookings_count',
            'assigned_stations_count',
        ]


class AdminUserDetailSerializer(serializers.ModelSerializer):
    vehicles_count = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()
    assigned_stations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'is_active',
            'is_verified',
            'is_staff',
            'is_superuser',
            'address',
            'city',
            'state',
            'pincode',
            'profile_image',
            'date_joined',
            'last_login',
            'vehicles_count',
            'bookings_count',
            'assigned_stations',
        ]

    def get_vehicles_count(self, obj):
        return getattr(obj, "vehicles_count", obj.vehicle_set.count())

    def get_bookings_count(self, obj):
        return getattr(obj, "bookings_count", obj.booking_set.count())

    def get_assigned_stations(self, obj):
        if obj.role == "OPERATOR":
            return list(Station.objects.filter(operator=obj).values("id", "station_name", "city"))
        return []


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=False)
    phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_verified = serializers.BooleanField(required=False)

    class Meta:
        model = User
        fields = [
            'first_name',
            'last_name',
            'email',
            'phone',
            'address',
            'city',
            'state',
            'pincode',
            'is_verified',
        ]

    def validate(self, attrs):
        # Explicit rejection for forbidden security fields if passed in request body
        initial = self.initial_data
        for forbidden in ['is_staff', 'is_superuser', 'role', 'is_active', 'password', 'id', 'username']:
            if forbidden in initial:
                raise serializers.ValidationError({
                    forbidden: [f"Field '{forbidden}' cannot be modified through this endpoint. Use dedicated governance actions."]
                })
        return attrs

    def validate_email(self, value):
        instance = self.instance
        if value and User.objects.filter(email__iexact=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Another user is registered with this email.")
        return value

    def validate_phone(self, value):
        instance = self.instance
        if value and User.objects.filter(phone=value).exclude(pk=instance.pk).exists():
            raise serializers.ValidationError("Another user is registered with this phone number.")
        return value


class AdminOperatorListSerializer(serializers.ModelSerializer):
    assigned_stations_count = serializers.IntegerField(read_only=True, default=0)
    assigned_stations = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'is_active',
            'is_verified',
            'date_joined',
            'last_login',
            'assigned_stations_count',
            'assigned_stations',
        ]

    def get_assigned_stations(self, obj):
        stations = getattr(obj, "_prefetched_assigned_stations", None)
        if stations is None:
            stations = Station.objects.filter(operator=obj)

        res = []
        for st in stations:
            chargers_count = st.chargers.count() if hasattr(st, "chargers") else st.charger_set.count()
            active_sessions_count = ChargingSession.objects.filter(charger__station=st, session_status="ACTIVE").count()
            res.append({
                "id": st.id,
                "station_name": st.station_name,
                "city": st.city,
                "status": st.status,
                "chargers_count": chargers_count,
                "active_sessions_count": active_sessions_count,
            })
        return res



class AdminOperatorDetailSerializer(serializers.ModelSerializer):
    assigned_stations_count = serializers.SerializerMethodField()
    assigned_stations = serializers.SerializerMethodField()
    total_chargers_count = serializers.SerializerMethodField()
    total_active_sessions_count = serializers.SerializerMethodField()
    today_bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'role',
            'is_active',
            'is_verified',
            'address',
            'city',
            'state',
            'pincode',
            'profile_image',
            'date_joined',
            'last_login',
            'assigned_stations_count',
            'assigned_stations',
            'total_chargers_count',
            'total_active_sessions_count',
            'today_bookings_count',
        ]

    def get_assigned_stations_count(self, obj):
        return Station.objects.filter(operator=obj).count()

    def get_assigned_stations(self, obj):
        stations = Station.objects.filter(operator=obj)
        res = []
        for st in stations:
            chargers_count = st.chargers.count()
            active_sessions_count = ChargingSession.objects.filter(charger__station=st, session_status="ACTIVE").count()

            res.append({
                "id": st.id,
                "station_name": st.station_name,
                "city": st.city,
                "status": st.status,
                "chargers_count": chargers_count,
                "active_sessions_count": active_sessions_count,
            })
        return res

    def get_total_chargers_count(self, obj):
        from charging.models import Charger
        return Charger.objects.filter(station__operator=obj).count()

    def get_total_active_sessions_count(self, obj):
        return ChargingSession.objects.filter(charger__station__operator=obj, session_status="ACTIVE").count()

    def get_today_bookings_count(self, obj):
        from django.utils import timezone
        from bookings.models import Booking
        today = timezone.now().date()
        return Booking.objects.filter(charger__station__operator=obj, booking_date=today).count()


class AdminOperatorCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True, min_length=8)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(required=True)
    username = serializers.CharField(required=True)
    first_name = serializers.CharField(required=False, allow_blank=True, default="")
    last_name = serializers.CharField(required=False, allow_blank=True, default="")

    class Meta:
        model = User
        fields = [
            'username',
            'first_name',
            'last_name',
            'email',
            'phone',
            'password',
            'confirm_password',
            'address',
            'city',
            'state',
            'pincode',
        ]

    def validate(self, attrs):
        initial = self.initial_data
        for forbidden in ['role', 'is_staff', 'is_superuser', 'is_active', 'is_verified', 'id']:
            if forbidden in initial:
                raise serializers.ValidationError({
                    forbidden: [f"Field '{forbidden}' is prohibited during operator account creation."]
                })

        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")
        if password != confirm_password:
            raise serializers.ValidationError({"confirm_password": ["Passwords do not match."]})

        # Validate with Django password validators
        from django.contrib.auth.password_validation import validate_password
        dummy_user = User(username=attrs.get("username"), email=attrs.get("email"))
        try:
            validate_password(password, user=dummy_user)
        except serializers.ValidationError as err:
            raise err
        except Exception as err:
            if hasattr(err, 'messages'):
                raise serializers.ValidationError({"password": list(err.messages)})
            raise serializers.ValidationError({"password": [str(err)]})

        return attrs

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with this username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_phone(self, value):
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("A user with this phone number already exists.")
        return value