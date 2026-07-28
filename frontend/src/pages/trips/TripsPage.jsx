import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaBatteryHalf,
  FaCar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPlus,
  FaRoad,
  FaRoute,
  FaSearch,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";

import TripRouteMap from "../../components/map/TripRouteMap";
import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import locationService, { GEOLOCATION_ERRORS } from "../../services/locationService";
import routeService, { ROUTE_ERROR_CODES } from "../../services/routeService";
import { formatCurrency, formatDate, formatEnergy } from "../../utils/format";
import { calculateDistanceKm, isValidCoordinate } from "../../utils/geo";

function TripsPage() {
  const loader = useCallback(async () => {
    const [trips, vehicles, stations] = await Promise.all([
      evService.trips.list(),
      evService.vehicles.list(),
      evService.stations.list(),
    ]);
    return {
      trips: toList(trips),
      vehicles: toList(vehicles),
      stations: toList(stations),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vehicle Selection
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const selectedVehicle = useMemo(() => {
    if (!data?.vehicles) return null;
    return data.vehicles.find((v) => Number(v.id) === Number(selectedVehicleId)) || data.vehicles[0] || null;
  }, [data, selectedVehicleId]);

  // Source Location State
  const [sourceQuery, setSourceQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState(null); // { name, lat, lng }
  const [sourceResults, setSourceResults] = useState([]);
  const [searchingSource, setSearchingSource] = useState(false);
  const [locationStatus, setLocationStatus] = useState("IDLE"); // IDLE, DETECTING, SELECTED, DENIED, ERROR

  // Destination Location State
  const [destQuery, setDestQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState(null); // { name, lat, lng }
  const [destResults, setDestResults] = useState([]);
  const [searchingDest, setSearchingDest] = useState(false);

  // Calculated Route State
  const [routeData, setRouteData] = useState(null); // { distance_km, duration_minutes, duration_seconds, geometry }
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [recommendedStations, setRecommendedStations] = useState([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationsError, setRecommendationsError] = useState(null);

  // Abort Controllers for Search
  const sourceAbortRef = useRef(null);
  const destAbortRef = useRef(null);

  const openForm = () => {
    const firstVeh = data?.vehicles[0]?.id || "";
    setSelectedVehicleId(firstVeh);
    setSourceQuery("");
    setSelectedSource(null);
    setSourceResults([]);
    setLocationStatus("IDLE");
    setDestQuery("");
    setSelectedDest(null);
    setDestResults([]);
    setRouteData(null);
    setRouteError(null);
    setSelectedStation(null);
    setRecommendedStations([]);
    setRecommendationsError(null);
    setRecommendationsLoading(false);
    setModalOpen(true);
  };

  // 1. Geolocation: "Use my current location"
  const handleUseCurrentLocation = async () => {
    setLocationStatus("DETECTING");
    try {
      const pos = await locationService.getCurrentLocation();
      const placeName = await locationService.reverseGeocode(pos.latitude, pos.longitude);
      const locObj = {
        name: placeName,
        lat: pos.latitude,
        lng: pos.longitude,
      };
      setSelectedSource(locObj);
      setSourceQuery(placeName);
      setSourceResults([]);
      setLocationStatus("SELECTED");
      toast.success("Current location acquired.");
    } catch (err) {
      if (err.code === GEOLOCATION_ERRORS.PERMISSION_DENIED) {
        setLocationStatus("DENIED");
        toast.error("Location permission denied. Please enter address manually.");
      } else {
        setLocationStatus("ERROR");
        toast.error(err.message || "Could not determine your location.");
      }
    }
  };

  // 2. Debounced Source Search
  useEffect(() => {
    if (!sourceQuery || sourceQuery.length < 3 || selectedSource?.name === sourceQuery) {
      setSourceResults([]);
      setSearchingSource(false);
      return;
    }

    if (sourceAbortRef.current) sourceAbortRef.current.abort();
    sourceAbortRef.current = new AbortController();

    const timer = setTimeout(async () => {
      setSearchingSource(true);
      try {
        const results = await locationService.geocodeAddress(sourceQuery, sourceAbortRef.current.signal);
        setSourceResults(results);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Source geocode error:", err);
      } finally {
        setSearchingSource(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [sourceQuery, selectedSource]);

  // 3. Debounced Destination Search
  useEffect(() => {
    if (!destQuery || destQuery.length < 3 || selectedDest?.name === destQuery) {
      setDestResults([]);
      setSearchingDest(false);
      return;
    }

    if (destAbortRef.current) destAbortRef.current.abort();
    destAbortRef.current = new AbortController();

    const timer = setTimeout(async () => {
      setSearchingDest(true);
      try {
        const results = await locationService.geocodeAddress(destQuery, destAbortRef.current.signal);
        setDestResults(results);
      } catch (err) {
        if (err.name !== "AbortError") console.error("Dest geocode error:", err);
      } finally {
        setSearchingDest(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [destQuery, selectedDest]);

  // 4. Calculate Driving Route via OSRM
  const calculateRoute = async () => {
    if (!selectedSource || !selectedDest) {
      toast.warn("Please select valid source and destination locations from the suggestions list.");
      return;
    }

    setCalculatingRoute(true);
    setRouteError(null);
    try {
      const routeRes = await routeService.getDrivingRoute({
        originLatitude: selectedSource.lat,
        originLongitude: selectedSource.lng,
        destinationLatitude: selectedDest.lat,
        destinationLongitude: selectedDest.lng,
      });

      setRouteData(routeRes);
      toast.success(`Route calculated: ${routeRes.distance_km} km`);
    } catch (err) {
      setRouteData(null);
      setRouteError(err.message || "Failed to calculate road route.");
      toast.error(err.message || "Route calculation failed.");
    } finally {
      setCalculatingRoute(false);
    }
  };

  // 5. Energy and Battery Calculations
  const batteryMetrics = useMemo(() => {
    if (!selectedVehicle || !routeData) return null;

    const capacityKwh = Number(selectedVehicle.battery_capacity || 0);
    const efficiency = Number(selectedVehicle.efficiency || 0); // km per kWh
    const currentBattery = Number(selectedVehicle.current_battery_percentage || 0);
    const distanceKm = routeData.distance_km;

    if (capacityKwh <= 0 || efficiency <= 0) {
      return { invalidVehicle: true };
    }

    const energyRequiredKwh = distanceKm / efficiency;
    const batteryRequiredPercent = (energyRequiredKwh / capacityKwh) * 100;
    const safeRequiredPercent = batteryRequiredPercent + 10; // 10 percentage points safety reserve
    const isExceedingTotalCapacity = batteryRequiredPercent > 100;
    const isChargingRequired = currentBattery < safeRequiredPercent;
    const shortfallPercent = Math.max(0, safeRequiredPercent - currentBattery);

    return {
      invalidVehicle: false,
      energyRequiredKwh: Number(energyRequiredKwh.toFixed(2)),
      batteryRequiredPercent: Number(batteryRequiredPercent.toFixed(1)),
      safeRequiredPercent: Number(safeRequiredPercent.toFixed(1)),
      currentBattery,
      isExceedingTotalCapacity,
      isChargingRequired,
      shortfallPercent: Number(shortfallPercent.toFixed(1)),
    };
  }, [selectedVehicle, routeData]);

  const fetchRecommendations = useCallback(
    async (route) => {
      if (!selectedVehicle || !selectedSource || !selectedDest || !route) return;

      setRecommendationsLoading(true);
      setRecommendationsError(null);
      setRecommendedStations([]);
      setSelectedStation(null);

      const payload = {
        source_latitude: Number(selectedSource.lat),
        source_longitude: Number(selectedSource.lng),
        destination_latitude: Number(selectedDest.lat),
        destination_longitude: Number(selectedDest.lng),
        vehicle_id: selectedVehicle.id,
        battery_capacity: Number(selectedVehicle.battery_capacity),
        current_battery_percentage: Number(selectedVehicle.current_battery_percentage),
        connector_type: selectedVehicle.connector_type,
        efficiency: Number(selectedVehicle.efficiency),
        route_distance: Number(route.distance_km),
        route_duration_minutes: Number(route.duration_minutes),
      };

      try {
        const response = await evService.recommendStation(payload);
        const stations = response?.recommended_stations || [];
        const station = response?.recommended_station;

        if (Array.isArray(stations) && stations.length > 0) {
          setRecommendedStations(stations);
          setRecommendationsError(null);
        } else if (station) {
          setRecommendedStations([station]);
          setRecommendationsError(null);
        } else {
          setRecommendedStations([]);
          setRecommendationsError(response?.message || "No recommended charging stations were found for this route.");
        }
      } catch (err) {
        setRecommendedStations([]);
        setRecommendationsError(getApiError(err, "Could not fetch station recommendations."));
      } finally {
        setRecommendationsLoading(false);
      }
    },
    [selectedVehicle, selectedSource, selectedDest]
  );

  useEffect(() => {
    if (routeData && selectedVehicle && selectedSource && selectedDest) {
      fetchRecommendations(routeData);
    }
  }, [routeData, selectedVehicle, selectedSource, selectedDest, fetchRecommendations]);

  const resetPlanner = useCallback(() => {
    setSelectedVehicleId(data?.vehicles?.[0]?.id || "");
    setSourceQuery("");
    setSelectedSource(null);
    setSourceResults([]);
    setLocationStatus("IDLE");
    setDestQuery("");
    setSelectedDest(null);
    setDestResults([]);
    setRouteData(null);
    setRouteError(null);
    setSelectedStation(null);
    setRecommendedStations([]);
    setRecommendationsError(null);
    setRecommendationsLoading(false);
  }, [data?.vehicles]);

  // 7. Save Trip Payload & API Call
  const handleSaveTrip = async (event) => {
    event?.preventDefault?.();
    console.log("Save button clicked");

    if (saving) {
      console.log("Save blocked because saving is already in progress");
      return;
    }

    if (!selectedVehicle) {
      console.error("Validation failed: missing selected vehicle");
      toast.error("Please select a vehicle before saving the trip.");
      return;
    }

    if (!selectedSource) {
      console.error("Validation failed: missing source location");
      toast.error("Please select a source location before saving the trip.");
      return;
    }

    if (!selectedDest) {
      console.error("Validation failed: missing destination location");
      toast.error("Please select a destination location before saving the trip.");
      return;
    }

    if (!routeData) {
      console.error("Validation failed: missing route data");
      toast.error("Please calculate the route before saving the trip.");
      return;
    }

    if (!batteryMetrics || batteryMetrics.invalidVehicle) {
      console.error("Validation failed: missing battery prediction data");
      toast.error("Battery prediction is not available for the selected vehicle.");
      return;
    }

    console.log("Validation passed");

    setSaving(true);
    try {
      const batteryNeededVal = batteryMetrics?.batteryRequiredPercent || 0;
      const batteryBeforeVal = Number(selectedVehicle.current_battery_percentage || 0);
      const predictedAfterVal = Math.max(0, batteryBeforeVal - batteryNeededVal);

      const payload = {
        vehicle: selectedVehicle.id,
        source: selectedSource.name.slice(0, 200),
        destination: selectedDest.name.slice(0, 200),
        source_latitude: Number(selectedSource.lat.toFixed(7)),
        source_longitude: Number(selectedSource.lng.toFixed(7)),
        destination_latitude: Number(selectedDest.lat.toFixed(7)),
        destination_longitude: Number(selectedDest.lng.toFixed(7)),
        route_distance: Number(routeData.distance_km.toFixed(2)),
        estimated_duration: Math.round(routeData.duration_minutes),
        battery_before: Number(batteryBeforeVal.toFixed(2)),
        predicted_battery_after: Number(predictedAfterVal.toFixed(2)),
        recommended_station: selectedStation
          ? {
              external_station_id: selectedStation.id,
              station_name: selectedStation.station_name,
              operator: selectedStation.operator?.title || selectedStation.operator || "",
              latitude: Number(selectedStation.latitude.toFixed(6)),
              longitude: Number(selectedStation.longitude.toFixed(6)),
              connector_type: selectedStation.connector_type || selectedStation.connections?.[0]?.connection_type || selectedVehicle.connector_type,
              estimated_wait_time: selectedStation.estimated_wait_time || 0,
            }
          : null,
      };

      console.log("Payload:", payload);
      console.log("Calling POST /api/trips");
      const result = await evService.trips.create(payload);
      console.log("Trip saved successfully", result);
      toast.success("Trip saved successfully.");
      setModalOpen(false);
      resetPlanner();
      await refresh();
    } catch (error) {
      console.error(error);
      const apiMessage = getApiError(error, "Could not save this trip plan.");
      toast.error(apiMessage);
    } finally {
      setSaving(false);
    }
  };

  const removeTrip = async (trip) => {
    if (!window.confirm(`Delete the trip from ${trip.source} to ${trip.destination}?`)) return;
    try {
      await evService.trips.remove(trip.id);
      toast.success("Trip removed.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete trip."));
    }
  };

  if (loading) return <LoadingState label="Loading trip plans..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section className="trips-page-container">
      <PageHeader
        eyebrow="Route & Battery Analytics"
        title="EV Trip Planner"
        description="Calculate real road driving routes, estimate exact battery consumption, and find compatible charging stops."
        action={
          <button className="primary-button" disabled={!data.vehicles.length} onClick={openForm} type="button">
            <FaPlus /> Plan New Trip
          </button>
        }
      />

      {!data.vehicles.length && <div className="inline-alert">Add a vehicle in your profile before planning a trip.</div>}

      {/* List of Saved Trips */}
      {data.trips.length ? (
        <div className="timeline-list">
          {data.trips.map((trip) => {
            const vehicle = data.vehicles.find((v) => Number(v.id) === Number(trip.vehicle));
            const stationName = trip.external_station_name || trip.recommended_station?.station_name || "No stop required";
            const operatorName = trip.external_station_operator || trip.recommended_station?.operator || "";
            return (
              <article className="timeline-card" key={trip.id}>
                <div className="trip-route-visual">
                  <span><FaMapMarkerAlt /></span>
                  <i />
                  <span><FaMapMarkerAlt /></span>
                </div>
                <div className="timeline-content">
                  <div className="timeline-heading">
                    <div>
                      <p>{formatDate(trip.created_at)}</p>
                      <h2>{trip.source} <span>→</span> {trip.destination}</h2>
                    </div>
                    <StatusBadge value={trip.trip_status} />
                  </div>
                  <div className="trip-metrics">
                    <span><FaRoad /><strong>{trip.route_distance || trip.distance_km || "—"} km</strong><small>Distance</small></span>
                    <span><FaRoute /><strong>{routeService.formatDuration(trip.estimated_duration || trip.estimated_time)}</strong><small>Est. Drive Time</small></span>
                    <span><FaBatteryHalf /><strong>{trip.battery_before ?? "—"}%</strong><small>Battery Before</small></span>
                    <span><FaBatteryHalf /><strong>{trip.predicted_battery_after ?? trip.estimated_battery_needed ?? "—"}%</strong><small>Predicted Battery After</small></span>
                    <span><FaCar /><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${trip.vehicle}`}</strong><small>Vehicle</small></span>
                    <span><FaMapMarkerAlt /><strong>{stationName}</strong><small>{operatorName ? `${operatorName} • Stop` : "Stop"}</small></span>
                  </div>
                </div>
                <button className="danger-button" onClick={() => removeTrip(trip)} type="button" aria-label="Delete trip"><FaTrash /></button>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No Trips Planned Yet"
          message="Plan an EV route to view real road driving distances, battery predictions, and charging recommendations."
          action={data.vehicles.length ? <button className="primary-button" onClick={openForm} type="button">Plan Your First Trip</button> : null}
        />
      )}

      {/* Interactive Trip Planner Modal */}
      {modalOpen && (
        <Modal
          title="Plan an EV Trip"
          description="Select your vehicle and locations to calculate OSRM driving routes and battery usage."
          onClose={() => setModalOpen(false)}
        >
          <div className="trip-planner-wizard">
            {/* Step 1: Vehicle & Locations Form */}
            <div className="form-grid">
              <Field label="Vehicle" full>
                <select
                  name="vehicle"
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  value={selectedVehicleId}
                >
                  {data.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} · Current Battery: {v.current_battery_percentage}% ({v.battery_capacity} kWh)
                    </option>
                  ))}
                </select>
              </Field>

              {/* Source Input */}
              <Field label="Starting Point (Source)" full hint="Type a city/location name or click below to use GPS.">
                <div className="location-input-group">
                  <input
                    onChange={(e) => {
                      setSourceQuery(e.target.value);
                      setSelectedSource(null);
                      setRouteData(null);
                    }}
                    placeholder="Search starting city or address..."
                    value={sourceQuery}
                  />
                  <button
                    className="location-btn primary-button"
                    onClick={handleUseCurrentLocation}
                    type="button"
                    title="Use Current GPS Location"
                  >
                    <FaLocationArrow /> Current Location
                  </button>
                </div>

                {locationStatus === "DETECTING" && <small className="status-msg">Detecting your location...</small>}
                {locationStatus === "SELECTED" && <small className="status-msg success">Current location acquired ✓</small>}
                {locationStatus === "DENIED" && <small className="status-msg error">Location permission denied. Enter location manually.</small>}

                {searchingSource && <small className="status-msg">Searching places...</small>}
                {sourceResults.length > 0 && !selectedSource && (
                  <ul className="location-dropdown-list">
                    {sourceResults.map((res, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setSelectedSource({ name: res.display_name, lat: res.latitude, lng: res.longitude });
                          setSourceQuery(res.display_name);
                          setSourceResults([]);
                        }}
                      >
                        <strong>{res.short_name}</strong>
                        <small>{res.display_name}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              {/* Destination Input */}
              <Field label="Destination" full hint="Type a destination city or place name.">
                <div className="location-input-group">
                  <input
                    onChange={(e) => {
                      setDestQuery(e.target.value);
                      setSelectedDest(null);
                      setRouteData(null);
                    }}
                    placeholder="Search destination city or address..."
                    value={destQuery}
                  />
                </div>

                {searchingDest && <small className="status-msg">Searching places...</small>}
                {destResults.length > 0 && !selectedDest && (
                  <ul className="location-dropdown-list">
                    {destResults.map((res, idx) => (
                      <li
                        key={idx}
                        onClick={() => {
                          setSelectedDest({ name: res.display_name, lat: res.latitude, lng: res.longitude });
                          setDestQuery(res.display_name);
                          setDestResults([]);
                        }}
                      >
                        <strong>{res.short_name}</strong>
                        <small>{res.display_name}</small>
                      </li>
                    ))}
                  </ul>
                )}
              </Field>

              <div className="calc-route-action">
                <button
                  className="primary-button full-width"
                  disabled={!selectedSource || !selectedDest || calculatingRoute}
                  onClick={calculateRoute}
                  type="button"
                >
                  {calculatingRoute ? (
                    <>
                      <FaSpinner className="spinning" /> Calculating Road Route (OSRM)...
                    </>
                  ) : (
                    <>
                      <FaRoute /> Calculate Road Route & Battery Usage
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {routeError && (
              <div className="location-status-banner error" style={{ marginTop: "16px" }}>
                <p>{routeError}</p>
              </div>
            )}

            {/* Step 2: Route Results & Battery Analytics */}
            {routeData && batteryMetrics && (
              <div className="route-results-container" style={{ marginTop: "24px" }}>
                <div className="route-metrics-summary">
                  <div className="r-metric">
                    <span>Driving Distance</span>
                    <strong>{routeData.distance_km} km</strong>
                  </div>
                  <div className="r-metric">
                    <span>Driving Time</span>
                    <strong>{routeService.formatDuration(routeData.duration_minutes)}</strong>
                  </div>
                  <div className="r-metric">
                    <span>Estimated Energy</span>
                    <strong>{batteryMetrics.energyRequiredKwh} kWh</strong>
                  </div>
                  <div className="r-metric">
                    <span>Battery Required</span>
                    <strong>{batteryMetrics.batteryRequiredPercent}%</strong>
                  </div>
                </div>

                {/* Exceeding 100% Total Battery Capacity Warning */}
                {batteryMetrics.isExceedingTotalCapacity && (
                  <div className="location-status-banner error" style={{ marginTop: "16px" }}>
                    <FaExclamationTriangle />
                    <p>
                      <strong>Capacity Alert:</strong> This trip requires {batteryMetrics.batteryRequiredPercent}% of your vehicle's total battery capacity. Multiple charging stops will be mandatory.
                    </p>
                  </div>
                )}

                {/* Battery Recommendation Banner */}
                <div
                  className={`charging-recommendation-banner ${
                    batteryMetrics.isChargingRequired ? "warning" : "success"
                  }`}
                  style={{ marginTop: "16px" }}
                >
                  {batteryMetrics.isChargingRequired ? (
                    <>
                      <FaExclamationTriangle />
                      <div>
                        <strong>Charging Recommended:</strong> Current battery ({batteryMetrics.currentBattery}%) is lower than safe requirement ({batteryMetrics.safeRequiredPercent}%). Shortfall: {batteryMetrics.shortfallPercent}%.
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle />
                      <div>
                        <strong>Trip Feasible:</strong> Current battery ({batteryMetrics.currentBattery}%) is sufficient for this trip (safe requirement: {batteryMetrics.safeRequiredPercent}%).
                      </div>
                    </>
                  )}
                </div>

                {/* Station Suggestions (Near Destination) */}
                <div className="suggested-stations-wrapper" style={{ marginTop: "20px" }}>
                  <h4>Compatible Stations Near Destination</h4>
                  <small style={{ color: "var(--text-muted)", display: "block", marginBottom: "12px" }}>
                    Recommendations are provided by the backend ML engine based on route, vehicle, and battery data.
                  </small>
                  {recommendationsLoading ? (
                    <div className="location-status-banner info" style={{ marginBottom: "16px" }}>
                      <FaSpinner className="spinning" /> Fetching charging recommendations...
                    </div>
                  ) : recommendationsError ? (
                    <p className="no-stations-text">{recommendationsError}</p>
                  ) : recommendedStations.length === 0 ? (
                    <p className="no-stations-text">No recommended charging stations were found for this route.</p>
                  ) : (
                    <div className="suggested-stations-grid">
                      {recommendedStations.map((st) => {
                        const distToDest = isValidCoordinate(st.latitude, st.longitude)
                          ? calculateDistanceKm(selectedDest.lat, selectedDest.lng, st.latitude, st.longitude)
                          : null;
                        return (
                          <div
                            key={st.id}
                            className={`station-suggest-card ${
                              selectedStation?.id === st.id ? "selected" : ""
                            }`}
                            onClick={() => setSelectedStation(st)}
                          >
                            <strong>{st.station_name}</strong>
                            <p>{st.address}, {st.city}</p>
                            <div className="st-tags">
                              <span className="badge badge-success">Rating: {st.rating} ★</span>
                              <span className="badge badge-info">{distToDest !== null ? `${distToDest.toFixed(1)} km to dest` : "Distance unavailable"}</span>
                            </div>
                            <button
                              className="btn-select-stop select-button"
                              type="button"
                            >
                              {selectedStation?.id === st.id ? "Stop Selected ✓" : "Select as Stop"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Route Map Visualizer */}
                <div className="route-map-section" style={{ marginTop: "24px" }}>
                  <h4>Route Map & Polyline</h4>
                  <TripRouteMap
                    origin={selectedSource}
                    destination={selectedDest}
                    routeGeometry={routeData.geometry}
                    suggestedStations={recommendedStations}
                    selectedStationId={selectedStation?.id}
                    onSelectStation={(st) => setSelectedStation(st)}
                  />
                </div>

                {/* Final Save Action */}
                <div style={{ marginTop: "24px" }}>
                  <FormActions
                    loading={saving}
                    disabled={!selectedVehicle || !selectedSource || !selectedDest || !routeData || !batteryMetrics || batteryMetrics.invalidVehicle}
                    onCancel={() => setModalOpen(false)}
                    submitLabel={saving ? "Saving Trip Plan..." : "Save Trip Plan"}
                    onSubmit={handleSaveTrip}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

export default TripsPage;
