from django.urls import path
from .views import *

urlpatterns = [
    path("", NotificationListCreateView.as_view(), name="notification-list"),
    path("<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
]