from django.urls import path
from .views import register_user, login_user,profile,dashboard,notifications

urlpatterns = [
    path('register/', register_user),
    path('login/', login_user),
    path('profile/', profile),
    path('dashboard/', dashboard),
    path('notifications/', notifications),
]