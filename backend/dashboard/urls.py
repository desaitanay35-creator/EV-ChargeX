from django.urls import path
from .views import *

urlpatterns = [
    path("user/", user_dashboard),
    path("operator/", operator_dashboard),
    path("admin/", admin_dashboard),
]