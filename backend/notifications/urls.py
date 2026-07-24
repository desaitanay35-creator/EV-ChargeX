from django.urls import path
from .views import *

urlpatterns = [
    path("", NotificationListCreateView.as_view(), name="notification-list"),
    path("<int:pk>/", NotificationDetailView.as_view(), name="notification-detail"),
    path("mark-all-read/", mark_all_notifications_read, name="mark-all-read"),
]