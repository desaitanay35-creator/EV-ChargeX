import qrcode
import os
from django.conf import settings


def generate_booking_qr(booking):

    qr_data = f"BOOKING-{booking.id}"

    qr = qrcode.make(qr_data)

    folder = os.path.join(
        settings.MEDIA_ROOT,
        "booking_qr"
    )

    os.makedirs(folder, exist_ok=True)

    filename = f"booking_{booking.id}.png"

    path = os.path.join(folder, filename)

    qr.save(path)

    return f"booking_qr/{filename}"