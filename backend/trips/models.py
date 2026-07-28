from django.db import models
from users.models import User
from vehicles.models import Vehicle
from stations.models import Station


class Trip(models.Model):

    STATUS = (
        ('PLANNED', 'Planned'),
        ('ONGOING', 'Ongoing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE
    )

    source = models.CharField(max_length=200)
    destination = models.CharField(max_length=200)
    source_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    source_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    destination_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    destination_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    distance_km = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    route_distance = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    estimated_time = models.PositiveIntegerField(
        help_text="Minutes",
        null=True,
        blank=True
    )

    estimated_duration = models.PositiveIntegerField(
        help_text="Minutes",
        null=True,
        blank=True
    )

    estimated_battery_needed = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    battery_before = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    predicted_battery_after = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    external_station_id = models.CharField(
        max_length=100,
        null=True,
        blank=True
    )

    external_station_name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    external_station_operator = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    external_station_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    external_station_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    external_station_connector_type = models.CharField(
        max_length=50,
        null=True,
        blank=True
    )

    external_station_estimated_wait_time = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    suggested_station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    trip_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='PLANNED'
    )

    start_time = models.DateTimeField(
        null=True,
        blank=True
    )

    end_time = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.source} ➜ {self.destination}"