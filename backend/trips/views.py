from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Trip
from .serializers import TripSerializer
from stations.models import Station
from ml_engine.services import recommend_station
from ml_engine.wait_time import predict_wait_time
from ml_engine.trip_planner import plan_trip

from ml_engine.predictors import (
    predict_battery_usage,
    charging_required,
)



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

        trip_plan = plan_trip(trip)

        return Response(
            {
                "message": "Trip created successfully.",
                "trip": TripSerializer(trip).data,

                "prediction": {
                        "battery_needed": trip_plan["battery_needed"],
                        "charging_required": trip_plan["charging_required"],
                        "recommended_station": {
                            "station_name": (
                                trip_plan["recommended_station"].station_name
                                if trip_plan["recommended_station"]
                                else "No Station Available"
                            ),
                        },
                        "estimated_wait_time": (
                            f'{trip_plan["wait_time"]} Minutes'
                        ),
                        "estimated_cost": trip_plan["estimated_cost"],
                }
            },
            status=status.HTTP_201_CREATED,
        )


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)