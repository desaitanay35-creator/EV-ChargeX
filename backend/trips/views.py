from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Trip
from .serializers import TripSerializer
from stations.models import Station
from ml_engine.services import recommend_station

class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        trip = serializer.save(user=request.user)

        # -------------------------
        # Dummy Business Logic
        # -------------------------

        battery_needed = float(trip.distance_km) * 0.20

        charging_required = battery_needed > 30

        station = (
    Station.objects.filter(status="ACTIVE")
    .order_by("-available_chargers")
    .first()
        )

        recommended_station = station.station_name if station else "No Station Available"

        wait_time = "10 Minutes" if charging_required else "No Waiting"

        return Response(
            {
                "message": "Trip created successfully.",
                "trip": TripSerializer(trip).data,

                "prediction": {
                    "battery_needed": round(battery_needed, 2),
                    "charging_required": charging_required,
                    "recommended_station": {"station_name": recommended_station},
                    "estimated_wait_time": wait_time,
                },
            },
            status=status.HTTP_201_CREATED,
        )


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)