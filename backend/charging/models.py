from django.db import models
from stations.models import Station
# from bookings.models import Booking
# from vehicles.models import Vehicle


class Charger(models.Model):

    CHARGER_TYPE = (
        ('AC', 'AC'),
        ('DC', 'DC'),
    )

    CONNECTOR_TYPE = (
        ('CCS2', 'CCS2'),
        ('Type2', 'Type2'),
        ('GB/T', 'GB/T'),
        ('CHAdeMO', 'CHAdeMO'),
    )

    STATUS = (
        ('AVAILABLE', 'Available'),
        ('OCCUPIED', 'Occupied'),
        ('RESERVED', 'Reserved'),
        ('MAINTENANCE', 'Maintenance'),
        ('OUT_OF_SERVICE', 'Out of Service'),
    )

    station = models.ForeignKey(
        Station,
        on_delete=models.CASCADE,
        related_name='chargers'
    )

    charger_name = models.CharField(max_length=50)

    charger_number = models.CharField(
        max_length=20,
        unique=True
    )

    charger_type = models.CharField(
        max_length=10,
        choices=CHARGER_TYPE
    )

    connector_type = models.CharField(
        max_length=20,
        choices=CONNECTOR_TYPE
    )

    power_output_kw = models.DecimalField(
        max_digits=6,
        decimal_places=2
    )

    voltage = models.PositiveIntegerField()

    current = models.PositiveIntegerField()

    price_per_kwh = models.DecimalField(
        max_digits=8,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='AVAILABLE'
    )

    installation_date = models.DateField()

    last_maintenance = models.DateField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.station.station_name} - {self.charger_name}"



class ChargingSession(models.Model):

    STATUS = (
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('INTERRUPTED', 'Interrupted'),
    )

    booking = models.ForeignKey(
    'bookings.Booking',
    on_delete=models.CASCADE)

    charger = models.ForeignKey(
        Charger,
        on_delete=models.CASCADE
    )

    vehicle = models.ForeignKey(
    'vehicles.Vehicle',
    on_delete=models.CASCADE)

    start_time = models.DateTimeField()

    end_time = models.DateTimeField(
        null=True,
        blank=True
    )

    battery_before = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )

    battery_after = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True
    )

    energy_consumed_kwh = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0
    )

    charging_cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    session_status = models.CharField(
        max_length=20,
        choices=STATUS,
        default='ACTIVE'
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        from decimal import Decimal
        if self.session_status in ['COMPLETED', 'INTERRUPTED'] and (self.energy_consumed_kwh == 0 or self.charging_cost == 0):
            if self.battery_before is not None and self.battery_after is not None:
                diff = self.battery_after - self.battery_before
                if diff > 0:
                    capacity = self.vehicle.battery_capacity
                    self.energy_consumed_kwh = (diff / Decimal('100.0')) * capacity
                    self.charging_cost = self.energy_consumed_kwh * self.charger.price_per_kwh

        super().save(*args, **kwargs)

        # Dynamic charger status update
        charger = self.charger
        if self.session_status == 'ACTIVE':
            charger.status = 'OCCUPIED'
            charger.save()
        elif self.session_status in ['COMPLETED', 'INTERRUPTED']:
            active_sessions = ChargingSession.objects.filter(
                charger=charger, session_status='ACTIVE'
            ).exclude(pk=self.pk)
            if not active_sessions.exists():
                charger.status = 'AVAILABLE'
                charger.save()

    def __str__(self):
        return f"Session #{self.id}"