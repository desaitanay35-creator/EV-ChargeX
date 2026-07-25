from decimal import Decimal

from stations.models import Station
from .wait_time import predict_wait_time


# ---------------- Battery Prediction ----------------

def predict_battery_usage(
    distance,
    efficiency,
    traffic,
    ac_on,
):
    battery = Decimal(distance) / Decimal(efficiency)

    if traffic == "HIGH":
        battery *= Decimal("1.25")

    elif traffic == "MEDIUM":
        battery *= Decimal("1.10")

    if ac_on:
        battery *= Decimal("1.08")

    return round(battery, 2)


# ---------------- Station Recommendation ----------------

def recommend_station(trip):
    """
    Smart Station Recommendation
    """

    stations = Station.objects.filter(status="ACTIVE")

    best_station = None
    best_score = -999999

    for station in stations:

        wait = predict_wait_time(station)

        score = (
            station.available_chargers * 50
            + float(station.rating) * 10
            - wait * 0.5
        )

        if score > best_score:
            best_score = score
            best_station = station

    return best_station


# ---------------- Charging Time ----------------

def estimate_charging_time(
    battery_before,
    battery_target,
    battery_capacity,
    charger_power,
):

    energy = (
        (battery_target - battery_before)
        / 100
    ) * battery_capacity

    hours = energy / charger_power

    return round(hours * 60)


# ---------------- Wait Time ----------------

def estimate_wait_time(
    available,
    total,
):

    occupied = total - available

    return occupied * 8