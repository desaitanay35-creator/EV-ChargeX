from django.shortcuts import render

# Create your views here.
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListCreateView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class NotificationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    updated_count = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).update(is_read=True)
    return Response({
        "message": "All notifications marked as read.",
        "updated": updated_count
    })