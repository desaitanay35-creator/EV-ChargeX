import math
import uuid
from decimal import Decimal
from django.utils import timezone

CHARGING_EFFICIENCY = Decimal("0.90")

# Taper thresholds and power multipliers
TAPER_BANDS = [
    {"threshold": Decimal("80.00"), "multiplier": Decimal("1.00")},
    {"threshold": Decimal("90.00"), "multiplier": Decimal("0.70")},
    {"threshold": Decimal("100.00"), "multiplier": Decimal("0.40")},
]


def generate_transaction_id():
    return f"TXN-{uuid.uuid4().hex[:10].upper()}"


def calculate_energy_used(power_kw, hours):
    return Decimal(str(power_kw)) * Decimal(str(hours))


def calculate_cost(energy_kwh, price_per_kwh):
    return Decimal(str(energy_kwh)) * Decimal(str(price_per_kwh))


def estimate_charging_result(session, end_time=None):
    """
    Calculates estimated duration, usable energy, battery gain %, final battery %, and cost
    for a charging session using a 3-band progressive taper model.

    Returns dict containing string & numeric formatted metrics and calculation_source.
    """
    if not end_time:
        end_time = timezone.now()

    start_time = session.start_time or timezone.now()
    duration_seconds = Decimal(str(max(1.0, (end_time - start_time).total_seconds())))
    duration_hours = duration_seconds / Decimal("3600.0")
    duration_minutes = max(1, int(math.ceil(duration_seconds / Decimal("60.0"))))

    charger = session.charger
    vehicle = session.vehicle

    charger_power = charger.power_output_kw if charger and charger.power_output_kw > 0 else Decimal("30.0")
    battery_capacity = vehicle.battery_capacity if vehicle and vehicle.battery_capacity > 0 else Decimal("50.0")
    price_per_kwh = charger.price_per_kwh if charger and charger.price_per_kwh >= 0 else Decimal("15.0")
    battery_before = session.battery_before if session.battery_before is not None else Decimal("40.0")

    # If battery before is already at 100%, 0 gain and 0 cost
    if battery_before >= Decimal("100.0"):
        return {
            "duration_seconds": int(duration_seconds),
            "duration_minutes": duration_minutes,
            "charger_power_kw": f"{charger_power:.2f}",
            "efficiency_factor": f"{CHARGING_EFFICIENCY:.2f}",
            "energy_input_kwh": "0.00",
            "energy_delivered_kwh": "0.00",
            "battery_before": f"{battery_before:.2f}",
            "battery_gain_percent": "0.00",
            "battery_after": "100.00",
            "charging_cost": "0.00",
            "calculation_source": "DURATION_ESTIMATE",
        }

    # Progressive Taper Calculation across time
    remaining_time_hours = duration_hours
    current_battery = min(Decimal("100.0"), max(Decimal("0.0"), battery_before))
    total_usable_energy = Decimal("0.0")
    total_input_energy = Decimal("0.0")

    while remaining_time_hours > Decimal("0") and current_battery < Decimal("100.0"):
        # Find current band multiplier and target threshold
        if current_battery < Decimal("80.00"):
            multiplier = Decimal("1.00")
            target_threshold = Decimal("80.00")
        elif current_battery < Decimal("90.00"):
            multiplier = Decimal("0.70")
            target_threshold = Decimal("90.00")
        else:
            multiplier = Decimal("0.40")
            target_threshold = Decimal("100.00")

        effective_power = charger_power * multiplier
        # Rate of battery gain per hour: (% / hr) = (effective_power * efficiency) / (capacity / 100)
        rate_percent_per_hour = (effective_power * CHARGING_EFFICIENCY * Decimal("100.0")) / battery_capacity

        if rate_percent_per_hour <= Decimal("0"):
            break

        battery_percent_needed_in_band = target_threshold - current_battery
        time_needed_hours = battery_percent_needed_in_band / rate_percent_per_hour

        if remaining_time_hours <= time_needed_hours:
            # Segment finishes due to elapsed time
            gain_in_segment = remaining_time_hours * rate_percent_per_hour
            usable_energy_segment = (gain_in_segment * battery_capacity) / Decimal("100.0")
            input_energy_segment = remaining_time_hours * effective_power

            current_battery += gain_in_segment
            total_usable_energy += usable_energy_segment
            total_input_energy += input_energy_segment
            remaining_time_hours = Decimal("0")
        else:
            # Segment finishes due to reaching threshold
            gain_in_segment = battery_percent_needed_in_band
            usable_energy_segment = (gain_in_segment * battery_capacity) / Decimal("100.0")
            input_energy_segment = time_needed_hours * effective_power

            current_battery = target_threshold
            total_usable_energy += usable_energy_segment
            total_input_energy += input_energy_segment
            remaining_time_hours -= time_needed_hours

    final_battery = min(Decimal("100.00"), current_battery)
    battery_gain = max(Decimal("0.00"), final_battery - battery_before)
    charging_cost = total_usable_energy * price_per_kwh

    return {
        "duration_seconds": int(duration_seconds),
        "duration_minutes": duration_minutes,
        "charger_power_kw": f"{charger_power:.2f}",
        "efficiency_factor": f"{CHARGING_EFFICIENCY:.2f}",
        "energy_input_kwh": f"{total_input_energy:.2f}",
        "energy_delivered_kwh": f"{total_usable_energy:.2f}",
        "battery_before": f"{battery_before:.2f}",
        "battery_gain_percent": f"{battery_gain:.2f}",
        "battery_after": f"{final_battery:.2f}",
        "charging_cost": f"{charging_cost:.2f}",
        "calculation_source": "DURATION_ESTIMATE",
    }