from django.db import models
from users.models import User


class Station(models.Model):

    STATUS_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('MAINTENANCE', 'Maintenance'),
    )

    operator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        limit_choices_to={'role': 'OPERATOR'}
    )

    station_name = models.CharField(max_length=100)

    address = models.TextField()

    city = models.CharField(max_length=50)

    state = models.CharField(max_length=50)

    pincode = models.CharField(max_length=10)

    latitude = models.DecimalField(max_digits=10, decimal_places=7)

    longitude = models.DecimalField(max_digits=10, decimal_places=7)

    opening_time = models.TimeField()

    closing_time = models.TimeField()

    contact_number = models.CharField(max_length=15)

    email = models.EmailField()

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

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.station_name