/**
 * Utility functions for EV connector type normalization and compatibility checks.
 */

/**
 * Standardizes connector type string representation for robust comparison.
 * e.g., "CCS 2", "CCS-2", "ccs2" -> "CCS2"
 *       "Type 2", "TYPE-2" -> "TYPE2"
 *       "GB/T", "GBT", "GB-T" -> "GB/T"
 *       "CHAdeMO", "CHADEMO" -> "CHADEMO"
 *
 * @param {string} connector
 * @returns {string}
 */
export const normalizeConnectorType = (connector) => {
  if (!connector || typeof connector !== "string") {
    return "";
  }

  const trimmed = connector.trim().toUpperCase();

  // Normalize CCS2 variations
  if (/^CCS[-_\s]?2$/i.test(trimmed)) {
    return "CCS2";
  }

  // Normalize Type2 variations
  if (/^TYPE[-_\s]?2$/i.test(trimmed)) {
    return "TYPE2";
  }

  // Normalize GB/T variations
  if (/^GB[-_\s/]?T$/i.test(trimmed)) {
    return "GB/T";
  }

  // Normalize CHAdeMO variations
  if (/^CHADEMO$/i.test(trimmed)) {
    return "CHADEMO";
  }

  return trimmed;
};

/**
 * Checks whether a vehicle's connector type is compatible with a charger's connector type.
 * @param {string} vehicleConnector
 * @param {string} chargerConnector
 * @returns {boolean}
 */
export const isConnectorCompatible = (vehicleConnector, chargerConnector) => {
  const normVehicle = normalizeConnectorType(vehicleConnector);
  const normCharger = normalizeConnectorType(chargerConnector);

  if (!normVehicle || !normCharger) {
    return false;
  }

  return normVehicle === normCharger;
};

/**
 * Determines station compatibility status against a selected vehicle and charger list.
 *
 * Statuses:
 * - "COMPATIBLE": Has matching connector AND at least one matching charger is AVAILABLE.
 * - "PARTIALLY_COMPATIBLE": Has matching connector BUT all matching chargers are occupied/reserved/maintenance.
 * - "NOT_COMPATIBLE": Station chargers exist but none match vehicle connector.
 * - "UNKNOWN": Vehicle/charger connector data missing or station has no chargers.
 *
 * @param {Object} vehicle
 * @param {Array} stationChargers
 * @returns {{
 *   status: "COMPATIBLE" | "PARTIALLY_COMPATIBLE" | "NOT_COMPATIBLE" | "UNKNOWN",
 *   matchingChargers: Array,
 *   availableMatchingChargers: Array,
 *   compatibleTypes: Array<string>
 * }}
 */
export const evaluateStationCompatibility = (vehicle, stationChargers = []) => {
  if (!vehicle || !vehicle.connector_type || !Array.isArray(stationChargers) || stationChargers.length === 0) {
    return {
      status: "UNKNOWN",
      matchingChargers: [],
      availableMatchingChargers: [],
      compatibleTypes: [],
    };
  }

  const vehicleNorm = normalizeConnectorType(vehicle.connector_type);
  if (!vehicleNorm) {
    return {
      status: "UNKNOWN",
      matchingChargers: [],
      availableMatchingChargers: [],
      compatibleTypes: [],
    };
  }

  const matchingChargers = stationChargers.filter((charger) =>
    isConnectorCompatible(vehicle.connector_type, charger.connector_type)
  );

  const availableMatchingChargers = matchingChargers.filter(
    (charger) => charger.status === "AVAILABLE"
  );

  const compatibleTypes = [
    ...new Set(
      stationChargers
        .map((c) => c.connector_type)
        .filter((c) => isConnectorCompatible(vehicle.connector_type, c))
    ),
  ];

  if (matchingChargers.length === 0) {
    return {
      status: "NOT_COMPATIBLE",
      matchingChargers: [],
      availableMatchingChargers: [],
      compatibleTypes: [],
    };
  }

  if (availableMatchingChargers.length > 0) {
    return {
      status: "COMPATIBLE",
      matchingChargers,
      availableMatchingChargers,
      compatibleTypes,
    };
  }

  return {
    status: "PARTIALLY_COMPATIBLE",
    matchingChargers,
    availableMatchingChargers: [],
    compatibleTypes,
  };
};
