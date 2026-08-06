def predict_battery_usage(distance, efficiency, capacity=None):
    """
    Predict battery consumption percentage.

    Parameters:
    - distance: Distance in km
    - efficiency: Vehicle efficiency in km/kWh
    - capacity: Battery capacity in kWh (optional)

    Formulas:
        Energy Used (kWh) = Distance (km) / Efficiency (km/kWh)
        Battery Used (%) = (Energy Used (kWh) / Capacity (kWh)) * 100
    """
    if not efficiency or float(efficiency) <= 0:
        return 0.0

    dist = float(distance)
    eff = float(efficiency)
    energy_used_kwh = dist / eff

    if capacity and float(capacity) > 0:
        cap = float(capacity)
        battery_used_pct = (energy_used_kwh / cap) * 100.0
        return round(battery_used_pct, 2)

    return round(energy_used_kwh, 2)


def charging_required(current_battery, battery_needed):
    """
    Check whether charging is required.
    """
    return current_battery < battery_needed