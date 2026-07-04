from django.db import models


class Payment(models.Model):

    PAYMENT_METHODS = (
        ('UPI', 'UPI'),
        ('CARD', 'Card'),
        ('NET_BANKING', 'Net Banking'),
        ('WALLET', 'Wallet'),
        ('CASH', 'Cash'),
    )

    STATUS = (
        ('PENDING', 'Pending'),
        ('SUCCESS', 'Success'),
        ('FAILED', 'Failed'),
        ('REFUNDED', 'Refunded'),
    )

    session = models.ForeignKey(
        'charging.ChargingSession',
        on_delete=models.CASCADE
    )

    user = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHODS
    )

    transaction_id = models.CharField(
        max_length=100,
        unique=True
    )

    payment_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='PENDING'
    )

    payment_date = models.DateTimeField(
        auto_now_add=True
    )

    bill_pdf = models.FileField(
        upload_to='bills/',
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.transaction_id