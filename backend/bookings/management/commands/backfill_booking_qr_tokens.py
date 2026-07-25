import io
import secrets
import qrcode
from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from bookings.models import Booking


class Command(BaseCommand):
    help = "Idempotent repair command to backfill booking verification tokens (EV-BKG-ID-HEX6) and regenerate QR code images."

    def handle(self, *args, **options):
        total = Booking.objects.count()
        updated_count = 0
        regenerated_count = 0

        self.stdout.write(f"Starting backfill on {total} booking records...")

        for booking in Booking.objects.all():
            changed = False
            # Check if token is missing or contains image path/legacy text
            if not booking.qr_code or "/" in str(booking.qr_code) or ".png" in str(booking.qr_code) or "BOOKING-" in str(booking.qr_code):
                random_part = secrets.token_hex(3).upper()
                booking.qr_code = f"EV-BKG-{booking.id}-{random_part}"
                changed = True
                updated_count += 1

            file_path = f"booking_qr/booking_{booking.id}.png"
            if booking.qr_image != file_path:
                booking.qr_image = file_path
                changed = True

            # Regenerate QR image file containing token string
            try:
                qr = qrcode.make(booking.qr_code)
                buffer = io.BytesIO()
                qr.save(buffer, format="PNG")
                if default_storage.exists(file_path):
                    default_storage.delete(file_path)
                default_storage.save(file_path, ContentFile(buffer.getvalue()))
                regenerated_count += 1
            except Exception as e:
                self.stderr.write(f"Warning: Failed to generate QR image for booking #{booking.id}: {e}")

            if changed:
                # Save without resetting is_qr_used or booking_status
                booking.save(update_fields=["qr_code", "qr_image"])

        self.stdout.write(
            self.style.SUCCESS(
                f"Successfully completed backfill! Tokens updated: {updated_count}, Images regenerated: {regenerated_count}, Total bookings: {total}."
            )
        )
