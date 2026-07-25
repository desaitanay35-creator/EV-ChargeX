from django.urls import path
from .views import *

urlpatterns = [

    path(
        "battery/",
        BatteryPredictionView.as_view(),
        name="battery-prediction"
    ),

    path(
        "station/",
        StationRecommendationView.as_view(),
        name="station-recommendation"
    ),

    path(
        "wait-time/",
        WaitTimePredictionView.as_view(),
        name="wait-time"
    ),

    path(
        "nearby-stations/",
        nearby_stations,
    ),

    path(
    "charging-time/",
    ChargingTimePredictionView.as_view()),

]