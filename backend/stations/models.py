from django.db import models
from users.models import User


class Station(models.Model):

    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('MAINTENANCE', 'Maintenance'),
    )

    EXTERNAL_SOURCE_CHOICES = (
        ('MANUAL', 'Manual'),
        ('OPEN_CHARGE_MAP', 'Open Charge Map'),
        ('IMPORTED', 'Imported'),
    )

    operator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        limit_choices_to={'role': 'OPERATOR'},
        related_name='stations'
    )

    station_name = models.CharField(max_length=100)

    address = models.TextField()

    city = models.CharField(max_length=50)

    state = models.CharField(max_length=50)

    pincode = models.CharField(max_length=10, blank=True, null=True)

    latitude = models.DecimalField(max_digits=10, decimal_places=7)

    longitude = models.DecimalField(max_digits=10, decimal_places=7)

    opening_time = models.TimeField(blank=True, null=True)

    closing_time = models.TimeField(blank=True, null=True)

    contact_number = models.CharField(max_length=50, blank=True, null=True)

    email = models.EmailField(blank=True, null=True)

    amenities = models.TextField(blank=True, null=True)

    rating = models.DecimalField(
        max_digits=2,
        decimal_places=1,
        default=0.0
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='OPEN'
    )

    external_source = models.CharField(
        max_length=50,
        choices=EXTERNAL_SOURCE_CHOICES,
        default='MANUAL',
        db_index=True
    )

    external_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        db_index=True
    )

    external_uuid = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    operator_name = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    source_last_verified_at = models.DateTimeField(
        blank=True,
        null=True
    )

    last_synced_at = models.DateTimeField(
        blank=True,
        null=True
    )

    raw_source_status = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    data_quality_score = models.IntegerField(
        default=0
    )

    booking_enabled = models.BooleanField(
        default=True
    )

    availability_is_live = models.BooleanField(
        default=False
    )

    is_locally_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['external_source', 'external_id'],
                condition=models.Q(external_id__isnull=False),
                name='unique_external_station'
            )
        ]
        indexes = [
            models.Index(fields=['state', 'city']),
            models.Index(fields=['external_source', 'external_id']),
        ]

    def __str__(self):
        return self.station_name