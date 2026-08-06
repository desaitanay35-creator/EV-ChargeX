import math
import os
import requests
from requests.adapters import HTTPAdapter
from django.conf import settings

OSRM_BASE_URL = getattr(
    settings,
    "OSRM_BASE_URL",
    os.getenv("OSRM_BASE_URL", "https://router.project-osrm.org")
)

_session = requests.Session()
adapter = HTTPAdapter(pool_connections=25, pool_maxsize=25, max_retries=1)
_session.mount("https://", adapter)
_session.mount("http://", adapter)


def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points in decimal degrees.
    Used ONLY as a coarse pre-filter for candidate stations.
    """
    lat1, lon1, lat2, lon2 = map(math.radians, [float(lat1), float(lon1), float(lat2), float(lon2)])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0) ** 2
    c = 2 * math.asin(math.sqrt(a))
    r = 6371.0  # Earth radius in kilometers
    return c * r


def get_osrm_route(origin_lat, origin_lng, dest_lat, dest_lng, timeout=1.5, cache_dict=None):
    """
    Fetches OSRM driving route between origin and destination.
    Uses multi-connection HTTP adapter, short timeout, and optional per-request in-memory cache.
    """
    orig_lat = round(float(origin_lat), 6)
    orig_lng = round(float(origin_lng), 6)
    dst_lat = round(float(dest_lat), 6)
    dst_lng = round(float(dest_lng), 6)

    cache_key = (orig_lat, orig_lng, dst_lat, dst_lng)
    if cache_dict is not None and cache_key in cache_dict:
        return cache_dict[cache_key]

    coords_path = f"{orig_lng},{orig_lat};{dst_lng},{dst_lat}"
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords_path}?overview=full&geometries=geojson&steps=false&alternatives=false"

    result = None
    try:
        resp = _session.get(url, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                primary = data["routes"][0]
                dist_m = float(primary.get("distance", 0))
                dur_s = float(primary.get("duration", 0))
                dist_km = round(dist_m / 1000.0, 2)
                dur_min = max(1, int(round(dur_s / 60.0)))
                geometry = primary.get("geometry", {
                    "type": "LineString",
                    "coordinates": [[orig_lng, orig_lat], [dst_lng, dst_lat]]
                })

                legs = []
                for leg in primary.get("legs", []):
                    l_dist_m = float(leg.get("distance", 0))
                    l_dur_s = float(leg.get("duration", 0))
                    legs.append({
                        "distance_km": round(l_dist_m / 1000.0, 2),
                        "duration_minutes": max(1, int(round(l_dur_s / 60.0))),
                    })

                result = {
                    "distance_km": dist_km,
                    "duration_minutes": dur_min,
                    "geometry": geometry,
                    "legs": legs,
                }
    except Exception:
        pass

    if not result:
        # Fallback if OSRM endpoint fails, times out, or network issue
        hav_dist = round(haversine_distance(orig_lat, orig_lng, dst_lat, dst_lng), 2)
        dur_min = max(1, int(round((hav_dist / 60.0) * 60))) # ~60 km/h average
        result = {
            "distance_km": hav_dist,
            "duration_minutes": dur_min,
            "geometry": {
                "type": "LineString",
                "coordinates": [[orig_lng, orig_lat], [dst_lng, dst_lat]]
            },
            "legs": [{"distance_km": hav_dist, "duration_minutes": dur_min}],
        }

    if cache_dict is not None:
        cache_dict[cache_key] = result
    return result


def get_osrm_multi_stop_route(waypoints, timeout=2.5):
    """
    Fetches OSRM driving route via multiple waypoints: [(lat, lng), (lat, lng), ...]
    """
    if len(waypoints) < 2:
        raise ValueError("Multi-stop route requires at least 2 waypoints.")

    coords_str = ";".join([f"{float(wp[1]):.6f},{float(wp[0]):.6f}" for wp in waypoints])
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coords_str}?overview=full&geometries=geojson&steps=false&alternatives=false"

    try:
        resp = _session.get(url, timeout=timeout)
        if resp.status_code == 200:
            data = resp.json()
            if data.get("code") == "Ok" and data.get("routes"):
                primary = data["routes"][0]
                dist_m = float(primary.get("distance", 0))
                dur_s = float(primary.get("duration", 0))
                dist_km = round(dist_m / 1000.0, 2)
                dur_min = max(1, int(round(dur_s / 60.0)))
                geometry = primary.get("geometry", {
                    "type": "LineString",
                    "coordinates": [[float(wp[1]), float(wp[0])] for wp in waypoints]
                })

                legs = []
                for leg in primary.get("legs", []):
                    l_dist_m = float(leg.get("distance", 0))
                    l_dur_s = float(leg.get("duration", 0))
                    legs.append({
                        "distance_km": round(l_dist_m / 1000.0, 2),
                        "duration_minutes": max(1, int(round(l_dur_s / 60.0))),
                    })

                return {
                    "distance_km": dist_km,
                    "duration_minutes": dur_min,
                    "geometry": geometry,
                    "legs": legs,
                }
    except Exception:
        pass

    # Fallback calculating haversine legs
    total_dist = 0.0
    total_dur = 0
    legs = []
    coords = []
    for i in range(len(waypoints)):
        lat, lng = waypoints[i]
        coords.append([float(lng), float(lat)])
        if i > 0:
            p_lat, p_lng = waypoints[i - 1]
            leg_d = round(haversine_distance(p_lat, p_lng, lat, lng), 2)
            leg_t = max(1, int(round((leg_d / 60.0) * 60)))
            total_dist += leg_d
            total_dur += leg_t
            legs.append({"distance_km": leg_d, "duration_minutes": leg_t})

    return {
        "distance_km": round(total_dist, 2),
        "duration_minutes": max(1, total_dur),
        "geometry": {"type": "LineString", "coordinates": coords},
        "legs": legs,
    }
