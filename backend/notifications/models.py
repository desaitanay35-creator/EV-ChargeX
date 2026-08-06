from django.db import models
from users.models import User


class Notification(models.Model):

    TYPES = (
        ("BOOKING", "Booking"),
        ("CHARGING", "Charging"),
        ("PAYMENT", "Payment"),
        ("TRIP", "Trip"),
        ("SYSTEM", "System"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )

    title = models.CharField(max_length=100)

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=TYPES
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title