/**
 * Geographical helper utilities for EV-ChargeX.
 */

// Track logged warnings to avoid continuous dev log spam
const warnedStationIds = new Set();

/**
 * Validates whether latitude and longitude are valid numeric coordinates.
 * @param {number|string} lat
 * @param {number|string} lng
 * @returns {boolean}
 */
export const isValidCoordinate = (lat, lng) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }
  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !(latitude === 0 && longitude === 0)
  );
};

/**
 * Calculates straight-line distance in kilometers between two coordinates using the Haversine formula.
 * @param {number|string} lat1
 * @param {number|string} lon1
 * @param {number|string} lat2
 * @param {number|string} lon2
 * @returns {number|null} Distance in kilometers or null if any coordinate is invalid.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    return null;
  }

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((Number(lat2) - Number(lat1)) * Math.PI) / 180;
  const dLon = ((Number(lon2) - Number(lon1)) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((Number(lat1) * Math.PI) / 180) *
      Math.cos((Number(lat2) * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

/**
 * Formats a distance in kilometers to a human-readable string.
 * @param {number|null} distanceKm
 * @returns {string|null} Formatted distance (e.g., "350 m", "1.3 km", "12.8 km") or null if invalid.
 */
export const formatDistance = (distanceKm) => {
  if (
    distanceKm === null ||
    distanceKm === undefined ||
    isNaN(distanceKm) ||
    !isFinite(distanceKm)
  ) {
    return null;
  }

  const km = Number(distanceKm);
  if (km < 0) return null;

  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters} m`;
  }

  return `${km.toFixed(1)} km`;
};

/**
 * Filters stations returning only those with valid coordinates.
 * Logs a single warning per invalid station in development mode.
 * @param {Array} stations
 * @returns {Array} Stations with valid coordinates
 */
export const getValidStationCoordinates = (stations = []) => {
  return stations.filter((station) => {
    const valid = isValidCoordinate(station.latitude, station.longitude);
    if (!valid && station.id && !warnedStationIds.has(station.id)) {
      warnedStationIds.add(station.id);
      console.warn(
        `[EV-ChargeX Map] Station #${station.id} ("${station.station_name}") has invalid or missing coordinates:`,
        { latitude: station.latitude, longitude: station.longitude }
      );
    }
    return valid;
  });
};

/**
 * Default map center fallback (Gujarat / Central India)
 */
export const DEFAULT_MAP_CENTER = {
  lat: 23.0225,
  lng: 72.5714,
  zoom: 11,
};
