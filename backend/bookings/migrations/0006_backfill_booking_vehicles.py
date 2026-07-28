from django.db import migrations


def backfill_booking_vehicles(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')
    total = Booking.objects.count()
    backfilled = 0
    missing = 0

    for booking in Booking.objects.all():
        if booking.trip and booking.trip.vehicle_id:
            booking.vehicle_id = booking.trip.vehicle_id
            booking.save(update_fields=['vehicle'])
            backfilled += 1
        elif booking.vehicle_id:
            backfilled += 1
        else:
            missing += 1

    print(f"\n[DATA MIGRATION REPORT] Existing bookings: {total}, Backfilled: {backfilled}, Missing vehicle: {missing}")

    if missing > 0:
        raise ValueError(f"Cannot proceed: {missing} bookings are missing a vehicle.")


def reverse_backfill(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0005_booking_vehicle_alter_booking_trip'),
    ]

    operations = [
        migrations.RunPython(backfill_booking_vehicles, reverse_backfill),
    ]
