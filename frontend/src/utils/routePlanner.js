import { calculateDistanceKm, isValidCoordinate } from "./geo";

/**
 * EV-ChargeX Route Planner Display Helpers
 * Single source of truth for planning calculations resides on the Django backend (POST /api/trips/plan/).
 */

export const RESERVE_BATTERY_DEFAULT = 20; // 20%
export const CRITICAL_BATTERY_MINIMUM = 10; // 10%

/**
 * Calculates EV driving range metrics for visual presentation.
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
 * Computes minimum distance in km from a station coordinate to any vertex on an OSRM route polyline.
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

  for (let i = 0; i < coordinates.length; i++) {
    const [vertexLng, vertexLat] = coordinates[i];
    const dist = calculateDistanceKm(lat, lng, vertexLat, vertexLng);
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
