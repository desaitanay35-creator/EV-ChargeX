import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { calculateDistanceKm, isValidCoordinate } from "../../utils/geo";
import {
  calculateEvRangeMetrics,
  calculateStationRouteProximity,
  computeCumulativeRouteDistances,
  CRITICAL_BATTERY_MINIMUM,
  filterAndRankStationsAlongRoute,
  findPointAlongRouteAtDistance,
  MAX_STOPS_LIMIT,
  PREFERRED_CORRIDOR_KM,
  RESERVE_BATTERY_DEFAULT,
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

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Vehicle Selection (Explicit Synchronization)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const selectedVehicle = useMemo(() => {
    if (!data?.vehicles || !data.vehicles.length) return null;
    const found = data.vehicles.find((v) => Number(v.id) === Number(selectedVehicleId));
    return found || null;
  }, [data, selectedVehicleId]);

  // Synchronize initial vehicle ID when vehicles load
  useEffect(() => {
    if (data?.vehicles?.length && (!selectedVehicleId || !data.vehicles.some(v => Number(v.id) === Number(selectedVehicleId)))) {
      setSelectedVehicleId(String(data.vehicles[0].id));
    }
  }, [data?.vehicles, selectedVehicleId]);

  // Handle selected vehicle change: invalidate existing route analysis to prevent stale results
  const handleVehicleChange = (newId) => {
    setSelectedVehicleId(newId);
    setRouteData(null);
    setCandidateStations([]);
    setSelectedStation(null);
    setAdditionalStops([]);
    setDetourGeometry(null);
    setRouteError(null);
  };

  // Source & Destination Location States
  const [sourceQuery, setSourceQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState(null); // { name, lat, lng }
  const [locationStatus, setLocationStatus] = useState("IDLE");

  const [destQuery, setDestQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState(null); // { name, lat, lng }

  // Calculated OSRM Route State
  const [routeData, setRouteData] = useState(null); // { distance_km, duration_minutes, geometry }
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);

  // Advanced Route & Station Planning States
  const [candidateStations, setCandidateStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [additionalStops, setAdditionalStops] = useState([]);
  const [detourGeometry, setDetourGeometry] = useState(null);
  const [filterDiagnostics, setFilterDiagnostics] = useState(null);
  const [emptyStateReason, setEmptyStateReason] = useState(null);

  const openForm = () => {
    const firstVeh = data?.vehicles[0]?.id ? String(data.vehicles[0].id) : "";
    setSelectedVehicleId(firstVeh);
    setSourceQuery("");
    setSelectedSource(null);
    setLocationStatus("IDLE");
    setDestQuery("");
    setSelectedDest(null);
    setRouteData(null);
    setRouteError(null);
    setCandidateStations([]);
    setSelectedStation(null);
    setAdditionalStops([]);
    setDetourGeometry(null);
    setFilterDiagnostics(null);
    setEmptyStateReason(null);
    setModalOpen(true);
  };

  // 1. Current Location GPS Handler
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

  // 2. EV Range & Battery Metrics Formula Execution
  const evMetrics = useMemo(() => {
    if (!selectedVehicle || !routeData) return null;

    const capacityKwh = Number(selectedVehicle.battery_capacity) || 0;
    const currentBattery = Number(selectedVehicle.current_battery_percentage) || 0;
    const efficiency = Number(selectedVehicle.efficiency) || 0; // km/kWh
    const distanceKm = routeData.distance_km;

    if (capacityKwh <= 0 || efficiency <= 0) {
      return { invalid: true };
    }

    const isUnrealisticEfficiency = efficiency < 1.0 || efficiency > 12.0;
    const directEnergyRequiredKwh = distanceKm / efficiency;
    const directBatteryNeededPercent = (directEnergyRequiredKwh / capacityKwh) * 100;
    const estimatedDestinationBattery = currentBattery - directBatteryNeededPercent;
    const isChargingRequired = estimatedDestinationBattery < RESERVE_BATTERY_DEFAULT; // Destination battery < 20% reserve

    const range = calculateEvRangeMetrics(capacityKwh, currentBattery, efficiency, RESERVE_BATTERY_DEFAULT);

    return {
      invalid: false,
      capacityKwh,
      currentBattery,
      efficiency,
      isUnrealisticEfficiency,
      usableEnergyKwh: range.usableEnergyKwh,
      estimatedTotalRangeKm: range.estimatedTotalRangeKm,
      safeRangeKm: range.safeRangeKm,
      directEnergyRequiredKwh: Number(directEnergyRequiredKwh.toFixed(2)),
      directBatteryNeededPercent: Number(directBatteryNeededPercent.toFixed(1)),
      estimatedDestinationBattery: Number(estimatedDestinationBattery.toFixed(1)),
      isChargingRequired,
    };
  }, [selectedVehicle, routeData]);

  // 3. OSRM Road Route Calculation & Station Candidate Shortlisting
  const handleCalculateRoute = async () => {
    if (!selectedSource || !selectedDest) {
      toast.warn("Please select valid source and destination locations from the suggestions list.");
      return;
    }

    if (!selectedVehicle) {
      toast.error("Please select a valid vehicle.");
      return;
    }

    setCalculatingRoute(true);
    setRouteError(null);
    setCandidateStations([]);
    setSelectedStation(null);
    setAdditionalStops([]);
    setDetourGeometry(null);
    setFilterDiagnostics(null);
    setEmptyStateReason(null);

    try {
      // Query OSRM for direct driving route
      const routeRes = await routeService.getDrivingRoute({
        originLatitude: selectedSource.lat,
        originLongitude: selectedSource.lng,
        destinationLatitude: selectedDest.lat,
        destinationLongitude: selectedDest.lng,
      });

      setRouteData(routeRes);

      const coords = routeRes.geometry.coordinates; // [[lng, lat], ...]
      const cumulativeDistances = computeCumulativeRouteDistances(coords);
      const totalRouteDistance = routeRes.distance_km;

      const range = calculateEvRangeMetrics(
        selectedVehicle.battery_capacity,
        selectedVehicle.current_battery_percentage,
        selectedVehicle.efficiency
      );

      const targetReserveDist = Math.min(totalRouteDistance, range.safeRangeKm);

      // Filter and rank stations along route corridor
      const { shortlisted, diagnostics, emptyReason } = filterAndRankStationsAlongRoute({
        stations: data?.stations || [],
        routeCoordinates: coords,
        cumulativeDistances,
        startProgressKm: 0,
        targetReserveProgressKm: targetReserveDist,
        vehicleConnectorType: selectedVehicle.connector_type,
        currentBatteryPercent: Number(selectedVehicle.current_battery_percentage),
        batteryCapacityKwh: Number(selectedVehicle.battery_capacity),
        efficiencyKmPerKwh: Number(selectedVehicle.efficiency),
      });

      setFilterDiagnostics(diagnostics);
      setEmptyStateReason(emptyReason);

      if (shortlisted.length > 0) {
        // Refine top candidate station arrival battery using actual OSRM road distance
        const refinedCandidates = await Promise.all(
          shortlisted.map(async (st) => {
            try {
              const stationRoute = await routeService.getDrivingRoute({
                originLatitude: selectedSource.lat,
                originLongitude: selectedSource.lng,
                destinationLatitude: Number(st.latitude),
                destinationLongitude: Number(st.longitude),
              });
              const roadDist = stationRoute.distance_km;
              const energyUsed = roadDist / Number(selectedVehicle.efficiency);
              const batUsed = (energyUsed / Number(selectedVehicle.battery_capacity)) * 100;
              const arrBat = Math.max(0, Number(selectedVehicle.current_battery_percentage) - batUsed);
              return {
                ...st,
                roadDistanceToStationKm: Number(roadDist.toFixed(1)),
                estimatedArrivalBattery: Number(arrBat.toFixed(1)),
              };
            } catch (err) {
              return st;
            }
          })
        );

        setCandidateStations(refinedCandidates);
        const bestStop = refinedCandidates[0];
        setSelectedStation(bestStop);

        // Fetch OSRM detour geometry for top candidate
        fetchDetourForStation(bestStop, selectedSource, selectedDest, totalRouteDistance);
      }

      toast.success(`Road route calculated: ${routeRes.distance_km} km`);
    } catch (err) {
      setRouteData(null);
      setRouteError(err.message || "Failed to calculate road route.");
      toast.error(err.message || "Route calculation failed.");
    } finally {
      setCalculatingRoute(false);
    }
  };

  // 4. Fetch Real OSRM Detour Route for Selected Station
  const fetchDetourForStation = async (station, origin, destination, directDistance) => {
    if (!station || !origin || !destination) return;

    try {
      const waypoints = [
        { lat: origin.lat, lng: origin.lng },
        { lat: Number(station.latitude), lng: Number(station.longitude) },
        { lat: destination.lat, lng: destination.lng },
      ];

      const detourRes = await routeService.getMultiStopDrivingRoute(waypoints);
      if (detourRes) {
        const detourKm = Math.max(0, Number((detourRes.distance_km - directDistance).toFixed(1)));
        setDetourGeometry(detourRes.geometry);

        setCandidateStations((prev) =>
          prev.map((s) => (s.id === station.id ? { ...s, detourKm } : s))
        );
        setSelectedStation((prev) => (prev && prev.id === station.id ? { ...prev, detourKm } : prev));
      }
    } catch (err) {
      console.warn("Detour calculation failed for station:", station.id, err);
    }
  };

  const handleSelectStationStop = (station) => {
    setSelectedStation(station);
    if (routeData && selectedSource && selectedDest) {
      fetchDetourForStation(station, selectedSource, selectedDest, routeData.distance_km);
    }
  };

  // 5. Reserve Point for Map Visualizer
  const reservePointInfo = useMemo(() => {
    if (!routeData || !evMetrics) return null;
    const coords = routeData.geometry.coordinates;
    const cumulativeDistances = computeCumulativeRouteDistances(coords);
    const targetDist = Math.min(routeData.distance_km, evMetrics.safeRangeKm);
    const pt = findPointAlongRouteAtDistance(coords, cumulativeDistances, targetDist);
    if (!pt) return null;
    return {
      lat: pt.lat,
      lng: pt.lng,
      distanceKm: Number(targetDist.toFixed(1)),
    };
  }, [routeData, evMetrics]);

  // 6. Helper for Specific Empty State Message
  const getEmptyStateDescription = (reason) => {
    switch (reason) {
      case "NO_STATIONS_LOADED":
        return "Station data could not be loaded.";
      case "NO_COMPATIBLE_CHARGERS":
        return `No stations with a compatible connector (${selectedVehicle?.connector_type}) were found.`;
      case "NO_AVAILABLE_CHARGERS":
        return `Compatible (${selectedVehicle?.connector_type}) stations exist, but no chargers are currently available.`;
      case "NO_CORRIDOR_MATCHES":
        return "No compatible available stations were found within 10 km of this route.";
      case "NO_REACHABLE_STATIONS":
        return "No compatible station can be reached before the critical battery threshold (10%).";
      default:
        return "No reachable compatible charging stations were found along this route corridor.";
    }
  };

  // 7. Save Trip Request & Immediate Refresh Logic
  const handleSaveTrip = async (event) => {
    event.preventDefault();
    if (saving || !routeData || !selectedSource || !selectedDest || !selectedVehicle) return;

    setSaving(true);
    try {
      const payload = {
        vehicle: selectedVehicle.id,
        source: typeof selectedSource.name === "string" ? selectedSource.name.slice(0, 200) : "Source",
        destination: typeof selectedDest.name === "string" ? selectedDest.name.slice(0, 200) : "Destination",
        source_latitude: Number(selectedSource.lat.toFixed(7)),
        source_longitude: Number(selectedSource.lng.toFixed(7)),
        destination_latitude: Number(selectedDest.lat.toFixed(7)),
        destination_longitude: Number(selectedDest.lng.toFixed(7)),
        distance_km: Number(routeData.distance_km.toFixed(2)),
        estimated_time: routeData.duration_minutes,
        estimated_battery_needed: Number(evMetrics.directBatteryNeededPercent.toFixed(2)),
        suggested_station: selectedStation ? selectedStation.id : null,
      };

      const result = await evService.trips.create(payload);
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

      toast.success(result.message || "Trip planned and saved successfully.");
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
        description="Calculate real road driving routes, estimate exact battery consumption, and discover compatible charging stations along your route."
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
                    <span><FaRoad /><strong>{trip.distance_km} km</strong><small>Distance</small></span>
                    <span><FaRoute /><strong>{routeService.formatDuration(trip.estimated_time)}</strong><small>Est. Drive Time</small></span>
                    <span><FaBatteryHalf /><strong>{trip.estimated_battery_needed}%</strong><small>Battery Needed</small></span>
                    <span><FaCar /><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : (vehicleId ? `Vehicle #${vehicleId}` : "Vehicle")}</strong><small>Vehicle</small></span>
                    <span><FaMapMarkerAlt /><strong>{station?.station_name || (stationId ? `Station #${stationId}` : "No stop required")}</strong><small>Stop</small></span>
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
          description="Select your vehicle and locations to calculate OSRM driving routes, battery consumption, and charging stops."
          onClose={() => setModalOpen(false)}
          wide={true}
        >
          <div className="trip-planner-wizard">
            {/* Step 1: Vehicle & Locations Form */}
            <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
              <Field label="Select Vehicle" full>
                <select
                  name="vehicle"
                  onChange={(e) => handleVehicleChange(e.target.value)}
                  value={selectedVehicleId}
                >
                  {data.vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brand} {v.model} · Battery: {v.current_battery_percentage}% ({v.battery_capacity} kWh, {v.efficiency} km/kWh)
                    </option>
                  ))}
                </select>
              </Field>

              {/* Source Dropdown Input */}
              <div className="source-location-wrapper">
                <LocationDropdown
                  label="Starting Point (Source)"
                  placeholder="Search starting city or place..."
                  value={sourceQuery}
                  onChange={setSourceQuery}
                  onSelectLocation={(loc) => {
                    setSelectedSource(loc);
                    setRouteData(null);
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

              {/* Destination Dropdown Input */}
              <div className="dest-location-wrapper">
                <LocationDropdown
                  label="Destination"
                  placeholder="Search destination city or place..."
                  value={destQuery}
                  onChange={setDestQuery}
                  onSelectLocation={(loc) => {
                    setSelectedDest(loc);
                    setRouteData(null);
                  }}
                  selectedLocation={selectedDest}
                  hint="Type at least 3 characters to view location suggestions."
                />
              </div>

              <div className="calc-route-action" style={{ gridColumn: "1 / -1", marginTop: "8px" }}>
                <button
                  className="primary-button full-width"
                  disabled={!selectedSource || !selectedDest || calculatingRoute}
                  onClick={handleCalculateRoute}
                  type="button"
                >
                  {calculatingRoute ? (
                    <>
                      <FaSpinner className="spinning" /> Calculating Road Route (OSRM)...
                    </>
                  ) : (
                    <>
                      <FaRoute /> Calculate Road Route & Range
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message Banner */}
            {routeError && (
              <div className="location-status-banner error" style={{ marginTop: "16px", padding: "12px", borderRadius: "8px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>
                <p>{routeError}</p>
              </div>
            )}

            {/* Step 2: Route Results, Range Analytics & Charging Recommendations */}
            {routeData && evMetrics && !evMetrics.invalid && (
              <div className="route-results-container" style={{ marginTop: "24px" }}>
                {/* Unrealistic Efficiency Warning Banner */}
                {evMetrics.isUnrealisticEfficiency && (
                  <div
                    className="location-status-banner warning"
                    style={{ marginBottom: "16px", padding: "12px 16px", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e", display: "flex", gap: "10px", alignItems: "center" }}
                  >
                    <FaExclamationTriangle style={{ fontSize: "1.2rem", flexShrink: 0 }} />
                    <span style={{ fontSize: "0.85rem" }}>
                      The vehicle efficiency value ({evMetrics.efficiency} km/kWh) appears unusually high. Trip battery estimates may be inaccurate. Recommended realistic efficiency range is 1.0 to 12.0 km/kWh.
                    </span>
                  </div>
                )}

                {/* Metrics Summary Grid */}
                <div className="route-metrics-summary" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px" }}>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Road Distance</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{routeData.distance_km} km</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Driving Time</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{routeService.formatDuration(routeData.duration_minutes)}</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Current Battery</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{evMetrics.currentBattery}%</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Est. Battery Used</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{evMetrics.directBatteryNeededPercent}%</strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Est. Destination Battery</span>
                    <strong style={{ fontSize: "1.1rem", color: evMetrics.estimatedDestinationBattery < 20 ? "#dc2626" : "#16a34a" }}>
                      {evMetrics.estimatedDestinationBattery}%
                    </strong>
                  </div>
                  <div className="r-metric" style={{ background: "var(--surface-light, #f8fafc)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                    <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>Energy Consumed</span>
                    <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>{evMetrics.directEnergyRequiredKwh} kWh</strong>
                  </div>
                </div>

                {/* Recommendation Category Banner */}
                <div
                  className={`charging-recommendation-banner ${
                    evMetrics.isChargingRequired ? "warning" : "success"
                  }`}
                  style={{
                    marginTop: "16px",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    background: evMetrics.isChargingRequired ? "#fff7ed" : "#f0fdf4",
                    border: `1px solid ${evMetrics.isChargingRequired ? "#ffedd5" : "#bbf7d0"}`,
                  }}
                >
                  {evMetrics.isChargingRequired ? (
                    <>
                      <FaExclamationTriangle style={{ fontSize: "1.4rem", color: "#d97706", flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: "block", color: "#92400e" }}>Recommended Charging Stop:</strong>
                        <span style={{ fontSize: "0.85rem", color: "#78350f" }}>
                          Estimated destination battery ({evMetrics.estimatedDestinationBattery}%) falls below the 20% reserve threshold. A charging stop is recommended along your route.
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <FaCheckCircle style={{ fontSize: "1.4rem", color: "#16a34a", flexShrink: 0 }} />
                      <div>
                        <strong style={{ display: "block", color: "#166534" }}>Trip Feasible Without Mid-Route Charging:</strong>
                        <span style={{ fontSize: "0.85rem", color: "#14532d" }}>
                          Charging is not required for this trip, but these compatible stations are available along your route for backup or emergency charging.
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Stations Along the Route Section */}
                <div className="suggested-stations-wrapper" style={{ marginTop: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h4>
                      {evMetrics.isChargingRequired
                        ? "Recommended Charging Stops"
                        : "Optional Stations Along Route (Backup / Emergency)"}
                    </h4>
                    <span className="badge badge-info" style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#e0f2fe", color: "#0369a1", borderRadius: "4px" }}>
                      Corridor: 5–10 km
                    </span>
                  </div>
                  <small style={{ color: "#64748b", display: "block", marginBottom: "12px" }}>
                    Filtered by vehicle connector ({selectedVehicle?.connector_type}), charger availability, route corridor, and critical arrival battery threshold (&gt;10%).
                  </small>

                  {candidateStations.length === 0 ? (
                    <div className="location-status-banner warning" style={{ marginTop: "8px", padding: "12px", borderRadius: "8px", background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }}>
                      <p>{getEmptyStateDescription(emptyStateReason)}</p>
                    </div>
                  ) : (
                    <div className="suggested-stations-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                      {candidateStations.map((st) => {
                        const isSelected = selectedStation?.id === st.id;
                        return (
                          <div
                            key={st.id}
                            className={`station-suggest-card ${isSelected ? "selected" : ""}`}
                            onClick={() => handleSelectStationStop(st)}
                            style={{
                              border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0",
                              borderRadius: "10px",
                              padding: "14px",
                              background: isSelected ? "#eff6ff" : "#ffffff",
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                              <div>
                                <strong style={{ fontSize: "0.95rem", color: "#0f172a", display: "block" }}>
                                  {st.station_name}
                                </strong>
                                <small style={{ color: "#64748b", fontSize: "0.8rem" }}>
                                  {st.address}, {st.city}
                                </small>
                              </div>
                              <span className="badge badge-success" style={{ fontSize: "0.75rem", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>
                                {st.rating} ★
                              </span>
                            </div>

                            <div className="st-metrics-tags" style={{ marginTop: "10px", display: "flex", flexWrap: "wrap", gap: "6px", fontSize: "0.75rem" }}>
                              <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#334155" }}>
                                🔋 Est. Arrival Battery: <strong>{st.estimatedArrivalBattery}%</strong>
                              </span>
                              <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#334155" }}>
                                📍 Route Distance: <strong>{st.roadDistanceToStationKm ?? st.routeProgressKm} km</strong>
                              </span>
                              <span style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", color: "#334155" }}>
                                🛣️ Corridor Offset: <strong>{st.routeProximityKm} km</strong>
                              </span>
                              {st.detourKm !== undefined && (
                                <span style={{ background: "#fef3c7", padding: "3px 8px", borderRadius: "4px", color: "#92400e" }}>
                                  🔄 Est. Detour: <strong>{st.detourKm} km</strong>
                                </span>
                              )}
                              <span style={{ background: "#e0f2fe", padding: "3px 8px", borderRadius: "4px", color: "#0369a1" }}>
                                ⚡ {st.availableChargersCount} Available ({st.maxPowerKw} kW)
                              </span>
                            </div>

                            <button
                              className="btn-select-stop"
                              type="button"
                              style={{
                                marginTop: "12px",
                                width: "100%",
                                padding: "8px",
                                borderRadius: "6px",
                                border: "none",
                                background: isSelected ? "#2563eb" : "#f1f5f9",
                                color: isSelected ? "#ffffff" : "#334155",
                                fontWeight: "600",
                                cursor: "pointer",
                              }}
                            >
                              {isSelected ? "Charging Stop Selected ✓" : "Select as Charging Stop"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Disclaimer Info */}
                <div style={{ marginTop: "14px", display: "flex", gap: "8px", alignItems: "center", fontSize: "0.78rem", color: "#64748b" }}>
                  <FaInfoCircle style={{ color: "#3b82f6", flexShrink: 0 }} />
                  <span>Charger availability is real-time and will be verified during booking.</span>
                </div>

                {/* Route Map & Visual Polyline */}
                <div className="route-map-section" style={{ marginTop: "24px" }}>
                  <h4 style={{ margin: "0 0 12px" }}>Route Map & Geometry</h4>
                  <TripRouteMap
                    origin={selectedSource}
                    destination={selectedDest}
                    routeGeometry={routeData.geometry}
                    detourGeometry={detourGeometry}
                    reservePoint={reservePointInfo}
                    candidateStations={candidateStations}
                    selectedStationId={selectedStation?.id}
                    onSelectStation={handleSelectStationStop}
                  />
                </div>

                {/* Trip Plan Summary Section (High Contrast, Robust Render) */}
                <div
                  className="trip-plan-summary-box"
                  style={{
                    marginTop: "24px",
                    background: "var(--surface-light, #1e293b)",
                    color: "var(--text-primary, #f8fafc)",
                    padding: "16px",
                    borderRadius: "10px",
                    border: "1px solid var(--border-color, #334155)",
                  }}
                >
                  <h4 style={{ margin: "0 0 12px", color: "inherit" }}>Trip Summary</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "0.85rem" }}>
                    <div><strong>Source:</strong> {typeof selectedSource.name === "string" ? selectedSource.name : "Selected Location"}</div>
                    <div><strong>Destination:</strong> {typeof selectedDest.name === "string" ? selectedDest.name : "Destination Location"}</div>
                    <div><strong>Road Distance:</strong> {routeData.distance_km} km</div>
                    <div><strong>Driving Time:</strong> {routeService.formatDuration(routeData.duration_minutes)}</div>
                    <div><strong>Vehicle:</strong> {selectedVehicle.brand} {selectedVehicle.model}</div>
                    <div><strong>Current Battery:</strong> {evMetrics.currentBattery}%</div>
                    <div><strong>Direct Trip Battery Needed:</strong> {evMetrics.directBatteryNeededPercent}%</div>
                    <div><strong>Est. Destination Battery:</strong> {evMetrics.estimatedDestinationBattery}%</div>
                    <div><strong>Reserve Threshold:</strong> 20%</div>
                    <div><strong>Charging Required:</strong> {evMetrics.isChargingRequired ? "Yes" : "No"}</div>
                    {selectedStation && (
                      <>
                        <div><strong>Selected Stop:</strong> {selectedStation.station_name}</div>
                        <div><strong>Est. Arrival Battery:</strong> {selectedStation.estimatedArrivalBattery}%</div>
                        <div><strong>Est. Detour:</strong> {selectedStation.detourKm ?? 0} km</div>
                      </>
                    )}
                  </div>
                </div>

                {/* Final Form Actions */}
                <div style={{ marginTop: "24px" }}>
                  <FormActions
                    loading={saving}
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
