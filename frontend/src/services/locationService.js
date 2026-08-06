/**
 * Location Service for EV-ChargeX
 * Provides geolocation & Nominatim geocoding utilities restricted to Gujarat, India.
 */

export const NOMINATIM_BASE_URL =
  import.meta.env.VITE_NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";

export const GEOLOCATION_ERRORS = {
  PERMISSION_DENIED: "PERMISSION_DENIED",
  POSITION_UNAVAILABLE: "POSITION_UNAVAILABLE",
  TIMEOUT: "TIMEOUT",
  GEOLOCATION_UNSUPPORTED: "GEOLOCATION_UNSUPPORTED",
  UNKNOWN: "UNKNOWN",
};

/**
 * Obtains user's current location with high accuracy options.
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number}>}
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject({
        code: GEOLOCATION_ERRORS.GEOLOCATION_UNSUPPORTED,
        message: "This browser does not support location access.",
      });
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        let code = GEOLOCATION_ERRORS.UNKNOWN;
        let message = "An unknown error occurred while retrieving location.";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            code = GEOLOCATION_ERRORS.PERMISSION_DENIED;
            message = "Location permission denied. Enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            code = GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;
            message = "Your current location could not be determined.";
            break;
          case error.TIMEOUT:
            code = GEOLOCATION_ERRORS.TIMEOUT;
            message = "Location request timed out. Please try again.";
            break;
          default:
            code = GEOLOCATION_ERRORS.UNKNOWN;
            message = error.message || message;
        }

        reject({ code, message });
      },
      options
    );
  });
};

/**
 * Searches locations using Nominatim Geocoding API restricted to Gujarat, India.
 * @param {string} query
 * @param {AbortSignal} [signal]
 * @returns {Promise<Array<{display_name: string, short_name: string, latitude: number, longitude: number}>>}
 */
export const geocodeAddress = async (query, signal) => {
  if (!query || query.trim().length < 3) return [];

  const rawQuery = query.trim();
  const searchQuery = rawQuery.toLowerCase().includes("gujarat")
    ? rawQuery
    : `${rawQuery}, Gujarat, India`;

  const url = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in&limit=10`;

  try {
    const res = await fetch(url, {
      signal,
      headers: { "Accept-Language": "en" },
    });

    if (!res.ok) return [];

    const data = await res.json();

    // Filter results strictly within Gujarat, India boundaries or text
    const gujaratLocations = data
      .filter((item) => {
        const displayName = (item.display_name || "").toLowerCase();
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        const isGujaratText = displayName.includes("gujarat");
        const isGujaratGeo = lat >= 20.0 && lat <= 24.8 && lon >= 68.0 && lon <= 74.8;

        return isGujaratText || isGujaratGeo;
      })
      .map((item) => ({
        display_name: item.display_name,
        short_name: item.display_name.split(",")[0],
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
      }));

    if (gujaratLocations.length === 0) {
      // Fallback: search raw query with countrycodes=in and filter
      const fallbackUrl = `${NOMINATIM_BASE_URL}/search?format=json&q=${encodeURIComponent(rawQuery)}&countrycodes=in&limit=10`;
      const fRes = await fetch(fallbackUrl, { signal, headers: { "Accept-Language": "en" } });
      if (fRes.ok) {
        const fData = await fRes.json();
        return fData
          .filter((item) => (item.display_name || "").toLowerCase().includes("gujarat"))
          .slice(0, 5)
          .map((item) => ({
            display_name: item.display_name,
            short_name: item.display_name.split(",")[0],
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
          }));
      }
    }

    return gujaratLocations.slice(0, 5);
  } catch (err) {
    if (err.name === "AbortError") throw err;
    console.warn("Geocoding failed:", err);
    return [];
  }
};

/**
 * Reverse geocodes latitude/longitude to a place name. Fallbacks gracefully to coordinate string.
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string>}
 */
export const reverseGeocode = async (lat, lng) => {
  const fallback = `Current Location (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
  try {
    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}`;
    const res = await fetch(url, { headers: { "Accept-Language": "en" } });
    if (!res.ok) return fallback;
    const data = await res.json();
    return data.display_name || fallback;
  } catch (err) {
    console.warn("Reverse geocoding failed, using GPS fallback:", err);
    return fallback;
  }
};

const locationService = {
  getCurrentLocation,
  geocodeAddress,
  reverseGeocode,
  GEOLOCATION_ERRORS,
  NOMINATIM_BASE_URL,
};

export default locationService;
