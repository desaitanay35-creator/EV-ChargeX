from django.db.models import Avg

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import Review
from .serializers import ReviewSerializer
from stations.models import Station


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.all()

    def perform_create(self, serializer):

        review = serializer.save(
            user=self.request.user
        )

        station = review.station

        average_rating = station.reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        station.rating = round(
            average_rating,
            1
        )

        station.save()


class ReviewDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):

        review = serializer.save()

        station = review.station

        average_rating = station.reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        station.rating = round(
            average_rating,
            1
        )

        station.save()

    def perform_destroy(self, instance):

        station = instance.station

        instance.delete()

        average_rating = station.reviews.aggregate(
            Avg("rating")
        )["rating__avg"]

        station.rating = (
            round(average_rating, 1)
            if average_rating
            else 0
        )

        station.save()