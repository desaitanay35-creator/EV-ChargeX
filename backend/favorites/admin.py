from django.contrib import admin
from .models import FavoriteStation


@admin.register(FavoriteStation)
class FavoriteStationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "station",
        "created_at",
    )

    search_fields = (
        "user__email",
        "station__station_name",
    )

    ordering = (
        "-created_at",
    )