from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta

from .models import Trip
from .serializers import TripSerializer
from ml_engine.trip_planner import plan_trip


class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle = serializer.validated_data["vehicle"]
        if vehicle.user != request.user:
            raise ValidationError({"vehicle": "Selected vehicle does not belong to your account."})

        distance_km = serializer.validated_data.get("distance_km")
        if distance_km is not None and distance_km <= 0:
            raise ValidationError({"distance_km": "Distance must be a positive number."})

        estimated_time = serializer.validated_data.get("estimated_time")
        if estimated_time is not None and estimated_time <= 0:
            raise ValidationError({"estimated_time": "Estimated duration must be a positive number."})

        estimated_battery = serializer.validated_data.get("estimated_battery_needed")
        if estimated_battery is not None and estimated_battery < 0:
            raise ValidationError({"estimated_battery_needed": "Estimated battery needed cannot be negative."})

        # Validate coordinates if provided
        for field in ["source_latitude", "destination_latitude"]:
            val = serializer.validated_data.get(field)
            if val is not None and not (-90 <= float(val) <= 90):
                raise ValidationError({field: "Latitude must be between -90 and 90 degrees."})

        for field in ["source_longitude", "destination_longitude"]:
            val = serializer.validated_data.get(field)
            if val is not None and not (-180 <= float(val) <= 180):
                raise ValidationError({field: "Longitude must be between -180 and 180 degrees."})

        source = serializer.validated_data["source"].strip()
        destination = serializer.validated_data["destination"].strip()
        recent_window = timezone.now() - timedelta(seconds=15)

        recent_duplicate = Trip.objects.filter(
            user=request.user,
            vehicle=vehicle,
            source__iexact=source,
            destination__iexact=destination,
            created_at__gte=recent_window
        ).order_by("-created_at").first()

        if recent_duplicate:
            trip = recent_duplicate
            trip_plan = plan_trip(trip)
            return Response(
                {
                    "message": "Trip already planned recently.",
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
                        "estimated_wait_time": f'{trip_plan["wait_time"]} Minutes',
                        "estimated_cost": trip_plan["estimated_cost"],
                    }
                },
                status=status.HTTP_200_OK,
            )

        # Force backend-controlled status as PLANNED
        trip = serializer.save(user=request.user, trip_status='PLANNED')

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
                    "estimated_wait_time": f'{trip_plan["wait_time"]} Minutes',
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