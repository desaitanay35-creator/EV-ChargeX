import { calculateDistanceKm, isValidCoordinate } from "./geo";
import { isConnectorCompatible } from "./connectorCompatibility";

/**
 * Route Planner Utilities for EV-ChargeX
 */

export const RESERVE_BATTERY_DEFAULT = 20; // 20%
export const CRITICAL_BATTERY_MINIMUM = 10; // 10%
export const PREFERRED_CORRIDOR_KM = 5.0; // 5 km
export const FALLBACK_CORRIDOR_KM = 10.0; // 10 km
export const MAX_STOPS_LIMIT = 5;

/**
 * Calculates EV driving range metrics.
 */
export const calculateEvRangeMetrics = (
  capacityKwh,
  currentBatteryPercent,
  efficiencyKmPerKwh,
  reservePercent = RESERVE_BATTERY_DEFAULT
) => {
  const cap = Number(capacityKwh) || 0;
  const curr = Number(currentBatteryPercent) || 0;
  const eff = Number(efficiencyKmPerKwh) || 0;

  if (cap <= 0 || eff <= 0) {
    return { invalid: true };
  }

  const usableEnergyKwh = (cap * curr) / 100;
  const estimatedTotalRangeKm = usableEnergyKwh * eff;

  const reserveEnergyKwh = (cap * reservePercent) / 100;
  const safeDrivingEnergyKwh = Math.max(0, usableEnergyKwh - reserveEnergyKwh);
  const safeRangeKm = curr <= reservePercent ? 0 : safeDrivingEnergyKwh * eff;

  return {
    invalid: false,
    usableEnergyKwh: Number(usableEnergyKwh.toFixed(2)),
    estimatedTotalRangeKm: Number(estimatedTotalRangeKm.toFixed(1)),
    reserveEnergyKwh: Number(reserveEnergyKwh.toFixed(2)),
    safeDrivingEnergyKwh: Number(safeDrivingEnergyKwh.toFixed(2)),
    safeRangeKm: Number(safeRangeKm.toFixed(1)),
  };
};

/**
 * Computes cumulative distance array for OSRM GeoJSON LineString coordinates [[lng, lat], ...]
 * @returns {Array<number>} Cumulative distance in km for each coordinate vertex.
 */
export const computeCumulativeRouteDistances = (coordinates = []) => {
  const cumulative = [0];
  let total = 0;

  for (let i = 1; i < coordinates.length; i++) {
    const [lng1, lat1] = coordinates[i - 1];
    const [lng2, lat2] = coordinates[i];
    const segDist = calculateDistanceKm(lat1, lng1, lat2, lng2) || 0;
    total += segDist;
    cumulative.push(total);
  }

  return cumulative;
};

/**
 * Finds the exact point along an OSRM route geometry at a target distance.
 */
export const findPointAlongRouteAtDistance = (
  coordinates = [],
  cumulativeDistances = [],
  targetDistanceKm = 0
) => {
  if (!coordinates.length) return null;
  if (targetDistanceKm <= 0) {
    return {
      lat: coordinates[0][1],
      lng: coordinates[0][0],
      distanceKm: 0,
      index: 0,
    };
  }

  const totalDist = cumulativeDistances[cumulativeDistances.length - 1] || 0;
  if (targetDistanceKm >= totalDist) {
    const last = coordinates[coordinates.length - 1];
    return {
      lat: last[1],
      lng: last[0],
      distanceKm: totalDist,
      index: coordinates.length - 1,
    };
  }

  for (let i = 0; i < cumulativeDistances.length - 1; i++) {
    const d1 = cumulativeDistances[i];
    const d2 = cumulativeDistances[i + 1];

    if (targetDistanceKm >= d1 && targetDistanceKm <= d2) {
      const ratio = d2 > d1 ? (targetDistanceKm - d1) / (d2 - d1) : 0;
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[i + 1];

      const interpLat = lat1 + (lat2 - lat1) * ratio;
      const interpLng = lng1 + (lng2 - lng1) * ratio;

      return {
        lat: interpLat,
        lng: interpLng,
        distanceKm: targetDistanceKm,
        index: i,
      };
    }
  }

  const first = coordinates[0];
  return { lat: first[1], lng: first[0], distanceKm: 0, index: 0 };
};

/**
 * Computes minimum perpendicular distance in km from a point to a line segment (lat1, lon1) -> (lat2, lon2).
 */
export const distanceToLineSegmentKm = (pointLat, pointLng, lat1, lon1, lat2, lon2) => {
  const d12 = calculateDistanceKm(lat1, lon1, lat2, lon2);
  if (!d12 || d12 === 0) {
    return calculateDistanceKm(pointLat, pointLng, lat1, lon1) || 9999;
  }

  const dx = lon2 - lon1;
  const dy = lat2 - lat1;
  const u = ((pointLng - lon1) * dx + (pointLat - lat1) * dy) / (dx * dx + dy * dy);

  if (u <= 0) {
    return calculateDistanceKm(pointLat, pointLng, lat1, lon1) || 9999;
  }
  if (u >= 1) {
    return calculateDistanceKm(pointLat, pointLng, lat2, lon2) || 9999;
  }

  const projLat = lat1 + u * dy;
  const projLng = lon1 + u * dx;

  return calculateDistanceKm(pointLat, pointLng, projLat, projLng) || 9999;
};

/**
 * Computes minimum distance in km from a station coordinate to an OSRM route polyline.
 * Also returns nearest route vertex index and distance along the route.
 */
export const calculateStationRouteProximity = (
  stationLat,
  stationLng,
  coordinates = [],
  cumulativeDistances = []
) => {
  const lat = Number(stationLat);
  const lng = Number(stationLng);

  if (!isValidCoordinate(lat, lng) || !coordinates.length) {
    return { minRouteDistanceKm: 9999, nearestRouteProgressKm: 0, nearestIndex: 0 };
  }

  let minDistance = 9999;
  let nearestProgress = 0;
  let nearestIdx = 0;

  const step = Math.max(1, Math.floor(coordinates.length / 300));
  for (let i = 0; i < coordinates.length - 1; i += step) {
    const nextIdx = Math.min(coordinates.length - 1, i + step);
    const [lng1, lat1] = coordinates[i];
    const [lng2, lat2] = coordinates[nextIdx];

    const dist = distanceToLineSegmentKm(lat, lng, lat1, lng1, lat2, lng2);
    if (dist < minDistance) {
      minDistance = dist;
      nearestProgress = cumulativeDistances[i] || 0;
      nearestIdx = i;
    }
  }

  return {
    minRouteDistanceKm: Number(minDistance.toFixed(2)),
    nearestRouteProgressKm: Number(nearestProgress.toFixed(1)),
    nearestIndex: nearestIdx,
  };
};

/**
 * Filters and ranks candidate stations along a route segment with stage-by-stage diagnostics.
 */
export const filterAndRankStationsAlongRoute = ({
  stations = [],
  routeCoordinates = [],
  cumulativeDistances = [],
  startProgressKm = 0,
  targetReserveProgressKm = 0,
  vehicleConnectorType = "",
  currentBatteryPercent = 100,
  batteryCapacityKwh = 60,
  efficiencyKmPerKwh = 6,
  usedStationIds = new Set(),
}) => {
  const diagnostics = {
    totalStationRecords: stations.length,
    validCoordinateStations: 0,
    openStations: 0,
    compatibleChargerRecords: 0,
    stationsWithCompatibleCharger: 0,
    stationsWithAvailableCompatibleCharger: 0,
    corridor5kmStations: 0,
    corridor10kmStations: 0,
    reachableStations: 0,
  };

  if (!stations.length) {
    return { shortlisted: [], diagnostics, emptyReason: "NO_STATIONS_LOADED" };
  }

  const candidatePool = [];

  for (const station of stations) {
    const lat = Number(station.latitude);
    const lng = Number(station.longitude);

    if (!isValidCoordinate(lat, lng)) continue;
    diagnostics.validCoordinateStations++;

    if (station.status !== "OPEN") continue;
    diagnostics.openStations++;

    if (usedStationIds.has(station.id)) continue;

    // Check charger records using canonical connector matching
    const stationChargers = Array.isArray(station.chargers) ? station.chargers : [];
    
    const matchingChargers = stationChargers.filter((c) =>
      isConnectorCompatible(vehicleConnectorType, c.connector_type)
    );

    if (matchingChargers.length === 0) continue;
    diagnostics.stationsWithCompatibleCharger++;
    diagnostics.compatibleChargerRecords += matchingChargers.length;

    const availableChargers = matchingChargers.filter(
      (c) => c.status === "AVAILABLE"
    );

    if (availableChargers.length === 0) continue;
    diagnostics.stationsWithAvailableCompatibleCharger++;

    // Calculate route corridor proximity
    const prox = calculateStationRouteProximity(lat, lng, routeCoordinates, cumulativeDistances);

    if (prox.minRouteDistanceKm <= PREFERRED_CORRIDOR_KM) {
      diagnostics.corridor5kmStations++;
    }

    if (prox.minRouteDistanceKm > FALLBACK_CORRIDOR_KM) continue;
    diagnostics.corridor10kmStations++;

    // Route progress calculation (stations along route)
    const distanceToStationFromStart = Math.max(0, prox.nearestRouteProgressKm - startProgressKm);

    // Initial battery consumption using route progress
    const energyUsedKwh = distanceToStationFromStart / efficiencyKmPerKwh;
    const batteryUsedPercent = (energyUsedKwh / batteryCapacityKwh) * 100;
    const estimatedArrivalBattery = currentBatteryPercent - batteryUsedPercent;

    if (estimatedArrivalBattery < CRITICAL_BATTERY_MINIMUM) continue;
    diagnostics.reachableStations++;

    const distFromTargetKm = Math.abs(prox.nearestRouteProgressKm - targetReserveProgressKm);
    const maxPowerKw = Math.max(...availableChargers.map((c) => Number(c.power_output_kw) || 0));
    const minPricePerKwh = Math.min(...availableChargers.map((c) => Number(c.price_per_kwh) || 0));

    candidatePool.push({
      ...station,
      latitude: lat,
      longitude: lng,
      routeProximityKm: prox.minRouteDistanceKm,
      routeProgressKm: prox.nearestRouteProgressKm,
      distanceFromStartKm: Number(distanceToStationFromStart.toFixed(1)),
      estimatedArrivalBattery: Number(estimatedArrivalBattery.toFixed(1)),
      availableChargersCount: availableChargers.length,
      matchingChargers: availableChargers,
      maxPowerKw,
      minPricePerKwh: isFinite(minPricePerKwh) ? minPricePerKwh : null,
      distFromTargetKm,
      isPreferredCorridor: prox.minRouteDistanceKm <= PREFERRED_CORRIDOR_KM,
    });
  }

  // Rank candidate pool
  candidatePool.sort((a, b) => {
    if (Math.abs(a.distFromTargetKm - b.distFromTargetKm) > 15) {
      return a.distFromTargetKm - b.distFromTargetKm;
    }
    if (a.isPreferredCorridor !== b.isPreferredCorridor) {
      return a.isPreferredCorridor ? -1 : 1;
    }
    if (b.availableChargersCount !== a.availableChargersCount) {
      return b.availableChargersCount - a.availableChargersCount;
    }
    return (b.rating || 0) - (a.rating || 0);
  });

  const shortlisted = candidatePool.slice(0, 10);

  let emptyReason = null;
  if (shortlisted.length === 0) {
    if (diagnostics.stationsWithCompatibleCharger === 0) {
      emptyReason = "NO_COMPATIBLE_CHARGERS";
    } else if (diagnostics.stationsWithAvailableCompatibleCharger === 0) {
      emptyReason = "NO_AVAILABLE_CHARGERS";
    } else if (diagnostics.corridor10kmStations === 0) {
      emptyReason = "NO_CORRIDOR_MATCHES";
    } else if (diagnostics.reachableStations === 0) {
      emptyReason = "NO_REACHABLE_STATIONS";
    } else {
      emptyReason = "NO_REACHABLE_STATIONS";
    }
  }

  return { shortlisted, diagnostics, emptyReason };
};
