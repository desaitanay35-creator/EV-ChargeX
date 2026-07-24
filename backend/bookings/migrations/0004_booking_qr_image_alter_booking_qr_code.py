import io
import secrets
import qrcode
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.db import migrations, models


def backfill_tokens_and_qr_images(apps, schema_editor):
    Booking = apps.get_model('bookings', 'Booking')

    for booking in Booking.objects.all():
        needs_token = False
        if not booking.qr_code or "/" in str(booking.qr_code) or ".png" in str(booking.qr_code) or "BOOKING-" in str(booking.qr_code):
            needs_token = True

        if needs_token:
            random_part = secrets.token_hex(3).upper()
            booking.qr_code = f"EV-BKG-{booking.id}-{random_part}"

        file_path = f"booking_qr/booking_{booking.id}.png"
        booking.qr_image = file_path

        try:
            qr = qrcode.make(booking.qr_code)
            buffer = io.BytesIO()
            qr.save(buffer, format="PNG")
            if default_storage.exists(file_path):
                default_storage.delete(file_path)
            default_storage.save(file_path, ContentFile(buffer.getvalue()))
        except Exception as e:
            print(f"Backfill warning for booking #{booking.id}:", e)

        booking.save()


class Migration(migrations.Migration):

    dependencies = [
        ('bookings', '0003_booking_is_verified'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='qr_image',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.RunPython(backfill_tokens_and_qr_images, reverse_code=migrations.RunPython.noop),
        migrations.AlterField(
            model_name='booking',
            name='qr_code',
            field=models.CharField(blank=True, max_length=255, null=True, unique=True),
        ),
    ]
