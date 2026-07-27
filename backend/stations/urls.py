from django.urls import path
from .views import StationListCreateView, StationDetailView,NearbyStationsView

urlpatterns = [
    path('', StationListCreateView.as_view()),
    path('<int:pk>/', StationDetailView.as_view()),
    path('nearby/', NearbyStationsView.as_view()),
]