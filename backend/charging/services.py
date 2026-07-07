from decimal import Decimal
import uuid

from payments.models import Payment


def calculate_energy_used(before, after, battery_capacity):
    """
    Calculate consumed energy in kWh.
    """

    used_percent = Decimal(after) - Decimal(before)

    if used_percent < 0:
        used_percent = 0

    energy = (used_percent / Decimal("100")) * Decimal(battery_capacity)

    return round(energy, 2)


def calculate_cost(energy, price_per_kwh):
    return round(
        Decimal(energy) * Decimal(price_per_kwh),
        2
    )


def generate_transaction_id():
    return "TXN-" + uuid.uuid4().hex[:10].upper()