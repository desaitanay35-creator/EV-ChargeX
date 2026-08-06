from django.urls import path
from .views import *

urlpatterns = [
    path("dashboard/",UserDashboardView.as_view(),name="user-dashboard"),
    path("operator-dashboard/",operator_dashboard,name="operator-dashboard"),
    path("admin-dashboard/",admin_dashboard,name="admin-dashboard"),
]