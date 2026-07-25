from .predictors import (
    predict_battery_usage,
    charging_required,
)

from .services import recommend_station
from .wait_time import predict_wait_time


def plan_trip(trip):
    """
    AI Trip Planning Engine (Version 1)
    """

    # Battery Prediction
    battery_needed = predict_battery_usage(
        float(trip.distance_km),
        float(trip.vehicle.efficiency)
    )

    # Charging Decision
    need_charge = charging_required(
        float(trip.vehicle.current_battery),
        battery_needed
    )

    # Best Station
    station = recommend_station(trip)

    # Wait Time
    wait_time = (
        predict_wait_time(station)
        if station else 0
    )

    # Estimated Charging Cost
    estimated_cost = 0

    if station:
        charger = station.charger_set.first()

        if charger:
            estimated_cost = round(
                battery_needed * float(charger.price_per_kwh),
                2
            )

    return {
        "battery_needed": battery_needed,
        "charging_required": need_charge,
        "recommended_station": station,
        "wait_time": wait_time,
        "estimated_cost": estimated_cost,
    }