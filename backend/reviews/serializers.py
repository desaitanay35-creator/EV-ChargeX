from rest_framework import serializers
from .models import Review


class ReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = Review
        fields = "__all__"
        read_only_fields = [
            "user",
            "created_at",
            "updated_at",
        ]

        
    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )
        return value