from django.urls import path
from .views import (
    TripPlanView,
    TripListCreateView,
    TripDetailView,
    TripStartView,
    TripEndView,
    TripContinueView,
)

urlpatterns = [
    path("", TripListCreateView.as_view(), name="trip-list"),
    path("plan/", TripPlanView.as_view(), name="trip-plan"),
    path("<int:pk>/", TripDetailView.as_view(), name="trip-detail"),
    path("<int:pk>/start/", TripStartView.as_view(), name="trip-start"),
    path("<int:pk>/end/", TripEndView.as_view(), name="trip-end"),
    path("<int:pk>/continue-to-destination/", TripContinueView.as_view(), name="trip-continue"),
]