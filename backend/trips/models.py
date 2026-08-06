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

    STAGE_CHOICES = (
        ('TO_STATION', 'To Station'),
        ('TO_DESTINATION', 'To Destination'),
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
        decimal_places=2
    )

    estimated_time = models.PositiveIntegerField(
        help_text="Minutes"
    )

    estimated_battery_needed = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    current_battery_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    estimated_destination_battery = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    estimated_arrival_battery_at_station = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    charging_required = models.BooleanField(
        default=False
    )

    estimated_detour_km = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    suggested_station = models.ForeignKey(
        Station,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    suggested_stations_json = models.JSONField(
        null=True,
        blank=True
    )

    route_geometry = models.JSONField(
        null=True,
        blank=True
    )

    trip_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='PLANNED'
    )

    navigation_stage = models.CharField(
        max_length=30,
        choices=STAGE_CHOICES,
        default='TO_STATION',
        null=True,
        blank=True
    )

    start_time = models.DateTimeField(
        null=True,
        blank=True
    )

    end_time = models.DateTimeField(
        null=True,
        blank=True
    )

    actual_start_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    actual_start_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    actual_end_latitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    actual_end_longitude = models.DecimalField(
        max_digits=10,
        decimal_places=7,
        null=True,
        blank=True
    )

    actual_distance_km = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True
    )

    actual_duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.source} ➜ {self.destination} [{self.trip_status}]"


class SeedBatch(models.Model):
    batch_name = models.CharField(max_length=100, unique=True)
    seed_value = models.IntegerField(default=42)
    created_at = models.DateTimeField(auto_now_add=True)
    users_created = models.PositiveIntegerField(default=0)
    vehicles_created = models.PositiveIntegerField(default=0)
    trips_created = models.PositiveIntegerField(default=0)
    bookings_created = models.PositiveIntegerField(default=0)
    sessions_created = models.PositiveIntegerField(default=0)
    reviews_created = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"SeedBatch({self.batch_name})"


class SeedGeneratedObject(models.Model):
    seed_batch = models.ForeignKey(SeedBatch, on_delete=models.CASCADE, related_name='generated_objects')
    model_label = models.CharField(max_length=100)
    object_id = models.BigIntegerField()

    class Meta:
        indexes = [
            models.Index(fields=['seed_batch', 'model_label']),
        ]

    def __str__(self):
        return f"{self.model_label}:{self.object_id} [{self.seed_batch.batch_name}]"