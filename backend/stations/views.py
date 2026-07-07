from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Station
from .serializers import StationSerializer
from users.permissions import IsAdminOrOperatorOrReadOnly


class StationListCreateView(generics.ListCreateAPIView):
    serializer_class = StationSerializer
    permission_classes = [IsAuthenticated, IsAdminOrOperatorOrReadOnly]

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