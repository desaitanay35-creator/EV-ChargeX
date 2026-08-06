import { isValidCoordinate } from "../utils/geo";

/**
 * Route Service for EV-ChargeX (OSRM Driving Directions)
 */

export const OSRM_BASE_URL =
  import.meta.env.VITE_OSRM_BASE_URL || "https://router.project-osrm.org";

export const ROUTE_ERROR_CODES = {
  INVALID_COORDINATES: "INVALID_COORDINATES",
  ROUTE_NOT_FOUND: "ROUTE_NOT_FOUND",
  ROUTE_SERVICE_ERROR: "ROUTE_SERVICE_ERROR",
  ROUTE_REQUEST_ABORTED: "ROUTE_REQUEST_ABORTED",
  INVALID_ROUTE_RESPONSE: "INVALID_ROUTE_RESPONSE",
};

/**
 * Formats duration in minutes to a human-readable string (e.g., "14 min", "4 hr 18 min").
 * @param {number} totalMinutes
 * @returns {string}
 */
export const formatDuration = (totalMinutes) => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
    return "";
  }
  const mins = Math.round(Number(totalMinutes));
  if (mins < 60) {
    return `${mins} min`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (remainingMins === 0) {
    return `${hours} hr`;
  }
  return `${hours} hr ${remainingMins} min`;
};

/**
 * Fetches driving route directions between origin and destination using OSRM.
 * Preserves longitude,latitude coordinate ordering in URL request.
 */
export const getDrivingRoute = async ({
  originLatitude,
  originLongitude,
  destinationLatitude,
  destinationLongitude,
  signal,
}) => {
  if (
    !isValidCoordinate(originLatitude, originLongitude) ||
    !isValidCoordinate(destinationLatitude, destinationLongitude)
  ) {
    const error = new Error("Invalid or missing origin/destination coordinates.");
    error.code = ROUTE_ERROR_CODES.INVALID_COORDINATES;
    throw error;
  }

  const originLat = Number(originLatitude);
  const originLng = Number(originLongitude);
  const destLat = Number(destinationLatitude);
  const destLng = Number(destinationLongitude);

  // OSRM coordinate format: longitude,latitude;longitude,latitude
  const coordsPath = `${originLng},${originLat};${destLng},${destLat}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordsPath}?overview=full&geometries=geojson&steps=false&alternatives=false`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      const error = new Error(`Routing service returned status ${response.status}`);
      error.code = ROUTE_ERROR_CODES.ROUTE_SERVICE_ERROR;
      throw error;
    }

    const data = await response.json();

    if (data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
      const error = new Error("No driving route could be found between these locations.");
      error.code = ROUTE_ERROR_CODES.ROUTE_NOT_FOUND;
      throw error;
    }

    const primaryRoute = data.routes[0];

    if (
      !primaryRoute.geometry ||
      primaryRoute.geometry.type !== "LineString" ||
      !Array.isArray(primaryRoute.geometry.coordinates) ||
      primaryRoute.geometry.coordinates.length === 0
    ) {
      const error = new Error("Invalid route geometry returned by routing service.");
      error.code = ROUTE_ERROR_CODES.INVALID_ROUTE_RESPONSE;
      throw error;
    }

    const distance_meters = Number(primaryRoute.distance || 0);
    const distance_km = Number((distance_meters / 1000).toFixed(2));
    const duration_seconds = Number(primaryRoute.duration || 0);
    const duration_minutes = Math.max(1, Math.round(duration_seconds / 60));

    if (distance_meters <= 0) {
      const error = new Error("Invalid 0-meter route distance returned.");
      error.code = ROUTE_ERROR_CODES.INVALID_ROUTE_RESPONSE;
      throw error;
    }

    return {
      geometry: primaryRoute.geometry, // { type: "LineString", coordinates: [[lng, lat], ...] }
      distance_meters,
      distance_km,
      duration_seconds,
      duration_minutes,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      const abortErr = new Error("Route calculation request was cancelled.");
      abortErr.code = ROUTE_ERROR_CODES.ROUTE_REQUEST_ABORTED;
      throw abortErr;
    }

    if (err.code) {
      throw err;
    }

    const networkErr = new Error("The routing service is currently unavailable. Check network connection.");
    networkErr.code = ROUTE_ERROR_CODES.ROUTE_SERVICE_ERROR;
    throw networkErr;
  }
};

/**
 * Fetches driving route via one or more intermediate waypoints (e.g. Origin -> Station -> Destination).
 * @param {Array<{lat: number, lng: number}>} waypoints Array of points starting with origin and ending with destination.
 * @param {AbortSignal} [signal]
 */
export const getMultiStopDrivingRoute = async (waypoints = [], signal) => {
  if (waypoints.length < 2) {
    throw new Error("Multi-stop route requires at least origin and destination.");
  }

  const valid = waypoints.every((wp) => isValidCoordinate(wp.lat, wp.lng));
  if (!valid) {
    throw new Error("One or more waypoints have invalid coordinates.");
  }

  const coordsPath = waypoints.map((wp) => `${Number(wp.lng)},${Number(wp.lat)}`).join(";");
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordsPath}?overview=full&geometries=geojson&steps=false&alternatives=false`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) return null;
    const data = await response.json();
    if (data.code !== "Ok" || !data.routes || !data.routes.length) return null;

    const route = data.routes[0];
    const distance_km = Number(((route.distance || 0) / 1000).toFixed(2));
    const duration_minutes = Math.max(1, Math.round((route.duration || 0) / 60));

    return {
      geometry: route.geometry,
      distance_km,
      duration_minutes,
    };
  } catch (err) {
    console.warn("Multi-stop OSRM route fetch failed:", err);
    return null;
  }
};

export const getRouteToStation = getDrivingRoute;

const routeService = {
  getDrivingRoute,
  getMultiStopDrivingRoute,
  getRouteToStation,
  formatDuration,
  ROUTE_ERROR_CODES,
};

export default routeService;
