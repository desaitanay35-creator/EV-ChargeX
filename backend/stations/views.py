from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Station
from .serializers import StationSerializer
from users.permissions import IsAdminOrOperatorOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

from .filters import StationFilter

class StationListCreateView(generics.ListCreateAPIView):
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperatorOrReadOnly]

    filter_backends = [
    DjangoFilterBackend,
    SearchFilter,
    OrderingFilter,]


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

    search_fields = [
        "station_name",
        "city",
        "address",
    ]

    def get_queryset(self):
        if self.request.user.role in ["ADMIN", "USER"]:
            return Station.objects.all()
        return Station.objects.filter(operator=self.request.user)

    def perform_create(self, serializer):
        serializer.save(operator=self.request.user)


class StationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperatorOrReadOnly]

    def get_queryset(self):
        if self.request.user.role in ["ADMIN", "USER"]:
            return Station.objects.all()
        return Station.objects.filter(operator=self.request.user)