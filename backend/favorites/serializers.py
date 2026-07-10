from rest_framework import serializers
from .models import FavoriteStation


class FavoriteStationSerializer(serializers.ModelSerializer):

    class Meta:
        model = FavoriteStation
        fields = "__all__"
        read_only_fields = [
            "user",
            "created_at",
        ]