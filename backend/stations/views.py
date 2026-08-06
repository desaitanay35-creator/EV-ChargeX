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
            return Station.objects.all().prefetch_related("chargers")
        # OPERATOR role sees only assigned stations
        return Station.objects.filter(operator=user).prefetch_related("chargers")

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
            return Station.objects.all().prefetch_related("chargers")
        # OPERATOR role sees only assigned stations
        return Station.objects.filter(operator=user).prefetch_related("chargers")

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