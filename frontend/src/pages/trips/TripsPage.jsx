import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBatteryHalf,
  FaCar,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPlus,
  FaRoad,
  FaRoute,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";

import { toast } from "react-toastify";

import LocationDropdown from "../../components/ui/LocationDropdown";
import TripRouteMap from "../../components/map/TripRouteMap";
import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import locationService, { GEOLOCATION_ERRORS } from "../../services/locationService";
import routeService from "../../services/routeService";
import { formatDate } from "../../utils/format";
import {
  calculateEvRangeMetrics,
  computeCumulativeRouteDistances,
  findPointAlongRouteAtDistance,
} from "../../utils/routePlanner";

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

  const { data, setData, loading, error, refresh } = useResource(loader);
  const navigate = useNavigate();

  // Authoritative Backend Plan State
  const [backendPlan, setBackendPlan] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Selected Saved Trip Details Modal
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);

  // Modal & Saving States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vehicle Selection State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const selectedVehicle = useMemo(() => {
    if (!data?.vehicles || !data.vehicles.length) return null;
    const found = data.vehicles.find((v) => Number(v.id) === Number(selectedVehicleId));
    return found || null;
  }, [data, selectedVehicleId]);

  useEffect(() => {
    if (data?.vehicles?.length && (!selectedVehicleId || !data.vehicles.some((v) => Number(v.id) === Number(selectedVehicleId)))) {
      setSelectedVehicleId(String(data.vehicles[0].id));
    }
  }, [data?.vehicles, selectedVehicleId]);

  const handleVehicleChange = (newId) => {
    setSelectedVehicleId(newId);
    setBackendPlan(null);
    setRouteError(null);
  };

  // Location States
  const [sourceQuery, setSourceQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState(null); // { name, lat, lng }
  const [locationStatus, setLocationStatus] = useState("IDLE");

  const [destQuery, setDestQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState(null); // { name, lat, lng }

  const openForm = () => {
    const firstVeh = data?.vehicles[0]?.id ? String(data.vehicles[0].id) : "";
    setSelectedVehicleId(firstVeh);
    setSourceQuery("");
    setSelectedSource(null);
    setLocationStatus("IDLE");
    setDestQuery("");
    setSelectedDest(null);
    setBackendPlan(null);
    setRouteError(null);
    setModalOpen(true);
  };

  // GPS Location Handler
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

  // EV Range Metrics for UI display
  const evMetrics = useMemo(() => {
    if (!selectedVehicle || !backendPlan) return null;
    return calculateEvRangeMetrics(
      selectedVehicle.battery_capacity,
      selectedVehicle.current_battery_percentage,
      selectedVehicle.efficiency
    );
  }, [selectedVehicle, backendPlan]);

  // Calculate Route via Backend Endpoint (POST /api/trips/plan/)
  const handleCalculateRoute = async () => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle.");
      return;
    }

    setCalculatingRoute(true);
    setRouteError(null);
    setBackendPlan(null);

    try {
      let srcLoc = selectedSource;
      let dstLoc = selectedDest;

      // Fallback auto-geocoding if location typed directly without picking from dropdown
      if (!srcLoc && sourceQuery.trim().length >= 3) {
        const srcRes = await locationService.geocodeAddress(sourceQuery);
        if (srcRes && srcRes.length > 0) {
          srcLoc = { name: srcRes[0].display_name, lat: srcRes[0].latitude, lng: srcRes[0].longitude };
          setSelectedSource(srcLoc);
        }
      }

      if (!dstLoc && destQuery.trim().length >= 3) {
        const dstRes = await locationService.geocodeAddress(destQuery);
        if (dstRes && dstRes.length > 0) {
          dstLoc = { name: dstRes[0].display_name, lat: dstRes[0].latitude, lng: dstRes[0].longitude };
          setSelectedDest(dstLoc);
        }
      }

      if (!srcLoc || !dstLoc) {
        toast.warn("Please enter or select valid source and destination locations.");
        setCalculatingRoute(false);
        return;
      }

      const payload = {
        vehicle: selectedVehicle.id,
        source: typeof srcLoc.name === "string" ? srcLoc.name.slice(0, 200) : "Source",
        destination: typeof dstLoc.name === "string" ? dstLoc.name.slice(0, 200) : "Destination",
        source_latitude: Number(srcLoc.lat),
        source_longitude: Number(srcLoc.lng),
        destination_latitude: Number(dstLoc.lat),
        destination_longitude: Number(dstLoc.lng),
        current_battery_percentage: Number(selectedVehicle.current_battery_percentage),
      };

      const planResult = await evService.trips.plan(payload);
      setBackendPlan(planResult);
      toast.success(`Authoritative road route calculated: ${planResult.total_distance_km} km`);
    } catch (err) {
      setBackendPlan(null);
      const responseData = err?.response?.data || {};
      const status = err?.response?.status;

      if (status === 422 && responseData.error_code) {
        setRouteError({
          error_code: responseData.error_code,
          message: responseData.message || "No feasible route could be calculated under vehicle constraints.",
          diagnostics: responseData.diagnostics || {},
        });
      } else {
        const errorMsg = getApiError(err, "Failed to calculate trip plan from backend.");
        setRouteError({
          error_code: "PLANNING_FAILED",
          message: errorMsg,
          diagnostics: {},
        });
      }
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Reserve Point Marker for Map Visualizer
  const reservePointInfo = useMemo(() => {
    if (!backendPlan || !evMetrics || evMetrics.invalid) return null;
    const coords = backendPlan.route_geometry?.coordinates || [];
    const cumulativeDistances = computeCumulativeRouteDistances(coords);
    const targetDist = Math.min(backendPlan.total_distance_km, evMetrics.safeRangeKm);
    const pt = findPointAlongRouteAtDistance(coords, cumulativeDistances, targetDist);
    if (!pt) return null;
    return {
      lat: pt.lat,
      lng: pt.lng,
      distanceKm: Number(targetDist.toFixed(1)),
    };
  }, [backendPlan, evMetrics]);

  // Save Backend Plan Snapshot (POST /api/trips/)
  const handleSaveTrip = async (event) => {
    event.preventDefault();
    if (saving || !backendPlan || !backendPlan.plan_id) return;

    setSaving(true);
    try {
      const result = await evService.trips.create({
        plan_id: backendPlan.plan_id,
      });

      const createdTrip = result.trip || result;
      if (createdTrip && createdTrip.id) {
        setData((prev) => {
          if (!prev) return prev;
          const existing = prev.trips || [];
          if (existing.some((t) => Number(t.id) === Number(createdTrip.id))) {
            return prev;
          }
          return {
            ...prev,
            trips: [createdTrip, ...existing],
          };
        });
      }

      toast.success(result.message || "Trip plan saved successfully.");
      setModalOpen(false);
      await refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save this trip plan."));
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
        eyebrow="Route & Range Analytics"
        title="EV Trip Planner"
        description="Calculate real OSRM road routes, exact battery consumption, and connector-compatible available charging stops."
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
            const vehicleId = typeof trip.vehicle === "object" ? trip.vehicle?.id : trip.vehicle;
            const vehicle = data.vehicles.find((v) => Number(v.id) === Number(vehicleId));
            const stationId = typeof trip.suggested_station === "object" ? trip.suggested_station?.id : trip.suggested_station;
            const station = data.stations.find((s) => Number(s.id) === Number(stationId));

            return (
              <article
                className="timeline-card"
                key={trip.id}
                onClick={() => setSelectedTripDetails(trip)}
                style={{ cursor: "pointer", transition: "transform 0.15s ease, box-shadow 0.15s ease" }}
              >
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
                    <span><FaRoad /><strong>{trip.distance_km} km</strong><small>Distance</small></span>
                    <span><FaRoute /><strong>{routeService.formatDuration(trip.estimated_time)}</strong><small>Drive Time</small></span>
                    <span><FaBatteryHalf /><strong>{trip.estimated_battery_needed}%</strong><small>Battery Needed</small></span>
                    <span><FaCar /><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : (vehicleId ? `Vehicle #${vehicleId}` : "Vehicle")}</strong><small>Vehicle</small></span>
                    <span><FaMapMarkerAlt /><strong>{trip.suggested_stations_json?.length ? `${trip.suggested_stations_json.length} Stops` : (station?.station_name || "Direct Route")}</strong><small>Stops</small></span>
                  </div>
                </div>
                <button
                  className="danger-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTrip(trip);
                  }}
                  type="button"
                  aria-label="Delete trip"
                >
                  <FaTrash />
                </button>
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
          description="Select your vehicle and locations to calculate OSRM driving routes, battery consumption, and charging stops."
          onClose={() => setModalOpen(false)}
          wide={true}
        >
          <div className="trip-planner-wizard">
            {/* Form inputs */}
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <Field label="Select Vehicle" full>
                <select
                  name="vehicle"
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  value={selectedVehicleId}
                >
                  {data.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} ({v.connector_type}) · Battery: {v.current_battery_percentage}% ({v.battery_capacity} kWh, {v.efficiency} km/kWh)
                    </option>
                  ))}
                </select>
              </Field>

              {/* Source Location */}
              <div className="source-location-wrapper">
                <LocationDropdown
                  label="Starting Point (Source)"
                  placeholder="Search starting city or place..."
                  value={sourceQuery}
                  onChange={(val) => {
                    setSourceQuery(val);
                    setSelectedSource(null);
                    setBackendPlan(null);
                    setRouteError(null);
                  }}
                  onSelectLocation={(loc) => {
                    setSelectedSource(loc);
                    setBackendPlan(null);
                    setRouteError(null);
                  }}
                  selectedLocation={selectedSource}
                  hint="Type at least 3 characters to view location suggestions."
                  locationStatus={locationStatus}
                  extraAction={
                    <button
                      className="location-btn"
                      onClick={handleUseCurrentLocation}
                      type="button"
                      title="Use Current GPS Location"
                      style={{ marginTop: "6px", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", padding: "4px 10px", borderRadius: "6px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer" }}
                    >
                      <FaLocationArrow /> Use GPS Location
                    </button>
                  }
                />
              </div>

              {/* Destination Location */}
              <div className="dest-location-wrapper">
                <LocationDropdown
                  label="Destination"
                  placeholder="Search destination city or place..."
                  value={destQuery}
                  onChange={(val) => {
                    setDestQuery(val);
                    setSelectedDest(null);
                    setBackendPlan(null);
                    setRouteError(null);
                  }}
                  onSelectLocation={(loc) => {
                    setSelectedDest(loc);
                    setBackendPlan(null);
                    setRouteError(null);
                  }}
                  selectedLocation={selectedDest}
                  hint="Type at least 3 characters to view location suggestions."
                />
              </div>

              <div className="calc-route-action" style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                <button
                  className="primary-button full-width"
                  disabled={!sourceQuery.trim() || !destQuery.trim() || calculatingRoute}
                  onClick={handleCalculateRoute}
                  type="button"
                >
                  {calculatingRoute ? (
                    <>
                      <FaSpinner className="spinning" /> Calculating Road Route (Backend OSRM)...
                    </>
                  ) : (
                    <>
                      <FaRoute /> Calculate Backend Road Route & Plan
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* HTTP 422 / Structured Error Message Banner */}
            {routeError && (
              <div
                className="location-status-banner error"
                style={{
                  marginTop: "20px",
                  padding: "16px",
                  borderRadius: "10px",
                  background: "#fef2f2",
                  color: "#991b1b",
                  border: "1.5px solid #fecaca",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                  <FaExclamationTriangle style={{ fontSize: "1.2rem", color: "#dc2626" }} />
                  <strong style={{ fontSize: "1rem" }}>{routeError.error_code}</strong>
                </div>
                <p style={{ margin: "0 0 8px", fontSize: "0.9rem", color: "#7f1d1d" }}>{routeError.message}</p>
                {routeError.diagnostics && Object.keys(routeError.diagnostics).length > 0 && (
                  <div style={{ background: "#ffffff", padding: "8px 12px", borderRadius: "6px", fontSize: "0.8rem", color: "#475569", border: "1px solid #fca5a5" }}>
                    <strong>Diagnostics:</strong>
                    <ul style={{ margin: "4px 0 0", paddingLeft: "18px" }}>
                      {Object.entries(routeError.diagnostics).map(([k, v]) => (
                        <li key={k}>
                          <code>{k}</code>: {String(v)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Successful Authoritative Plan Output */}
            {backendPlan && (
              <div className="route-results-container" style={{ marginTop: "24px" }}>
                {/* Metrics Summary Grid */}
                <div className="route-metrics-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Road Distance</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{backendPlan.total_distance_km} km</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Driving Duration</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{routeService.formatDuration(backendPlan.total_driving_minutes)}</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Total Journey Duration</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{routeService.formatDuration(backendPlan.total_duration_minutes)}</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Est. Destination Battery</span>
                    <strong style={{ fontSize: "1.1rem", color: backendPlan.estimated_destination_battery_percentage < 20 ? "#dc2626" : "#16a34a" }}>
                      {backendPlan.estimated_destination_battery_percentage}%
                    </strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Charging Duration</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{backendPlan.total_charging_minutes} mins</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Total Estimated Cost</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>₹{backendPlan.total_estimated_cost}</strong>
                  </div>
                </div>

                {/* Recommendation Banner */}
                <div
                  className={`charging-recommendation-banner ${backendPlan.charging_required ? "warning" : "success"}`}
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    background: backendPlan.charging_required ? "#fff7ed" : "#f0fdf4",
                    border: `1px solid ${backendPlan.charging_required ? "#ffedd5" : "#bbf7d0"}`,
                  }}
                >
                  {backendPlan.charging_required ? (
                    <>
                      <FaExclamationTriangle style={{ fontSize: "1.4rem", color: "#d97706", flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: "block", color: "#92400e" }}>
                          {backendPlan.stops.length} Charging Stop(s) Planned:
                        </strong>
                        <span style={{ fontSize: "0.85rem", color: "#78350f" }}>
                          To keep battery above reserve, the backend algorithm selected {backendPlan.stops.length} compatible and available charging stop(s).
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle style={{ fontSize: "1.4rem", color: "#16a34a", flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: "block", color: "#166534" }}>Direct Trip Feasible:</strong>
                        <span style={{ fontSize: "0.85rem", color: "#14532d" }}>
                          No charging stops required; your battery will arrive at {backendPlan.estimated_destination_battery_percentage}% ($\ge 20\%$).
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Itinerary Timeline */}
                <div className="suggested-stations-wrapper" style={{ marginTop: "24px" }}>
                  <h4 style={{ color: "var(--text-primary)" }}>Backend Authoritative Itinerary</h4>
                  <div className="itinerary-timeline" style={{ position: "relative", paddingLeft: "24px", marginTop: "16px", borderLeft: "2px dashed var(--border-color, #475569)" }}>
                    {/* Departure */}
                    <div style={{ marginBottom: "24px", position: "relative" }}>
                      <span style={{ position: "absolute", left: "-30px", top: "4px", background: "#22c55e", width: "12px", height: "12px", borderRadius: "50%" }} />
                      <strong style={{ color: "var(--text-primary)" }}>Departure: {backendPlan.origin.name}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Starting Battery: {backendPlan.vehicle.current_battery_percentage}% ({backendPlan.vehicle.brand} {backendPlan.vehicle.model}, {backendPlan.vehicle.connector_type})
                      </p>
                    </div>

                    {/* Intermediate Stops */}
                    {backendPlan.stops.map((stop) => (
                      <div key={stop.stop_number} style={{ marginBottom: "24px", position: "relative" }}>
                        <span style={{ position: "absolute", left: "-31px", top: "4px", background: "#f59e0b", width: "14px", height: "14px", borderRadius: "50%" }} />
                        <strong style={{ color: "#d97706" }}>Stop #{stop.stop_number}: {stop.station.station_name}</strong>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: "4px 0", background: "rgba(255, 255, 255, 0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                          📍 {stop.station.address}, {stop.station.city}<br />
                          🔌 Charger: <strong>{stop.charger.charger_name}</strong> ({stop.charger.connector_type}, {stop.charger.power_output_kw} kW)<br />
                          🛣️ Leg Distance: <strong>{stop.leg_distance_km} km</strong> ({stop.leg_driving_minutes} mins driving)<br />
                          🔋 Arrival Battery: <strong>{stop.arrival_battery_percentage}%</strong><br />
                          ⚡ Charge Action: <strong>{stop.arrival_battery_percentage}% ➜ {stop.target_battery_percentage}%</strong> (+{stop.energy_added_kwh} kWh)<br />
                          ⏱️ Charging Time: <strong>{stop.charging_minutes} mins</strong>
                          {stop.wait_minutes > 0 && <span style={{ color: "#ef4444" }}> (Queue Wait: {stop.wait_minutes} mins)</span>}<br />
                          💰 Est. Cost: <strong>₹{stop.estimated_cost}</strong>
                        </div>
                      </div>
                    ))}

                    {/* Destination */}
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "-30px", top: "4px", background: "#2563eb", width: "12px", height: "12px", borderRadius: "50%" }} />
                      <strong style={{ color: "var(--text-primary)" }}>Destination: {backendPlan.destination.name}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Total Distance: {backendPlan.total_distance_km} km · Arrival Battery: <strong style={{ color: backendPlan.estimated_destination_battery_percentage < 20 ? "#ef4444" : "#22c55e" }}>{backendPlan.estimated_destination_battery_percentage}%</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "14px", display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}>
                  <FaInfoCircle style={{ color: "#3b82f6", flexShrink: 0 }} />
                  <span>All distances, geometry, times, and battery values are calculated authoritatively by OSRM and backend models.</span>
                </div>

                {/* Map */}
                <div className="route-map-section" style={{ marginTop: "24px" }}>
                  <h4 style={{ margin: "0 0 12px" }}>Authoritative OSRM Route Map</h4>
                  <TripRouteMap
                    origin={selectedSource}
                    destination={selectedDest}
                    routeGeometry={backendPlan.route_geometry}
                    reservePoint={reservePointInfo}
                    stops={backendPlan.stops.map((s) => ({
                      ...s.station,
                      station_id: s.station.id,
                      distance_from_previous_km: s.leg_distance_km,
                      arrival_battery_percentage: s.arrival_battery_percentage,
                      estimated_charging_time_minutes: s.charging_minutes,
                      wait_time_minutes: s.wait_minutes,
                      estimated_cost: s.estimated_cost,
                    }))}
                  />
                </div>

                {/* Form Actions */}
                <div style={{ marginTop: "24px" }}>
                  <FormActions
                    loading={saving}
                    onCancel={() => setModalOpen(false)}
                    submitLabel={saving ? "Saving Authoritative Plan..." : "Save Trip Plan"}
                    onSubmit={handleSaveTrip}
                  />
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Saved Trip Details Modal */}
      {selectedTripDetails && (
        <Modal
          title="Saved Trip Details"
          description={`${selectedTripDetails.source} ➜ ${selectedTripDetails.destination}`}
          onClose={() => setSelectedTripDetails(null)}
          wide={true}
        >
          <div className="saved-trip-modal-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
            <div className="trip-itinerary-panel">
              <h3 style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "8px", color: "var(--text-primary)" }}>Trip Itinerary</h3>
              <div className="itinerary-timeline" style={{ position: "relative", paddingLeft: "24px", marginTop: "20px", borderLeft: "2px dashed var(--border-color, #475569)" }}>
                <div style={{ marginBottom: "24px", position: "relative" }}>
                  <span style={{ position: "absolute", left: "-30px", top: "4px", background: "#22c55e", width: "12px", height: "12px", borderRadius: "50%" }} />
                  <strong style={{ color: "var(--text-primary)" }}>Departure: {selectedTripDetails.source}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Starting Battery: {selectedTripDetails.current_battery_percentage}%
                  </p>
                </div>

                {(selectedTripDetails.suggested_stations_json || []).map((stop, idx) => (
                  <div key={idx} style={{ marginBottom: "24px", position: "relative" }}>
                    <span style={{ position: "absolute", left: "-31px", top: "4px", background: "#f59e0b", width: "14px", height: "14px", borderRadius: "50%" }} />
                    <strong style={{ color: "#d97706" }}>Stop #{idx + 1}: {stop.station?.station_name || stop.station_name}</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-primary)", margin: "4px 0", background: "rgba(255, 255, 255, 0.02)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                      📍 {stop.station?.address || stop.address}, {stop.station?.city || stop.city}<br />
                      🛣️ Leg Distance: <strong>{stop.leg_distance_km || stop.distance_from_previous_km} km</strong><br />
                      🔋 Arrival Battery: <strong>{stop.arrival_battery_percentage}%</strong><br />
                      ⚡ Action: Charge to <strong>{stop.target_battery_percentage || 100}%</strong><br />
                      ⏱️ Charging Time: <strong>{stop.charging_minutes || stop.estimated_charging_time_minutes} mins</strong>
                      {(stop.wait_minutes || stop.wait_time_minutes) > 0 && <span> (Wait: {stop.wait_minutes || stop.wait_time_minutes} mins)</span>}<br />
                      💰 Est. Cost: <strong>₹{stop.estimated_cost}</strong>
                    </div>
                    <button
                      className="primary-button btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        const stId = stop.station?.id || stop.station_id;
                        const vehId = selectedTripDetails.vehicle?.id || selectedTripDetails.vehicle;
                        navigate(`/bookings?station=${stId}&vehicle=${vehId}`);
                      }}
                      style={{ marginTop: "4px", padding: "4px 10px", fontSize: "0.75rem" }}
                      type="button"
                    >
                      Book Slot Now
                    </button>
                  </div>
                ))}

                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "-30px", top: "4px", background: "#2563eb", width: "12px", height: "12px", borderRadius: "50%" }} />
                  <strong style={{ color: "var(--text-primary)" }}>Destination: {selectedTripDetails.destination}</strong>
                  <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    Total Distance: {selectedTripDetails.distance_km} km · Est. Destination Battery: {selectedTripDetails.estimated_destination_battery || 0}%
                  </p>
                </div>
              </div>
            </div>

            <div className="trip-map-panel">
              <h3 style={{ borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "8px", marginBottom: "16px", color: "var(--text-primary)" }}>Route Map</h3>
              <TripRouteMap
                origin={{
                  lat: Number(selectedTripDetails.source_latitude),
                  lng: Number(selectedTripDetails.source_longitude),
                  name: selectedTripDetails.source,
                }}
                destination={{
                  lat: Number(selectedTripDetails.destination_latitude),
                  lng: Number(selectedTripDetails.destination_longitude),
                  name: selectedTripDetails.destination,
                }}
                routeGeometry={selectedTripDetails.route_geometry}
                stops={(selectedTripDetails.suggested_stations_json || []).map((s) => ({
                  ...(s.station || s),
                  station_id: s.station?.id || s.station_id,
                  distance_from_previous_km: s.leg_distance_km || s.distance_from_previous_km,
                  arrival_battery_percentage: s.arrival_battery_percentage,
                  estimated_charging_time_minutes: s.charging_minutes || s.estimated_charging_time_minutes,
                  wait_time_minutes: s.wait_minutes || s.wait_time_minutes,
                  estimated_cost: s.estimated_cost,
                }))}
              />
            </div>
          </div>

          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
            <button className="secondary-button" onClick={() => setSelectedTripDetails(null)} type="button">Close Details</button>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default TripsPage;
