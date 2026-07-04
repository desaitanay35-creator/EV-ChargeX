from django.db import models
from users.models import User


class Vehicle(models.Model):

    CONNECTOR_CHOICES = (
        ('CCS2', 'CCS2'),
    ('Type2', 'Type2'),
    ('GB/T', 'GB/T'),
    ('CHAdeMO', 'CHAdeMO'),
        
    )

    VEHICLE_TYPES = (
        ('Car', 'Car'),
        ('Bike', 'Bike'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle_type = models.CharField(max_length=10, choices=VEHICLE_TYPES)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    variant = models.CharField(max_length=50, blank=True, null=True)
    registration_number = models.CharField(max_length=20, unique=True)
    battery_capacity = models.DecimalField(max_digits=6, decimal_places=2)
    current_battery_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    connector_type = models.CharField(max_length=20, choices=CONNECTOR_CHOICES)
    efficiency = models.DecimalField(max_digits=5, decimal_places=2)
    manufacturing_year = models.PositiveIntegerField()
    color = models.CharField(max_length=30, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.brand} {self.model} ({self.registration_number})"