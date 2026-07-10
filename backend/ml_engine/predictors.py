
def predict_battery_usage(distance, efficiency):
    """
    Predict battery consumption percentage.

    Formula:
        Battery Used (%) = Distance × Efficiency
    """

    battery_used = distance * efficiency

    return round(battery_used, 2)


def charging_required(current_battery, battery_needed):
    """
    Check whether charging is required.
    """

    return current_battery < battery_needed