from django.db import models


class FavoriteStation(models.Model):

    user = models.ForeignKey(
        "users.User",
        on_delete=models.CASCADE,
        related_name="favorite_stations"
    )

    station = models.ForeignKey(
        "stations.Station",
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        unique_together = ("user", "station")

    def __str__(self):
        return f"{self.user.email} - {self.station.station_name}"