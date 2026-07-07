from django.urls import path
from .views import *

urlpatterns = [
    path("", PaymentListCreateView.as_view(), name="payment-list"),
    path("<int:pk>/", PaymentDetailView.as_view(), name="payment-detail"),
]