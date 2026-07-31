import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBatteryHalf,
  FaCar,
  FaCheckCircle,
  FaCompass,
  FaExclamationTriangle,
  FaEye,
  FaInfoCircle,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaPlus,
  FaRoad,
  FaRoute,
  FaSpinner,
  FaStopCircle,
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
  const navigate = useNavigate();

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

  // Newest Trips First Sorting
  const sortedTrips = useMemo(() => {
    if (!data?.trips) return [];
    return [...data.trips].sort(
      (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
    );
  }, [data?.trips]);

  // Modal & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [startingTripId, setStartingTripId] = useState(null);

  // View Summary Modal State
  const [viewTripModal, setViewTripModal] = useState(null);

  // End Trip Confirmation Modal State
  const [endTripConfirmModal, setEndTripConfirmModal] = useState(null);
  const [endingTrip, setEndingTrip] = useState(false);

  // Vehicle Selection (Explicit Synchronization)
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const selectedVehicle = useMemo(() => {
    if (!data?.vehicles || !data.vehicles.length) return null;
    const found = data.vehicles.find((v) => Number(v.id) === Number(selectedVehicleId));
    return found || null;
  }, [data, selectedVehicleId]);

  useEffect(() => {
    if (data?.vehicles?.length && (!selectedVehicleId || !data.vehicles.some(v => Number(v.id) === Number(selectedVehicleId)))) {
      setSelectedVehicleId(String(data.vehicles[0].id));
    }
  }, [data?.vehicles, selectedVehicleId]);

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
  const [selectedSource, setSelectedSource] = useState(null);
  const [locationStatus, setLocationStatus] = useState("IDLE");

  const [destQuery, setDestQuery] = useState("");
  const [selectedDest, setSelectedDest] = useState(null);

  // Calculated OSRM Route State
  const [routeData, setRouteData] = useState(null);
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

  // Current Location GPS Handler
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

  // EV Range & Battery Metrics Formula Execution
  const evMetrics = useMemo(() => {
    if (!selectedVehicle || !routeData) return null;

    const capacityKwh = Number(selectedVehicle.battery_capacity) || 0;
    const currentBattery = Number(selectedVehicle.current_battery_percentage) || 0;
    const efficiency = Number(selectedVehicle.efficiency) || 0;
    const distanceKm = routeData.distance_km;

    if (capacityKwh <= 0 || efficiency <= 0) {
      return { invalid: true };
    }

    const isUnrealisticEfficiency = efficiency < 1.0 || efficiency > 12.0;
    const directEnergyRequiredKwh = distanceKm / efficiency;
    const directBatteryNeededPercent = (directEnergyRequiredKwh / capacityKwh) * 100;
    const estimatedDestinationBattery = currentBattery - directBatteryNeededPercent;
    const isChargingRequired = estimatedDestinationBattery < RESERVE_BATTERY_DEFAULT;

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

  // OSRM Road Route Calculation & Station Candidate Shortlisting
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
    setDetourGeometry(null);

    try {
      const routeRes = await routeService.getDrivingRoute({
        originLatitude: selectedSource.lat,
        originLongitude: selectedSource.lng,
        destinationLatitude: selectedDest.lat,
        destinationLongitude: selectedDest.lng,
      });

      setRouteData(routeRes);

      const capacityKwh = Number(selectedVehicle.battery_capacity) || 0;
      const currentBattery = Number(selectedVehicle.current_battery_percentage) || 0;
      const efficiency = Number(selectedVehicle.efficiency) || 0;
      const totalRouteDistance = routeRes.distance_km;

      const directEnergyRequiredKwh = totalRouteDistance / efficiency;
      const directBatteryNeededPercent = (directEnergyRequiredKwh / capacityKwh) * 100;
      const estimatedDestinationBattery = currentBattery - directBatteryNeededPercent;
      const isChargingRequired = estimatedDestinationBattery < RESERVE_BATTERY_DEFAULT;

      const candidateFilterResult = filterAndRankStationsAlongRoute({
        stationsList: data.stations || [],
        vehicleConnectorType: selectedVehicle.connector_type,
        routeGeometry: routeRes.geometry,
        totalRouteDistanceKm: totalRouteDistance,
        batteryCapacityKwh: capacityKwh,
        currentBatteryPercent: currentBattery,
        vehicleEfficiencyKmPerKwh: efficiency,
        reserveThresholdPercent: RESERVE_BATTERY_DEFAULT,
        criticalMinimumPercent: CRITICAL_BATTERY_MINIMUM,
      });

      setFilterDiagnostics(candidateFilterResult.diagnostics);
      setEmptyStateReason(candidateFilterResult.emptyReason);

      const shortlisted = candidateFilterResult.candidates.slice(0, MAX_STOPS_LIMIT);

      if (shortlisted.length > 0) {
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

  // 1. Save Trip Request (Creates status PLANNED)
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
        current_battery_percentage: evMetrics.currentBattery,
        estimated_destination_battery: evMetrics.estimatedDestinationBattery,
        estimated_arrival_battery_at_station: selectedStation ? selectedStation.estimatedArrivalBattery : null,
        charging_required: evMetrics.isChargingRequired,
        estimated_detour_km: selectedStation?.detourKm ? Number(selectedStation.detourKm) : null,
        suggested_station: selectedStation ? selectedStation.id : null,
        trip_status: "PLANNED",
      };

      const result = await evService.trips.create(payload);
      const createdTrip = result.trip || result;

      toast.success("Trip plan saved successfully!");
      setModalOpen(false);
      await refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save this trip plan."));
    } finally {
      setSaving(false);
    }
  };

  // 2. Start Trip Handler
  const handleStartTrip = async (trip) => {
    // Prevent multiple ONGOING trips simultaneously
    const hasActiveTrip = data?.trips?.some(
      (t) => t.trip_status === "ONGOING" && Number(t.id) !== Number(trip.id)
    );
    if (hasActiveTrip) {
      toast.error("You already have an active trip. Please end the current trip before starting another one.");
      return;
    }

    setStartingTripId(trip.id);
    try {
      let startLat = Number(trip.source_latitude);
      let startLng = Number(trip.source_longitude);

      try {
        const gps = await locationService.getCurrentLocation();
        startLat = gps.latitude;
        startLng = gps.longitude;
      } catch (geoErr) {
        console.warn("GPS lookup on start trip fallback to planned source:", geoErr);
      }

      await evService.trips.start(trip.id, {
        actual_start_latitude: startLat,
        actual_start_longitude: startLng,
      });

      toast.success("Trip started! Navigating now...");
      navigate(`/trips/${trip.id}/navigate`);
    } catch (err) {
      toast.error(getApiError(err, "Failed to start trip."));
    } finally {
      setStartingTripId(null);
    }
  };

  // 3. End Trip Handler (Confirmation Modal + API Action)
  const handleConfirmEndTrip = async () => {
    if (!endTripConfirmModal) return;
    setEndingTrip(true);
    try {
      let endLat = Number(endTripConfirmModal.destination_latitude);
      let endLng = Number(endTripConfirmModal.destination_longitude);

      try {
        const gps = await locationService.getCurrentLocation();
        endLat = gps.latitude;
        endLng = gps.longitude;
      } catch (err) {
        console.warn("GPS lookup on end trip fallback:", err);
      }

      await evService.trips.end(endTripConfirmModal.id, {
        actual_end_latitude: endLat,
        actual_end_longitude: endLng,
        actual_distance_km: endTripConfirmModal.distance_km,
      });

      toast.success("Trip completed successfully!");
      setEndTripConfirmModal(null);
      await refresh();
    } catch (err) {
      toast.error(getApiError(err, "Failed to end trip."));
    } finally {
      setEndingTrip(false);
    }
  };

  // Delete Trip Handler
  const removeTrip = async (trip) => {
    if (trip.trip_status === "ONGOING") {
      toast.error("Cannot delete an ongoing trip. End or cancel it first.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete the trip plan from ${trip.source} to ${trip.destination}?`)) return;
    try {
      await evService.trips.remove(trip.id);
      toast.success("Trip plan removed.");
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
        title="EV Trip Planner & Live Navigation"
        description="Plan real road driving routes, calculate exact battery consumption, discover charging stops, and navigate live."
        action={
          <button className="primary-button" disabled={!data.vehicles.length} onClick={openForm} type="button">
            <FaPlus /> Plan New Trip
          </button>
        }
      />

      {!data.vehicles.length && <div className="inline-alert">Add a vehicle in your profile before planning a trip.</div>}

      {/* List of Saved Trips (Newest First) */}
      {sortedTrips.length ? (
        <div className="timeline-list">
          {sortedTrips.map((trip) => {
            const vehicleId = typeof trip.vehicle === "object" ? trip.vehicle?.id : trip.vehicle;
            const vehicle = data.vehicles.find((v) => Number(v.id) === Number(vehicleId));

            const stationId = typeof trip.suggested_station === "object" ? trip.suggested_station?.id : trip.suggested_station;
            const station = trip.suggested_station_detail || data.stations.find((s) => Number(s.id) === Number(stationId));

            const isPlanned = trip.trip_status === "PLANNED";
            const isOngoing = trip.trip_status === "ONGOING";
            const isCompleted = trip.trip_status === "COMPLETED";

            return (
              <article className={`timeline-card ${isOngoing ? "border-amber-500/50 bg-amber-500/5" : ""}`} key={trip.id}>
                <div className="trip-route-visual">
                  <span><FaMapMarkerAlt /></span>
                  <i />
                  <span><FaMapMarkerAlt /></span>
                </div>

                <div className="timeline-content">
                  <div className="timeline-heading flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        {isCompleted && trip.end_time
                          ? `Completed on ${formatDate(trip.end_time)}`
                          : isOngoing && trip.start_time
                          ? `Started at ${new Date(trip.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                          : formatDate(trip.created_at)}
                      </p>
                      <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                        {trip.source} <span className="text-amber-400">→</span> {trip.destination}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOngoing && (
                        <span className="badge inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-semibold animate-pulse">
                          <FaCompass className="text-xs" /> Trip in Progress
                        </span>
                      )}
                      <StatusBadge value={trip.trip_status} />
                    </div>
                  </div>

                  <div className="trip-metrics my-3 grid grid-cols-2 md:grid-cols-5 gap-3">
                    <span><FaRoad /><strong>{trip.distance_km} km</strong><small>Distance</small></span>
                    <span><FaRoute /><strong>{routeService.formatDuration(trip.estimated_time)}</strong><small>Est. Drive Time</small></span>
                    <span><FaBatteryHalf /><strong>{trip.estimated_battery_needed}%</strong><small>Battery Needed</small></span>
                    <span><FaCar /><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : (vehicleId ? `Vehicle #${vehicleId}` : "Vehicle")}</strong><small>Vehicle</small></span>
                    <span><FaMapMarkerAlt /><strong>{station?.station_name || (stationId ? `Station #${stationId}` : "No stop required")}</strong><small>Charging Stop</small></span>
                  </div>

                  {/* Trip Card Action Buttons */}
                  <div className="trip-actions flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
                    {isPlanned && (
                      <>
                        <button
                          className="primary-button bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold inline-flex items-center gap-2 px-4 py-2 text-sm"
                          onClick={() => handleStartTrip(trip)}
                          disabled={startingTripId === trip.id}
                          type="button"
                        >
                          {startingTripId === trip.id ? <FaSpinner className="animate-spin" /> : <FaCompass />} Start Trip
                        </button>
                        <button
                          className="danger-button inline-flex items-center gap-2 text-sm"
                          onClick={() => removeTrip(trip)}
                          type="button"
                        >
                          <FaTrash /> Delete
                        </button>
                      </>
                    )}

                    {isOngoing && (
                      <>
                        <button
                          className="primary-button bg-sky-500 hover:bg-sky-600 text-white font-bold inline-flex items-center gap-2 px-4 py-2 text-sm"
                          onClick={() => navigate(`/trips/${trip.id}/navigate`)}
                          type="button"
                        >
                          <FaCompass /> Navigate
                        </button>
                        <button
                          className="danger-button bg-red-600 hover:bg-red-700 text-white font-bold inline-flex items-center gap-2 px-4 py-2 text-sm"
                          onClick={() => setEndTripConfirmModal(trip)}
                          type="button"
                        >
                          <FaStopCircle /> End Trip
                        </button>
                      </>
                    )}

                    {isCompleted && (
                      <button
                        className="secondary-button inline-flex items-center gap-2 text-sm"
                        onClick={() => setViewTripModal(trip)}
                        type="button"
                      >
                        <FaEye /> View Trip Summary
                      </button>
                    )}
                  </div>
                </div>
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

      {/* View Trip Summary Modal */}
      {viewTripModal && (
        <Modal
          title={`Completed Trip: ${viewTripModal.source} ➜ ${viewTripModal.destination}`}
          onClose={() => setViewTripModal(null)}
        >
          <div className="p-4 text-slate-200">
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-slate-400 block text-xs">Started At:</span><strong>{viewTripModal.start_time ? formatDate(viewTripModal.start_time) : "N/A"}</strong></div>
              <div><span className="text-slate-400 block text-xs">Completed At:</span><strong>{viewTripModal.end_time ? formatDate(viewTripModal.end_time) : "N/A"}</strong></div>
              <div><span className="text-slate-400 block text-xs">Actual Duration:</span><strong>{viewTripModal.actual_duration_minutes ? `${viewTripModal.actual_duration_minutes} mins` : `${viewTripModal.estimated_time} mins`}</strong></div>
              <div><span className="text-slate-400 block text-xs">Total Distance:</span><strong>{viewTripModal.actual_distance_km || viewTripModal.distance_km} km</strong></div>
            </div>
            <div className="flex justify-end mt-6">
              <button className="primary-button" onClick={() => setViewTripModal(null)}>Close Summary</button>
            </div>
          </div>
        </Modal>
      )}

      {/* End Trip Confirmation Modal */}
      {Boolean(endTripConfirmModal) && (
        <Modal
          isOpen={Boolean(endTripConfirmModal)}
          onClose={() => setEndTripConfirmModal(null)}
          title="End Trip Confirmation"
        >
          <div className="p-4 text-slate-200">
            <p className="mb-4 text-sm">
              Are you sure you want to end the trip from <strong>{endTripConfirmModal.source}</strong> to <strong>{endTripConfirmModal.destination}</strong>?
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="secondary-button"
                onClick={() => setEndTripConfirmModal(null)}
                disabled={endingTrip}
                type="button"
              >
                Continue Trip
              </button>
              <button
                className="danger-button font-bold px-5"
                onClick={handleConfirmEndTrip}
                disabled={endingTrip}
                type="button"
              >
                {endingTrip ? <FaSpinner className="animate-spin" /> : "Confirm End Trip"}
              </button>
            </div>
          </div>
        </Modal>
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
