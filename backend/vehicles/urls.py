from django.urls import path
from .views import delete_vehicle, get_vehicles, add_vehicle

urlpatterns = [
    path('', get_vehicles),
    path('add/', add_vehicle),
    path('<int:pk>/', delete_vehicle),
]