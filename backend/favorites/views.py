from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import FavoriteStation
from .serializers import FavoriteStationSerializer


class FavoriteStationListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = FavoriteStationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteStation.objects.filter(
            user=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user
        )


class FavoriteStationDetailView(
    generics.RetrieveDestroyAPIView
):
    serializer_class = FavoriteStationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FavoriteStation.objects.filter(
            user=self.request.user
        )