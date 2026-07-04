from django.db import models


class Notification(models.Model):

    TYPES = (
        ('BOOKING', 'Booking'),
        ('CHARGING', 'Charging'),
        ('PAYMENT', 'Payment'),
        ('REMINDER', 'Reminder'),
        ('SYSTEM', 'System'),
    )

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=100
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=TYPES
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title