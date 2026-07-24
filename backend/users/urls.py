from django.urls import path
from .views import (
    AdminOperatorDetailView,
    AdminOperatorListView,
    AdminUserDetailView,
    AdminUserListView,
    LoginView,
    ProfileView,
    RegisterView,
    admin_assign_station_operator_view,
    block_user_view,
    change_user_role_view,
    unblock_user_view,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),

    # Admin User Governance API
    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
    path('admin/users/<int:pk>/block/', block_user_view, name='admin-user-block'),
    path('admin/users/<int:pk>/unblock/', unblock_user_view, name='admin-user-unblock'),
    path('admin/users/<int:pk>/change-role/', change_user_role_view, name='admin-user-change-role'),

    # Admin Operator Governance API
    path('admin/operators/', AdminOperatorListView.as_view(), name='admin-operator-list'),
    path('admin/operators/<int:pk>/', AdminOperatorDetailView.as_view(), name='admin-operator-detail'),
    path('admin/stations/<int:station_id>/assign-operator/', admin_assign_station_operator_view, name='admin-station-assign-operator'),
]