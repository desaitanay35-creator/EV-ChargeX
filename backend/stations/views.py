from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.permissions import IsAuthenticated

from .filters import StationFilter
from .models import Station
from .serializers import OperatorStationUpdateSerializer, StationSerializer
from charging.models import ChargingSession
from users.permissions import CanManageStation
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from ml_engine.open_charge_map import fetch_stations

class StationListCreateView(generics.ListCreateAPIView):
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated, CanManageStation]

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "station_name",
        "city",
        "state",
        "address",
    ]

    ordering_fields = [
        "rating",
        "station_name",
        "city",
        "created_at",
    ]

    ordering = [
        "-rating"
    ]

    filterset_fields = [
        "city",
        "status",
        "rating",
    ]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Station.objects.none()
        if user.role in ["ADMIN", "USER"]:
            return Station.objects.all()
        # OPERATOR role sees only assigned stations
        return Station.objects.filter(operator=user)

    def perform_create(self, serializer):
        # Only ADMIN is allowed to create stations per CanManageStation permission
        if "operator" not in serializer.validated_data:
            if self.request.user.role == "OPERATOR":
                serializer.save(operator=self.request.user)
            else:
                serializer.save()
        else:
            serializer.save()


class StationDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, CanManageStation]

    def get_serializer_class(self):
        if self.request.user and self.request.user.role == "OPERATOR":
            return OperatorStationUpdateSerializer
        return StationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Station.objects.none()
        if user.role in ["ADMIN", "USER"]:
            return Station.objects.all()
        # OPERATOR role sees only assigned stations
        return Station.objects.filter(operator=user)

    def perform_update(self, serializer):
        instance = self.get_object()
        new_status = serializer.validated_data.get("status", instance.status)

        if new_status in ["CLOSED", "MAINTENANCE"] and instance.status == "OPEN":
            has_active = ChargingSession.objects.filter(
                charger__station=instance,
                session_status="ACTIVE"
            ).exists()
            if has_active:
                raise ValidationError({
                    "status": "This station has active charging sessions in progress and cannot be marked closed or maintenance right now."
                })

        serializer.save()

class NearbyStationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print("NearbyStationsView called")  
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        distance = request.query_params.get("distance", 20)

        if not latitude or not longitude:
            return Response(
                {"error": "latitude and longitude are required"},
                status=400,
            )

        stations = fetch_stations(
            float(latitude),
            float(longitude),
            float(distance),
        )

        return Response(stations)