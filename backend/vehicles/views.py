from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Vehicle
from .serializers import VehicleSerializer
from users.models import User

@api_view(['GET'])
def get_vehicles(request):
    user = User.objects.first()
    vehicles = Vehicle.objects.filter(user=user)

    serializer = VehicleSerializer(
        vehicles,
        many=True
    )

    return Response(serializer.data)


@api_view(['POST'])
def add_vehicle(request):

    data = request.data.copy()

    # temporary
    data['user'] = User.objects.first().id

    serializer = VehicleSerializer(data=data)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    print(serializer.errors)

    return Response(serializer.errors, status=400)

@api_view(['DELETE'])
def delete_vehicle(request, pk):

    vehicle = get_object_or_404(
        Vehicle,
        id=pk
    )

    vehicle.delete()

    return Response({
        "message": "Vehicle deleted successfully"
    })