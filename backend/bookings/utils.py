import io
import secrets
import qrcode
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


def generate_unique_booking_token(booking_id):
    from .models import Booking
    for _ in range(10):
        random_part = secrets.token_hex(3).upper()
        token = f"EV-BKG-{booking_id}-{random_part}"
        if not Booking.objects.filter(qr_code=token).exists():
            return token
    import uuid
    return f"EV-BKG-{booking_id}-{uuid.uuid4().hex[:6].upper()}"


def generate_booking_qr(booking):
    """
    Generates a QR code image encoding ONLY the verification token string (e.g. EV-BKG-11-A7F29C).
    Saves the image using Django default_storage backend.
    Returns relative storage file path string (e.g. 'booking_qr/booking_11.png').
    """
    token = booking.qr_code
    if not token:
        token = generate_unique_booking_token(booking.id)
        booking.qr_code = token

    qr = qrcode.make(token)
    buffer = io.BytesIO()
    qr.save(buffer, format="PNG")

    file_path = f"booking_qr/booking_{booking.id}.png"
    if default_storage.exists(file_path):
        try:
            default_storage.delete(file_path)
        except Exception:
            pass

    saved_path = default_storage.save(file_path, ContentFile(buffer.getvalue()))
    return saved_path