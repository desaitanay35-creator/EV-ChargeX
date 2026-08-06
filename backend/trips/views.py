from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.core.cache import cache
from django.utils import timezone
from django.db import transaction
from datetime import timedelta

from .models import Trip
from .serializers import TripSerializer, TripPlanRequestSerializer
from ml_engine.trip_planner import plan_trip_logic, TripPlanningError
from vehicles.models import Vehicle
from stations.models import Station


class TripPlanView(APIView):
    """
    POST /api/trips/plan/
    Authoritative backend EV trip planning endpoint.
    Returns versioned plan response with plan_id, or HTTP 422 on failure.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = TripPlanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle = serializer.validated_data["vehicle"]
        if vehicle.user != request.user:
            raise ValidationError({"vehicle": "Selected vehicle does not belong to your account."})

        try:
            plan = plan_trip_logic(
                vehicle=vehicle,
                source_name=serializer.validated_data["source"].strip(),
                destination_name=serializer.validated_data["destination"].strip(),
                source_lat=serializer.validated_data["source_latitude"],
                source_lng=serializer.validated_data["source_longitude"],
                dest_lat=serializer.validated_data["destination_latitude"],
                dest_lng=serializer.validated_data["destination_longitude"],
                current_battery_percentage=serializer.validated_data.get("current_battery_percentage")
            )

            # Cache plan snapshot for saving
            cache_key = f"trip_plan_{plan['plan_id']}_{request.user.id}"
            cache.set(cache_key, plan, timeout=3600)

            return Response(plan, status=status.HTTP_200_OK)

        except TripPlanningError as err:
            return Response(
                {
                    "error_code": err.error_code,
                    "message": err.message,
                    "diagnostics": err.diagnostics,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )


class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user).order_by("-created_at")

    def create(self, request, *args, **kwargs):
        plan_id = request.data.get("plan_id")

        if plan_id:
            cache_key = f"trip_plan_{plan_id}_{request.user.id}"
            plan = cache.get(cache_key)

            if plan:
                vehicle_id = plan["vehicle"]["id"]
                try:
                    vehicle = Vehicle.objects.get(id=vehicle_id, user=request.user)
                except Vehicle.DoesNotExist:
                    raise ValidationError({"vehicle": "Vehicle for this plan was not found or does not belong to you."})

                first_stop_st = None
                if plan.get("stops"):
                    st_id = plan["stops"][0]["station"]["id"]
                    first_stop_st = Station.objects.filter(id=st_id).first()

                trip = Trip.objects.create(
                    user=request.user,
                    vehicle=vehicle,
                    source=plan["origin"]["name"],
                    destination=plan["destination"]["name"],
                    source_latitude=plan["origin"]["latitude"],
                    source_longitude=plan["origin"]["longitude"],
                    destination_latitude=plan["destination"]["latitude"],
                    destination_longitude=plan["destination"]["longitude"],
                    distance_km=plan["total_distance_km"],
                    estimated_time=plan["total_driving_minutes"],
                    estimated_battery_needed=round(max(0.0, float(plan["vehicle"]["current_battery_percentage"]) - float(plan["estimated_destination_battery_percentage"])), 2),
                    current_battery_percentage=plan["vehicle"]["current_battery_percentage"],
                    estimated_destination_battery=plan["estimated_destination_battery_percentage"],
                    charging_required=plan["charging_required"],
                    suggested_station=first_stop_st,
                    suggested_stations_json=plan.get("stops", []),
                    route_geometry=plan.get("route_geometry"),
                    trip_status="PLANNED",
                )

                return Response(
                    {
                        "message": "Trip saved successfully.",
                        "trip": TripSerializer(trip).data,
                        "plan": plan,
                    },
                    status=status.HTTP_201_CREATED
                )

        # Fallback / Direct creation via parameters: compute plan on backend before saving
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        vehicle = serializer.validated_data["vehicle"]
        if vehicle.user != request.user:
            raise ValidationError({"vehicle": "Selected vehicle does not belong to your account."})

        source = serializer.validated_data["source"].strip()
        destination = serializer.validated_data["destination"].strip()
        src_lat = serializer.validated_data.get("source_latitude") or 23.0225
        src_lng = serializer.validated_data.get("source_longitude") or 72.5714
        dst_lat = serializer.validated_data.get("destination_latitude") or 21.1702
        dst_lng = serializer.validated_data.get("destination_longitude") or 72.8311

        try:
            plan = plan_trip_logic(
                vehicle=vehicle,
                source_name=source,
                destination_name=destination,
                source_lat=src_lat,
                source_lng=src_lng,
                dest_lat=dst_lat,
                dest_lng=dst_lng,
                current_battery_percentage=serializer.validated_data.get("current_battery_percentage")
            )
        except TripPlanningError as err:
            return Response(
                {
                    "error_code": err.error_code,
                    "message": err.message,
                    "diagnostics": err.diagnostics,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY
            )

        first_stop_st = None
        if plan.get("stops"):
            st_id = plan["stops"][0]["station"]["id"]
            first_stop_st = Station.objects.filter(id=st_id).first()

        trip = Trip.objects.create(
            user=request.user,
            vehicle=vehicle,
            source=source,
            destination=destination,
            source_latitude=src_lat,
            source_longitude=src_lng,
            destination_latitude=dst_lat,
            destination_longitude=dst_lng,
            distance_km=plan["total_distance_km"],
            estimated_time=plan["total_driving_minutes"],
            estimated_battery_needed=round(max(0.0, float(plan["vehicle"]["current_battery_percentage"]) - float(plan["estimated_destination_battery_percentage"])), 2),
            current_battery_percentage=plan["vehicle"]["current_battery_percentage"],
            estimated_destination_battery=plan["estimated_destination_battery_percentage"],
            charging_required=plan["charging_required"],
            suggested_station=first_stop_st,
            suggested_stations_json=plan.get("stops", []),
            route_geometry=plan.get("route_geometry"),
            trip_status="PLANNED",
        )

        return Response(
            {
                "message": "Trip created successfully.",
                "trip": TripSerializer(trip).data,
                "plan": plan,
            },
            status=status.HTTP_201_CREATED
        )


class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def perform_destroy(self, instance):
        if instance.trip_status == 'ONGOING':
            raise ValidationError({"detail": "Cannot delete an ongoing trip. End or cancel it first."})
        instance.delete()


class TripStartView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            trip = Trip.objects.select_for_update().get(pk=pk, user=request.user)
        except Trip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        if trip.trip_status == "ONGOING":
            return Response({"detail": "This trip is already ongoing."}, status=status.HTTP_400_BAD_REQUEST)

        if trip.trip_status == "COMPLETED":
            return Response({"detail": "Cannot start a completed trip."}, status=status.HTTP_400_BAD_REQUEST)

        if trip.trip_status == "CANCELLED":
            return Response({"detail": "Cannot start a cancelled trip."}, status=status.HTTP_400_BAD_REQUEST)

        has_ongoing = Trip.objects.filter(user=request.user, trip_status="ONGOING").exclude(pk=pk).exists()
        if has_ongoing:
            return Response(
                {"detail": "You already have an active trip. Please end the current trip before starting another one."},
                status=status.HTTP_400_BAD_REQUEST
            )

        start_lat = request.data.get("actual_start_latitude")
        start_lng = request.data.get("actual_start_longitude")

        trip.trip_status = "ONGOING"
        trip.start_time = timezone.now()

        if start_lat is not None:
            trip.actual_start_latitude = start_lat
        if start_lng is not None:
            trip.actual_start_longitude = start_lng

        if trip.charging_required and trip.suggested_station:
            trip.navigation_stage = "TO_STATION"
        else:
            trip.navigation_stage = "TO_DESTINATION"

        trip.save()
        return Response(TripSerializer(trip).data, status=status.HTTP_200_OK)


class TripEndView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            trip = Trip.objects.select_for_update().get(pk=pk, user=request.user)
        except Trip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        if trip.trip_status != "ONGOING":
            return Response({"detail": f"Cannot end a trip with status '{trip.trip_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        end_lat = request.data.get("actual_end_latitude")
        end_lng = request.data.get("actual_end_longitude")
        actual_dist = request.data.get("actual_distance_km")

        trip.trip_status = "COMPLETED"
        trip.end_time = timezone.now()

        if end_lat is not None:
            trip.actual_end_latitude = end_lat
        if end_lng is not None:
            trip.actual_end_longitude = end_lng
        if actual_dist is not None:
            trip.actual_distance_km = actual_dist

        if trip.start_time:
            duration_secs = (trip.end_time - trip.start_time).total_seconds()
            trip.actual_duration_minutes = max(1, int(round(duration_secs / 60.0)))

        trip.save()
        return Response(TripSerializer(trip).data, status=status.HTTP_200_OK)


class TripContinueView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        try:
            trip = Trip.objects.select_for_update().get(pk=pk, user=request.user)
        except Trip.DoesNotExist:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)

        if trip.trip_status != "ONGOING":
            return Response({"detail": "Only ongoing trips can transition navigation stage."}, status=status.HTTP_400_BAD_REQUEST)

        trip.navigation_stage = "TO_DESTINATION"
        trip.save(update_fields=["navigation_stage", "updated_at"])
        return Response(TripSerializer(trip).data, status=status.HTTP_200_OK)