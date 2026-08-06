import math
import uuid
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor
from django.conf import settings

from stations.models import Station
from charging.models import Charger
from .osrm_client import get_osrm_route, get_osrm_multi_stop_route, haversine_distance
from .wait_time import predict_wait_time


class TripPlanningError(Exception):
    """Custom exception raised when trip planning fails to produce a feasible itinerary."""
    def __init__(self, error_code, message, diagnostics=None, status_code=422):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        self.diagnostics = diagnostics or {}
        self.status_code = status_code


def _evaluate_candidate(cand_info, current_lat, current_lng, dest_lat, dest_lng, current_batt, efficiency, capacity, osrm_to_dest_dist, osrm_cache):
    st = cand_info["st"]
    chargers = cand_info["chargers"]
    if not chargers:
        return None

    st_lat = float(st.latitude)
    st_lng = float(st.longitude)

    osrm_leg = get_osrm_route(current_lat, current_lng, st_lat, st_lng, timeout=1.5, cache_dict=osrm_cache)
    if not osrm_leg:
        return None

    leg_dist = osrm_leg["distance_km"]
    energy_used_leg = leg_dist / efficiency
    batt_used_leg = (energy_used_leg / capacity) * 100.0
    arrival_batt = current_batt - batt_used_leg

    # Rejection rule: Candidate must be reachable on road preserving emergency reserve (>= 10%)
    if arrival_batt < 10.0:
        return None

    # Actual OSRM route from station to destination
    osrm_st_dest = get_osrm_route(st_lat, st_lng, dest_lat, dest_lng, timeout=1.5, cache_dict=osrm_cache)
    if not osrm_st_dest:
        return None

    dist_st_to_dest = osrm_st_dest["distance_km"]
    detour_km = max(0.0, (leg_dist + dist_st_to_dest) - (osrm_to_dest_dist or dist_st_to_dest))

    chargers_sorted = sorted(chargers, key=lambda c: float(c.power_output_kw or 0), reverse=True)
    if not chargers_sorted:
        return None

    best_charger = chargers_sorted[0]
    power_kw = float(best_charger.power_output_kw or 50.0)

    # Target departure battery calculation: 80% default, or higher if needed to reach destination with 20% reserve
    needed_dest_energy = dist_st_to_dest / efficiency
    needed_dest_batt_pct = (needed_dest_energy / capacity) * 100.0
    target_dep_batt = max(80.0, min(100.0, ceil_to_one_decimal(needed_dest_batt_pct + 20.0)))

    energy_to_charge = ((target_dep_batt - arrival_batt) / 100.0) * capacity
    charge_mins = max(1, int(round((energy_to_charge / power_kw) * 60)))
    wait_mins = predict_wait_time(st)

    total_journey_time = osrm_leg["duration_minutes"] + wait_mins + charge_mins + osrm_st_dest["duration_minutes"]
    price_per_kwh = float(best_charger.price_per_kwh or 15.0)
    cost = round(energy_to_charge * price_per_kwh, 2)
    rating = float(st.rating or 0.0)

    # Score formula balancing minimum detour, maximum leg progress, charger power, and queue wait time
    score = (detour_km * 3.0) - (leg_dist * 1.5) - (power_kw * 0.2) - (rating * 0.5) + (wait_mins * 1.0)

    return {
        "station": st,
        "charger": best_charger,
        "leg_distance_km": leg_dist,
        "arrival_battery_percentage": round(arrival_batt, 2),
        "target_battery_percentage": round(target_dep_batt, 2),
        "energy_added_kwh": round(energy_to_charge, 2),
        "charging_minutes": charge_mins,
        "wait_minutes": wait_mins,
        "estimated_cost": cost,
        "score": score,
    }


def plan_trip_logic(
    vehicle,
    source_name,
    destination_name,
    source_lat,
    source_lng,
    dest_lat,
    dest_lng,
    current_battery_percentage=None
):
    """
    Authoritative Backend EV Trip Planner Engine.
    All road distances, durations, and leg geometries come directly from OSRM.
    Uses balanced candidate pre-filtering handling road geometry differences across gulfs/bays.
    """
    osrm_cache = {}

    # 1. Validate inputs
    try:
        source_lat = float(source_lat)
        source_lng = float(source_lng)
        dest_lat = float(dest_lat)
        dest_lng = float(dest_lng)
    except (TypeError, ValueError):
        raise TripPlanningError(
            error_code="INVALID_COORDINATES",
            message="Invalid or missing origin/destination coordinates.",
            status_code=422
        )

    if not (-90.0 <= source_lat <= 90.0 and -180.0 <= source_lng <= 180.0):
        raise TripPlanningError(
            error_code="INVALID_COORDINATES",
            message="Source latitude/longitude out of range.",
            status_code=422
        )
    if not (-90.0 <= dest_lat <= 90.0 and -180.0 <= dest_lng <= 180.0):
        raise TripPlanningError(
            error_code="INVALID_COORDINATES",
            message="Destination latitude/longitude out of range.",
            status_code=422
        )

    capacity = float(vehicle.battery_capacity) if vehicle.battery_capacity else 0.0
    efficiency = float(vehicle.efficiency) if vehicle.efficiency else 0.0

    if capacity <= 0.0 or efficiency <= 0.0:
        raise TripPlanningError(
            error_code="INVALID_VEHICLE_DATA",
            message="Vehicle has invalid battery capacity or efficiency specifications.",
            diagnostics={
                "battery_capacity": capacity,
                "efficiency": efficiency,
            },
            status_code=422
        )

    if current_battery_percentage is not None:
        try:
            start_battery = float(current_battery_percentage)
        except (TypeError, ValueError):
            start_battery = float(vehicle.current_battery_percentage or 100.0)
    else:
        start_battery = float(vehicle.current_battery_percentage or 100.0)

    start_battery = max(0.0, min(100.0, start_battery))
    connector_type = str(vehicle.connector_type).strip()

    # 2. Fetch Initial OSRM Driving Route
    initial_osrm = get_osrm_route(source_lat, source_lng, dest_lat, dest_lng, timeout=1.5, cache_dict=osrm_cache)
    if not initial_osrm:
        raise TripPlanningError(
            error_code="ROUTE_NOT_FOUND",
            message="Unable to calculate a driving route between origin and destination.",
            status_code=422
        )

    direct_dist_km = initial_osrm["distance_km"]
    direct_driving_minutes = initial_osrm["duration_minutes"]
    direct_energy_needed = direct_dist_km / efficiency
    direct_battery_used_pct = (direct_energy_needed / capacity) * 100.0
    est_arrival_dest_battery = start_battery - direct_battery_used_pct

    # Single-charge max range with current battery
    max_current_range_km = round((capacity * (start_battery / 100.0)) * efficiency, 2)

    # 3. Direct Destination Reachability Check (Normal reserve >= 20%)
    if est_arrival_dest_battery >= 20.0:
        plan_id = str(uuid.uuid4())
        return {
            "plan_id": plan_id,
            "version": "1.0",
            "origin": {
                "name": source_name,
                "latitude": source_lat,
                "longitude": source_lng,
            },
            "destination": {
                "name": destination_name,
                "latitude": dest_lat,
                "longitude": dest_lng,
            },
            "vehicle": {
                "id": vehicle.id,
                "brand": vehicle.brand,
                "model": vehicle.model,
                "registration_number": vehicle.registration_number,
                "battery_capacity": float(vehicle.battery_capacity),
                "efficiency": float(vehicle.efficiency),
                "connector_type": vehicle.connector_type,
                "current_battery_percentage": start_battery,
            },
            "route_geometry": initial_osrm["geometry"],
            "total_distance_km": direct_dist_km,
            "total_driving_minutes": direct_driving_minutes,
            "total_charging_minutes": 0,
            "total_wait_minutes": 0,
            "total_duration_minutes": direct_driving_minutes,
            "total_estimated_cost": 0.0,
            "charging_required": False,
            "estimated_destination_battery_percentage": round(max(0.0, est_arrival_dest_battery), 2),
            "stops": [],
            "diagnostics": {
                "direct_distance_km": direct_dist_km,
                "battery_needed_pct": round(direct_battery_used_pct, 2),
                "max_current_range_km": max_current_range_km,
            }
        }

    # 4. Charging is Required - Pre-flight Battery & Available Compatible Chargers Checks
    if start_battery <= 10.0:
        raise TripPlanningError(
            error_code="START_BATTERY_TOO_LOW",
            message=f"Starting battery level ({start_battery:.1f}%) is at or below the minimum emergency reserve threshold (10%). Please charge your vehicle before departing.",
            diagnostics={
                "start_battery": start_battery,
                "max_current_range_km": max_current_range_km,
            },
            status_code=422
        )

    # High performance single ORM query with prefetch_related
    stations_qs = Station.objects.filter(
        status="OPEN",
        chargers__connector_type__iexact=connector_type,
        chargers__status="AVAILABLE",
        chargers__power_output_kw__gt=0
    ).prefetch_related("chargers").distinct()

    compatible_available_stations = []
    for st in stations_qs:
        matching_chargers = [
            c for c in st.chargers.all()
            if c.connector_type.upper() == connector_type.upper()
            and c.status == "AVAILABLE"
            and (c.power_output_kw or 0) > 0
        ]
        if matching_chargers:
            compatible_available_stations.append((st, matching_chargers))

    if not compatible_available_stations:
        raise TripPlanningError(
            error_code="NO_COMPATIBLE_AVAILABLE_CHARGERS",
            message=f"No open charging stations found with available '{connector_type}' chargers.",
            diagnostics={
                "vehicle_connector_type": connector_type,
            },
            status_code=422
        )

    # 5. Multi-Stop Iterative Selection Loop
    current_lat = source_lat
    current_lng = source_lng
    current_batt = start_battery
    visited_ids = set()

    selected_stops_meta = []
    max_stops = 5
    loop_count = 0

    while loop_count < max_stops:
        # Check if destination is reachable from current location with normal reserve (>= 20%)
        osrm_to_dest = get_osrm_route(current_lat, current_lng, dest_lat, dest_lng, timeout=1.5, cache_dict=osrm_cache)
        if osrm_to_dest:
            d_to_dest = osrm_to_dest["distance_km"]
            arr_dest = current_batt - ((d_to_dest / efficiency / capacity) * 100.0)
            if arr_dest >= 20.0:
                break

        # Cheap geographic corridor pre-filter around current route to limit candidate set
        max_leg_range_km = (capacity * ((current_batt - 10.0) / 100.0)) * efficiency  # Must arrive with >= 10%
        d_curr_to_dest = haversine_distance(current_lat, current_lng, dest_lat, dest_lng)
        road_to_dest = osrm_to_dest["distance_km"] if osrm_to_dest else d_curr_to_dest

        # Effective baseline distance accounting for road detour geometry (e.g. gulfs)
        effective_baseline_dist = max(d_curr_to_dest, road_to_dest * 0.65)

        prefiltered = []
        for st, chargers in compatible_available_stations:
            if st.id in visited_ids:
                continue

            st_lat = float(st.latitude)
            st_lng = float(st.longitude)

            h_from_curr = haversine_distance(current_lat, current_lng, st_lat, st_lng)
            h_to_dest = haversine_distance(st_lat, st_lng, dest_lat, dest_lng)

            # Rejection 1: Haversine distance exceeds current battery range
            if h_from_curr > max_leg_range_km:
                continue

            # Rejection 2: Directional progress check (waived for low starting battery <= 25%)
            if loop_count > 0 or start_battery > 25.0:
                if h_to_dest > (effective_baseline_dist + 25.0):
                    continue

            # Rejection 3: Station must not increase total remaining journey distance excessively
            total_via_st = h_from_curr + h_to_dest
            if total_via_st > max(effective_baseline_dist * 1.35, effective_baseline_dist + 45.0):
                continue

            detour_est = total_via_st - effective_baseline_dist
            prefiltered.append({
                "st": st,
                "chargers": chargers,
                "total_via_st": total_via_st,
                "detour_est": detour_est,
                "h_from_curr": h_from_curr,
            })

        # Sort prefiltered candidates by minimum total journey distance via station (lowest detour first)
        prefiltered.sort(key=lambda x: (x["total_via_st"], x["detour_est"], -x["h_from_curr"]))

        # City/location deduplication: Select candidate stations across distinct cities/clusters
        seen_cities = set()
        distinct_top_candidates = []
        for cand in prefiltered:
            city_key = str(cand["st"].city or cand["st"].station_name).strip().lower()
            if city_key not in seen_cities:
                seen_cities.add(city_key)
                distinct_top_candidates.append(cand)

        # Fallback to prefiltered if city deduplication yielded empty or few
        candidate_eval_list = distinct_top_candidates[:6] if distinct_top_candidates else prefiltered[:6]

        # Evaluate top candidate OSRM routes in parallel using ThreadPoolExecutor
        candidates = []
        if candidate_eval_list:
            dest_dist_curr = osrm_to_dest["distance_km"] if osrm_to_dest else None
            with ThreadPoolExecutor(max_workers=6) as executor:
                futures = [
                    executor.submit(
                        _evaluate_candidate,
                        cand,
                        current_lat, current_lng, dest_lat, dest_lng,
                        current_batt, efficiency, capacity,
                        dest_dist_curr, osrm_cache
                    )
                    for cand in candidate_eval_list
                ]
                for future in futures:
                    try:
                        res_cand = future.result()
                        if res_cand:
                            candidates.append(res_cand)
                    except Exception:
                        pass

        if not candidates:
            if loop_count == 0:
                raise TripPlanningError(
                    error_code="START_BATTERY_TOO_LOW",
                    message="Current battery percentage cannot safely reach any compatible available charging station on road.",
                    diagnostics={
                        "start_battery": start_battery,
                        "max_current_range_km": max_current_range_km,
                    },
                    status_code=422
                )
            else:
                raise TripPlanningError(
                    error_code="NO_REACHABLE_STATION",
                    message="No reachable compatible charging station found to continue the trip.",
                    diagnostics={"stops_planned": len(selected_stops_meta)},
                    status_code=422
                )

        # Select candidate with best (lowest) score
        candidates.sort(key=lambda c: c["score"])
        selected = candidates[0]

        selected_stops_meta.append(selected)
        visited_ids.add(selected["station"].id)

        current_lat = float(selected["station"].latitude)
        current_lng = float(selected["station"].longitude)
        current_batt = selected["target_battery_percentage"]
        loop_count += 1

    if loop_count >= max_stops:
        # Verify if destination is reachable from final stop
        osrm_final = get_osrm_route(current_lat, current_lng, dest_lat, dest_lng, timeout=1.5, cache_dict=osrm_cache)
        if not osrm_final or (current_batt - ((osrm_final["distance_km"] / efficiency / capacity) * 100.0)) < 10.0:
            raise TripPlanningError(
                error_code="DESTINATION_UNREACHABLE",
                message=f"Destination is unreachable within the maximum limit of {max_stops} charging stops.",
                status_code=422
            )

    # 6. Final Full OSRM Route Generation & Recalculation
    waypoints = [(source_lat, source_lng)]
    for stop_meta in selected_stops_meta:
        st = stop_meta["station"]
        waypoints.append((float(st.latitude), float(st.longitude)))
    waypoints.append((dest_lat, dest_lng))

    full_osrm = get_osrm_multi_stop_route(waypoints, timeout=2.5)
    if not full_osrm or not full_osrm.get("legs"):
        raise TripPlanningError(
            error_code="ROUTE_NOT_FOUND",
            message="Failed to calculate final multi-stop OSRM route.",
            status_code=422
        )

    osrm_legs = full_osrm["legs"]
    final_stops = []

    curr_batt = start_battery
    total_charging_mins = 0
    total_wait_mins = 0
    total_cost = 0.0

    for i, stop_meta in enumerate(selected_stops_meta):
        st = stop_meta["station"]
        ch = stop_meta["charger"]
        leg_info = osrm_legs[i] if i < len(osrm_legs) else {"distance_km": stop_meta["leg_distance_km"], "duration_minutes": 10}

        leg_dist = leg_info["distance_km"]
        leg_dur = leg_info["duration_minutes"]

        energy_used_leg = leg_dist / efficiency
        batt_used_leg = (energy_used_leg / capacity) * 100.0
        arrival_batt = max(0.0, round(curr_batt - batt_used_leg, 2))

        # Check safety of final OSRM leg
        if arrival_batt < 10.0 and i == 0:
            raise TripPlanningError(
                error_code="START_BATTERY_TOO_LOW",
                message=f"Starting battery ({start_battery}%) is insufficient to reach station '{st.station_name}' on road.",
                diagnostics={"arrival_battery": arrival_batt, "leg_distance_km": leg_dist},
                status_code=422
            )

        # Target departure battery
        next_leg_dist = osrm_legs[i + 1]["distance_km"] if (i + 1) < len(osrm_legs) else 50.0
        needed_next_energy = next_leg_dist / efficiency
        needed_next_batt_pct = (needed_next_energy / capacity) * 100.0
        target_dep_batt = max(80.0, min(100.0, ceil_to_one_decimal(needed_next_batt_pct + 20.0)))
        target_dep_batt = max(target_dep_batt, arrival_batt)

        energy_to_charge = round(((target_dep_batt - arrival_batt) / 100.0) * capacity, 2)
        power_kw = float(ch.power_output_kw or 50.0)
        charge_mins = max(1, int(round((energy_to_charge / power_kw) * 60))) if energy_to_charge > 0 else 0
        wait_mins = predict_wait_time(st)
        price_per_kwh = float(ch.price_per_kwh or 15.0)
        cost = round(energy_to_charge * price_per_kwh, 2)

        total_charging_mins += charge_mins
        total_wait_mins += wait_mins
        total_cost += cost

        final_stops.append({
            "stop_number": i + 1,
            "station": {
                "id": st.id,
                "station_name": st.station_name,
                "address": st.address,
                "city": st.city,
                "latitude": float(st.latitude),
                "longitude": float(st.longitude),
                "rating": float(st.rating or 0.0),
            },
            "charger": {
                "id": ch.id,
                "charger_name": ch.charger_name,
                "connector_type": ch.connector_type,
                "power_output_kw": power_kw,
                "price_per_kwh": price_per_kwh,
            },
            "leg_distance_km": leg_dist,
            "leg_driving_minutes": leg_dur,
            "arrival_battery_percentage": arrival_batt,
            "target_battery_percentage": target_dep_batt,
            "energy_added_kwh": energy_to_charge,
            "charging_minutes": charge_mins,
            "wait_minutes": wait_mins,
            "estimated_cost": cost,
            "score": round(stop_meta["score"], 2),
        })

        curr_batt = target_dep_batt

    # Final Leg to destination
    final_leg_info = osrm_legs[-1] if osrm_legs else {"distance_km": 0, "duration_minutes": 0}
    final_leg_dist = final_leg_info["distance_km"]
    dest_energy_used = final_leg_dist / efficiency
    dest_batt_used = (dest_energy_used / capacity) * 100.0
    est_dest_batt = max(0.0, round(curr_batt - dest_batt_used, 2))

    total_dist = full_osrm["distance_km"]
    total_driving_mins = full_osrm["duration_minutes"]
    total_duration_mins = total_driving_mins + total_charging_mins + total_wait_mins

    plan_id = str(uuid.uuid4())
    return {
        "plan_id": plan_id,
        "version": "1.0",
        "origin": {
            "name": source_name,
            "latitude": source_lat,
            "longitude": source_lng,
        },
        "destination": {
            "name": destination_name,
            "latitude": dest_lat,
            "longitude": dest_lng,
        },
        "vehicle": {
            "id": vehicle.id,
            "brand": vehicle.brand,
            "model": vehicle.model,
            "registration_number": vehicle.registration_number,
            "battery_capacity": float(vehicle.battery_capacity),
            "efficiency": float(vehicle.efficiency),
            "connector_type": vehicle.connector_type,
            "current_battery_percentage": start_battery,
        },
        "route_geometry": full_osrm["geometry"],
        "total_distance_km": total_dist,
        "total_driving_minutes": total_driving_mins,
        "total_charging_minutes": total_charging_mins,
        "total_wait_minutes": total_wait_mins,
        "total_duration_minutes": total_duration_mins,
        "total_estimated_cost": round(total_cost, 2),
        "charging_required": True,
        "estimated_destination_battery_percentage": est_dest_batt,
        "stops": final_stops,
        "diagnostics": {
            "total_stops": len(final_stops),
            "start_battery": start_battery,
        }
    }


def ceil_to_one_decimal(val):
    return round(math.ceil(val * 10.0) / 10.0, 1)


# Maintain plan_trip backward compatibility wrapper for existing views/services
def plan_trip(trip):
    """
    Legacy wrapper for Trip instances.
    Calls plan_trip_logic and returns legacy dictionary structure if needed.
    """
    res = plan_trip_logic(
        vehicle=trip.vehicle,
        source_name=trip.source,
        destination_name=trip.destination,
        source_lat=float(trip.source_latitude or 23.0225),
        source_lng=float(trip.source_longitude or 72.5714),
        dest_lat=float(trip.destination_latitude or 21.1702),
        dest_lng=float(trip.destination_longitude or 72.8311),
        current_battery_percentage=float(trip.current_battery_percentage or trip.vehicle.current_battery_percentage or 100.0)
    )

    first_station = None
    if res.get("stops"):
        first_st_id = res["stops"][0]["station"]["id"]
        first_station = Station.objects.filter(id=first_st_id).first()

    return {
        "battery_needed": round((res["total_distance_km"] / float(trip.vehicle.efficiency) / float(trip.vehicle.battery_capacity)) * 100.0, 2),
        "charging_required": res["charging_required"],
        "recommended_station": first_station,
        "wait_time": res["total_wait_minutes"],
        "estimated_cost": res["total_estimated_cost"],
        "stops": [
            {
                "station_id": s["station"]["id"],
                "station_name": s["station"]["station_name"],
                "latitude": s["station"]["latitude"],
                "longitude": s["station"]["longitude"],
                "address": s["station"]["address"],
                "city": s["station"]["city"],
                "distance_from_previous_km": s["leg_distance_km"],
                "arrival_battery_percentage": s["arrival_battery_percentage"],
                "charge_needed_percentage": round(s["target_battery_percentage"] - s["arrival_battery_percentage"], 2),
                "energy_to_charge_kwh": s["energy_added_kwh"],
                "estimated_charging_time_minutes": s["charging_minutes"],
                "wait_time_minutes": s["wait_minutes"],
                "estimated_cost": s["estimated_cost"],
            }
            for s in res.get("stops", [])
        ],
        "estimated_destination_battery": res["estimated_destination_battery_percentage"],
        "warning": None,
    }