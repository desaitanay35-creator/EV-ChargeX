from django.db import models
from users.models import User
from charging.models import ChargingSession


class Payment(models.Model):

    PAYMENT_METHODS = (
        ("UPI", "UPI"),
        ("DEBIT_CARD", "Debit Card"),
        ("CASH", "Cash"),
    )

    STATUS = (
        ("PENDING", "Pending"),
        ("SUCCESS", "Success"),
        ("FAILED", "Failed"),
        ("REFUNDED", "Refunded"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    charging_session = models.OneToOneField(
    ChargingSession,
    on_delete=models.CASCADE,
    null=True,
    blank=True
)

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS,
        blank=True,
        null=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="PENDING"
    )

    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    paid_at = models.DateTimeField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"Payment #{self.id} - {self.payment_status}"