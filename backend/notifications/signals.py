from django.db.models.signals import post_save
from django.dispatch import receiver
from bookings.models import Booking
from charging.models import ChargingSession
from payments.models import Payment
from notifications.models import Notification


@receiver(post_save, sender=Booking)
def create_booking_notification(sender, instance, created, **kwargs):
    if created:
        Notification.objects.create(
            user=instance.user,
            title="Booking Confirmed",
            message=f"Your booking #{instance.id} at {instance.station.station_name} for charger {instance.charger.charger_name} is confirmed on {instance.booking_date} from {instance.booking_start_time} to {instance.booking_end_time}.",
            notification_type="BOOKING"
        )


@receiver(post_save, sender=ChargingSession)
def create_charging_session_notification(sender, instance, created, **kwargs):
    # Retrieve user from the booking
    user = instance.booking.user if instance.booking else None
    if not user:
        return

    if created or instance.session_status == "ACTIVE":
        # Check if we already created a start notification to prevent duplicates
        exists = Notification.objects.filter(
            user=user,
            title="Charging Session Started",
            message__contains=f"Session #{instance.id}"
        ).exists()
        if not exists:
            Notification.objects.create(
                user=user,
                title="Charging Session Started",
                message=f"Charging session #{instance.id} has started for vehicle {instance.vehicle.brand} {instance.vehicle.model}. Current battery: {instance.battery_before}%.",
                notification_type="CHARGING"
            )
            
    if instance.session_status == "COMPLETED":
        # Check if we already created a completed notification to prevent duplicates
        exists = Notification.objects.filter(
            user=user,
            title="Charging Session Completed",
            message__contains=f"Session #{instance.id}"
        ).exists()
        if not exists:
            Notification.objects.create(
                user=user,
                title="Charging Session Completed",
                message=f"Charging session #{instance.id} completed. Battery charged to {instance.battery_after}%. Energy consumed: {instance.energy_consumed_kwh} kWh. Total cost: ₹{instance.charging_cost}.",
                notification_type="CHARGING"
            )


@receiver(post_save, sender=Payment)
def create_payment_notification(sender, instance, created, **kwargs):
    if created or instance.payment_status in ["SUCCESS", "FAILED"]:
        # Title depending on status
        title = f"Payment {instance.payment_status.title()}"
        status_text = "was successful" if instance.payment_status == "SUCCESS" else "failed"
        
        # Check for duplicate
        exists = Notification.objects.filter(
            user=instance.user,
            title=title,
            message__contains=f"transaction {instance.transaction_id}"
        ).exists()
        if not exists:
            Notification.objects.create(
                user=instance.user,
                title=title,
                message=f"Payment of ₹{instance.amount} {status_text} (Transaction: {instance.transaction_id}).",
                notification_type="PAYMENT"
            )
