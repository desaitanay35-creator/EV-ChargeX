from django.db import models


class Notification(models.Model):

    TYPE = (
        ('BOOKING', 'Booking'),
        ('CHARGING', 'Charging'),
        ('PAYMENT', 'Payment'),
        ('BATTERY', 'Battery'),
        ('SYSTEM', 'System'),
    )

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE
    )

    title = models.CharField(
        max_length=150
    )

    message = models.TextField()

    notification_type = models.CharField(
        max_length=20,
        choices=TYPE
    )

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.title