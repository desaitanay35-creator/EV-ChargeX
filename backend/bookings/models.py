from django.db import models
from users.models import User
from trips.models import Trip
from stations.models import Station
from charging.models import Charger


class Booking(models.Model):

    STATUS = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    trip = models.ForeignKey(
        Trip,
        on_delete=models.CASCADE
    )

    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE
    )

    charger = models.ForeignKey(
        Charger,
        on_delete=models.CASCADE
    )

    booking_date = models.DateField()

    booking_start_time = models.TimeField()

    booking_end_time = models.TimeField()

    estimated_duration = models.PositiveIntegerField(
        help_text="Minutes"
    )

    booking_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='PENDING'
    )

    qr_code = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Booking #{self.id}"