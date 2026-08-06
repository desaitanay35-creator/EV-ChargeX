from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User
from .permissions import IsAdmin
from .serializers import (
    AdminOperatorCreateSerializer,
    AdminOperatorDetailSerializer,
    AdminOperatorListSerializer,
    AdminUserDetailSerializer,
    AdminUserListSerializer,
    AdminUserUpdateSerializer,
    UserProfileSerializer,
    UserProfileUpdateSerializer,
    UserRegistrationSerializer,
)
from .services import block_user, change_user_role, create_operator, reassign_station_operator, unblock_user



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        refresh["username"] = user.username
        refresh["role"] = user.role

        return Response({
            "token": str(refresh.access_token),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role,
            }
        }, status=201)


class LoginSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["username"] = user.username
        token["role"] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data["token"] = data["access"]
        data["role"] = self.user.role
        data["user"] = {
            "id": self.user.id,
            "username": self.user.username,
            "email": self.user.email,
            "role": self.user.role,
        }
        return data


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = UserProfileUpdateSerializer(
            request.user,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)


# -------------------- Admin User Governance Views --------------------

class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserListSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        qs = User.objects.annotate(
            vehicles_count=Count("vehicle", distinct=True),
            bookings_count=Count("booking", distinct=True),
            assigned_stations_count=Count("stations", distinct=True)
        )

        search = self.request.query_params.get("search", "").strip()
        role = self.request.query_params.get("role", "").strip().upper()
        status_param = self.request.query_params.get("status", "").strip().lower()
        verified = self.request.query_params.get("verified", "").strip().lower()
        ordering = self.request.query_params.get("ordering", "-date_joined").strip()

        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        if role in ["ADMIN", "OPERATOR", "USER"]:
            qs = qs.filter(role=role)

        if status_param == "active":
            qs = qs.filter(is_active=True)
        elif status_param == "inactive":
            qs = qs.filter(is_active=False)

        if verified == "true":
            qs = qs.filter(is_verified=True)
        elif verified == "false":
            qs = qs.filter(is_verified=False)

        if ordering == "newest":
            qs = qs.order_by("-date_joined")
        elif ordering == "oldest":
            qs = qs.order_by("date_joined")
        elif ordering == "username":
            qs = qs.order_by("username")
        elif ordering == "last_login":
            qs = qs.order_by("-last_login")
        else:
            qs = qs.order_by("-date_joined")

        return qs


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_queryset(self):
        return User.objects.annotate(
            vehicles_count=Count("vehicle", distinct=True),
            bookings_count=Count("booking", distinct=True)
        )

    def get_serializer_class(self):
        if self.request.method in ["PATCH", "PUT"]:
            return AdminUserUpdateSerializer
        return AdminUserDetailSerializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        serializer = AdminUserUpdateSerializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminUserDetailSerializer(instance).data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def block_user_view(request, pk):
    target_user = get_object_or_404(User, pk=pk)
    user = block_user(actor=request.user, target_user=target_user)
    return Response({
        "message": f"User '{user.username}' has been blocked successfully.",
        "id": user.id,
        "is_active": user.is_active
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def unblock_user_view(request, pk):
    target_user = get_object_or_404(User, pk=pk)
    user = unblock_user(actor=request.user, target_user=target_user)
    return Response({
        "message": f"User '{user.username}' has been unblocked successfully.",
        "id": user.id,
        "is_active": user.is_active
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def change_user_role_view(request, pk):
    target_user = get_object_or_404(User, pk=pk)
    new_role = request.data.get("role")
    if not new_role:
        return Response({"role": ["Target role is required."]}, status=400)

    user = change_user_role(actor=request.user, target_user=target_user, new_role=new_role)
    return Response({
        "message": f"Role for user '{user.username}' changed to '{user.role}'.",
        "id": user.id,
        "role": user.role
    })


# -------------------- Admin Operator Governance Views --------------------

class AdminOperatorListView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminOperatorCreateSerializer
        return AdminOperatorListSerializer

    def get_queryset(self):
        qs = User.objects.filter(role="OPERATOR").annotate(
            assigned_stations_count=Count("stations", distinct=True)
        )

        search = self.request.query_params.get("search", "").strip()
        status_param = self.request.query_params.get("status", "").strip().lower()
        assignment = self.request.query_params.get("assignment", "").strip().lower()
        station_id = self.request.query_params.get("station", "").strip()
        ordering = self.request.query_params.get("ordering", "-date_joined").strip()

        if search:
            qs = qs.filter(
                Q(username__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search) |
                Q(email__icontains=search) |
                Q(phone__icontains=search)
            )

        if status_param == "active":
            qs = qs.filter(is_active=True)
        elif status_param == "blocked":
            qs = qs.filter(is_active=False)

        if assignment in ["assigned", "with_assigned"]:
            qs = qs.filter(assigned_stations_count__gt=0)
        elif assignment in ["unassigned", "without_assigned"]:
            qs = qs.filter(assigned_stations_count=0)

        if station_id and station_id.isdigit():
            qs = qs.filter(station__id=int(station_id))

        if ordering == "newest":
            qs = qs.order_by("-date_joined")
        elif ordering == "oldest":
            qs = qs.order_by("date_joined")
        elif ordering == "username":
            qs = qs.order_by("username")
        elif ordering == "station_count":
            qs = qs.order_by("-assigned_stations_count", "username")
        elif ordering == "last_login":
            qs = qs.order_by("-last_login")
        else:
            qs = qs.order_by("-date_joined")

        return qs

    def create(self, request, *args, **kwargs):
        serializer = AdminOperatorCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        user = create_operator(actor=request.user, validated_data=serializer.validated_data)
        return Response(AdminOperatorDetailSerializer(user).data, status=status.HTTP_201_CREATED)



class AdminOperatorDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request, pk):
        operator = get_object_or_404(User, pk=pk, role="OPERATOR")
        serializer = AdminOperatorDetailSerializer(operator)
        return Response(serializer.data)



@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdmin])
def admin_assign_station_operator_view(request, station_id):
    operator_id = request.data.get("operator_id")
    if not operator_id:
        return Response({"operator_id": ["Target operator_id is required."]}, status=status.HTTP_400_BAD_REQUEST)

    result = reassign_station_operator(
        actor=request.user,
        station_id=station_id,
        new_operator_id=operator_id
    )

    current_op_data = {
        "id": result["current_operator"].id,
        "username": result["current_operator"].username
    } if result["current_operator"] else None

    new_op_data = {
        "id": result["new_operator"].id,
        "username": result["new_operator"].username
    }

    return Response({
        "message": result["message"],
        "reassigned": result["reassigned"],
        "station_id": result["station"].id,
        "station_name": result["station"].station_name,
        "current_operator": current_op_data,
        "new_operator": new_op_data,
        "active_sessions_count": result["active_sessions_count"],
        "upcoming_bookings_count": result["upcoming_bookings_count"]
    }, status=status.HTTP_200_OK)