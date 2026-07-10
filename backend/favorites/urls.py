from django.urls import path
from .views import (
    FavoriteStationListCreateView,
    FavoriteStationDetailView,
)

urlpatterns = [
    path("", FavoriteStationListCreateView.as_view()),
    path("<int:pk>/", FavoriteStationDetailView.as_view()),
]