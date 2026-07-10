from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
from .serializers import RegisterSerializer, UserSerializer,UserProfileSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response({
            "message": "Registration successful"
        })

    return Response(serializer.errors, status=400)


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"message": "Invalid email or password"},
            status=400
        )

    user = authenticate(
        username=user_obj.username,
        password=password
    )

    if user is None:
        return Response(
            {"message": "Invalid email or password"},
            status=400
        )

    return Response({
        "token": "demo-token",
        "user": UserSerializer(user).data
    })

@api_view(['GET', 'PUT'])
def profile(request):

    # Temporary:
    # later replace with authenticated user
    user = User.objects.first()

    if request.method == 'GET':
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    serializer = UserProfileSerializer(
        user,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(['GET'])
def dashboard(request):
    return Response({
        "total_bookings": 0,
        "active_sessions": 0,
        "vehicles": 0
    })

@api_view(['GET'])
def notifications(request):
    return Response([])