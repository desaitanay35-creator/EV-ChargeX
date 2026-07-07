from django.urls import path
from .views import (
    ChargerListCreateView,
    ChargerDetailView,
    ChargingSessionListCreateView,
    ChargingSessionDetailView,
    end_charging_session,
)

urlpatterns = [
    path('chargers/', ChargerListCreateView.as_view()),
    path('chargers/<int:pk>/', ChargerDetailView.as_view()),

    path('sessions/', ChargingSessionListCreateView.as_view()),
    path('sessions/<int:pk>/', ChargingSessionDetailView.as_view()),
    path("end/<int:session_id>/",end_charging_session,name="end-charging",),
]