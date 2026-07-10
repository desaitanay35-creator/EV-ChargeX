from django.urls import path
from .views import *

urlpatterns = [
    path("", BookingListCreateView.as_view()),
    path("<int:pk>/", BookingDetailView.as_view()),
    path(
    "validate-qr/",
    validate_qr,
    name="validate-qr"),
    

]