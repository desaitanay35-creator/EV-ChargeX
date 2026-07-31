import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaBatteryHalf,
  FaChargingStation,
  FaCheckCircle,
  FaCompass,
  FaDirections,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFlagCheckered,
  FaLocationArrow,
  FaMapMarkerAlt,
  FaRoad,
  FaSpinner,
  FaStopCircle,
} from "react-icons/fa";
import { toast } from "react-toastify";

import TripRouteMap from "../../components/map/TripRouteMap";
import { ErrorState, LoadingState, Modal, PageHeader } from "../../components/ui/UI";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import locationService, { GEOLOCATION_ERRORS } from "../../services/locationService";
import routeService from "../../services/routeService";
import { calculateDistanceKm, isValidCoordinate } from "../../utils/geo";

// Haversine formula for station arrival detection (meters)
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) return Infinity;
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TripNavigationPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Live Location & Tracking State
  const [currentPos, setCurrentPos] = useState(null);
  const [geoError, setGeoError] = useState(null);

  // Navigation Route State
  const [routeInfo, setRouteInfo] = useState(null);
  const [routingLoading, setRoutingLoading] = useState(false);
  const lastRoutedPos = useRef(null);

  // Arrival & Action States
  const [reachedStation, setReachedStation] = useState(false);
  const [continuing, setContinuing] = useState(false);

  // End Trip Modal State (Must default to false)
  const [showEndTripModal, setShowEndTripModal] = useState(false);
  const [ending, setEnding] = useState(false);

  // Fetch Trip Data from Backend
  const loadTrip = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await evService.trips.get(tripId);
      setTrip(data);
    } catch (err) {
      setError(getApiError(err, "Failed to load trip details for navigation."));
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  // Initial mount logging verification
  useEffect(() => {
    if (trip) {
      console.log("Navigation component mounted");
      console.log("showEndTripModal:", showEndTripModal);
      console.log("Trip status:", trip.trip_status);
    }
  }, [trip, showEndTripModal]);

  // Start Watch Position on Mount
  useEffect(() => {
    let watchId = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newPos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentPos(newPos);
          setGeoError(null);
        },
        (err) => {
          let msg = "Geolocation error occurred.";
          if (err.code === err.PERMISSION_DENIED) msg = GEOLOCATION_ERRORS.PERMISSION_DENIED;
          else if (err.code === err.POSITION_UNAVAILABLE) msg = GEOLOCATION_ERRORS.POSITION_UNAVAILABLE;
          else if (err.code === err.TIMEOUT) msg = GEOLOCATION_ERRORS.TIMEOUT;
          setGeoError(msg);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
      );
    } else {
      setGeoError("Browser does not support geolocation.");
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Determine current active navigation target (Station or Final Destination)
  const stationDetail = trip?.suggested_station_detail;
  const isHeadingToStation =
    Boolean(trip?.charging_required) &&
    Boolean(stationDetail?.latitude) &&
    Boolean(stationDetail?.longitude) &&
    trip?.navigation_stage !== "TO_DESTINATION";

  const targetCoords = useMemo(() => {
    if (!trip) return null;
    if (isHeadingToStation && stationDetail) {
      return {
        lat: Number(stationDetail.latitude),
        lng: Number(stationDetail.longitude),
        title: stationDetail.station_name,
        isStation: true,
      };
    }
    return {
      lat: Number(trip.destination_latitude || 0),
      lng: Number(trip.destination_longitude || 0),
      title: trip.destination,
      isStation: false,
    };
  }, [trip, isHeadingToStation, stationDetail]);

  // Calculate / Throttled Recalculate OSRM Route
  useEffect(() => {
    if (!currentPos || !targetCoords || !isValidCoordinate(targetCoords.lat, targetCoords.lng)) {
      return;
    }

    if (lastRoutedPos.current) {
      const movedMeters = getDistanceMeters(
        lastRoutedPos.current.lat,
        lastRoutedPos.current.lng,
        currentPos.lat,
        currentPos.lng
      );
      if (movedMeters < 30) return;
    }

    let isSubscribed = true;
    const fetchRoute = async () => {
      try {
        setRoutingLoading(true);
        const res = await routeService.getDrivingRoute(
          [currentPos.lat, currentPos.lng],
          [targetCoords.lat, targetCoords.lng]
        );
        if (isSubscribed) {
          setRouteInfo(res);
          lastRoutedPos.current = currentPos;
        }
      } catch (err) {
        console.warn("OSRM Navigation Routing fallback:", err);
      } finally {
        if (isSubscribed) setRoutingLoading(false);
      }
    };

    fetchRoute();

    return () => {
      isSubscribed = false;
    };
  }, [currentPos, targetCoords]);

  // Check Station Arrival Radius (200 meters)
  useEffect(() => {
    if (isHeadingToStation && currentPos && stationDetail) {
      const stationLat = Number(stationDetail.latitude);
      const stationLng = Number(stationDetail.longitude);
      const distMeters = getDistanceMeters(currentPos.lat, currentPos.lng, stationLat, stationLng);

      if (distMeters <= 200) {
        setReachedStation(true);
      } else {
        setReachedStation(false);
      }
    } else {
      setReachedStation(false);
    }
  }, [isHeadingToStation, currentPos, stationDetail]);

  // Action: Continue to Destination after station stop
  const handleContinueToDestination = async () => {
    try {
      setContinuing(true);
      const updated = await evService.trips.continueToDestination(trip.id);
      setTrip(updated);
      setReachedStation(false);
      lastRoutedPos.current = null;
      toast.success("Navigation updated to final destination!");
    } catch (err) {
      toast.error(getApiError(err, "Failed to update navigation stage."));
    } finally {
      setContinuing(false);
    }
  };

  // Handler for End Trip button click
  const handleEndTripClick = (event) => {
    if (event) event.stopPropagation();
    setShowEndTripModal(true);
  };

  // Handler for Continue Trip (cancelling modal)
  const handleContinueTrip = () => {
    setShowEndTripModal(false);
  };

  // Action: Confirm End Trip & API Call
  const handleConfirmEndTrip = async () => {
    try {
      setEnding(true);
      let endLat = currentPos?.lat;
      let endLng = currentPos?.lng;

      if (!endLat || !endLng) {
        try {
          const freshLoc = await locationService.getCurrentLocation();
          endLat = freshLoc.lat;
          endLng = freshLoc.lng;
        } catch {
          endLat = Number(trip.destination_latitude || 0);
          endLng = Number(trip.destination_longitude || 0);
        }
      }

      await evService.trips.end(trip.id, {
        actual_end_latitude: endLat,
        actual_end_longitude: endLng,
        actual_distance_km: routeInfo?.distance_km || trip.distance_km,
      });

      setShowEndTripModal(false);
      toast.success("Trip completed successfully!");
      navigate("/trips");
    } catch (err) {
      toast.error(getApiError(err, "Failed to complete trip."));
    } finally {
      setEnding(false);
    }
  };

  // Google Maps External Fallback URL
  const googleMapsUrl = useMemo(() => {
    if (!currentPos || !targetCoords) return "#";
    const originStr = `${currentPos.lat},${currentPos.lng}`;
    const destStr = `${targetCoords.lat},${targetCoords.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      originStr
    )}&destination=${encodeURIComponent(destStr)}&travelmode=driving`;
  }, [currentPos, targetCoords]);

  if (loading) return <LoadingState label="Initializing trip navigation & GPS..." />;
  if (error) return <ErrorState message={error} onRetry={loadTrip} />;
  if (!trip) return <ErrorState message="Trip record not found." />;

  // Non-ongoing trip state handler
  if (trip.trip_status !== "ONGOING") {
    return (
      <div className="page-container">
        <PageHeader title={`Navigation - ${trip.source} to ${trip.destination}`} />
        <div className="form-card text-center py-8">
          <FaExclamationTriangle size={36} className="text-amber-400 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Trip Status: {trip.trip_status}</h2>
          <p className="text-slate-400 mb-6">
            This trip is currently in <strong>{trip.trip_status}</strong> status. Only active ONGOING trips can be navigated live.
          </p>
          <button className="primary-button" onClick={() => navigate("/trips")}>
            Return to Trip List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title={`Live Navigation: ${trip.source} ➜ ${trip.destination}`}
        actions={
          <div className="flex gap-2">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button inline-flex items-center gap-2 text-sm"
            >
              <FaExternalLinkAlt /> Open in Google Maps
            </a>
            <button
              className="danger-button inline-flex items-center gap-2"
              onClick={handleEndTripClick}
              type="button"
            >
              <FaStopCircle /> End Trip
            </button>
          </div>
        }
      />

      {/* Geolocation Error Alert */}
      {geoError && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-4 rounded-xl mb-4 flex items-center gap-3">
          <FaExclamationTriangle size={20} className="shrink-0" />
          <div>
            <strong>Location Warning:</strong> {geoError}
            <span className="block text-xs text-amber-400/80 mt-0.5">
              Ensure GPS is enabled in your browser settings for real-time location updates.
            </span>
          </div>
        </div>
      )}

      {/* Charging Station Arrival Banner */}
      {reachedStation && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 p-5 rounded-2xl mb-6 shadow-lg animate-pulse flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FaCheckCircle size={28} className="text-emerald-400 shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-emerald-200">You have reached the selected charging station!</h3>
              <p className="text-sm text-emerald-300/90">
                Station: <strong>{stationDetail?.station_name}</strong> ({stationDetail?.city})
              </p>
            </div>
          </div>
          <button
            className="primary-button bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl shrink-0"
            onClick={handleContinueToDestination}
            disabled={continuing}
            type="button"
          >
            {continuing ? <FaSpinner className="animate-spin" /> : "Continue to Destination ➜"}
          </button>
        </div>
      )}

      {/* Navigation Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="stat-card">
          <span className="stat-label">Navigation Target</span>
          <span className="stat-value text-base text-amber-400 truncate font-bold">
            {isHeadingToStation ? `⚡ ${stationDetail?.station_name || "Charging Station"}` : `🏁 ${trip.destination}`}
          </span>
          <span className="stat-subtext">
            {isHeadingToStation ? "Charging Stop En-Route" : "Final Destination"}
          </span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Remaining Distance</span>
          <span className="stat-value text-sky-400">
            {routeInfo ? `${routeInfo.distance_km} km` : "Calculating..."}
          </span>
          <span className="stat-subtext">Live OSRM Driving Distance</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Est. Remaining Time</span>
          <span className="stat-value text-emerald-400">
            {routeInfo ? `${routeInfo.duration_minutes} min` : "Calculating..."}
          </span>
          <span className="stat-subtext">Estimated Driving Time</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Est. Battery Needed</span>
          <span className="stat-value text-indigo-400">
            {trip.estimated_battery_needed ? `${trip.estimated_battery_needed}%` : "N/A"}
          </span>
          <span className="stat-subtext">Vehicle Efficiency Metric</span>
        </div>
      </div>

      {/* Navigation Leaflet Map View */}
      <div className="form-card p-4 rounded-2xl mb-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="flex items-center gap-2 font-bold text-slate-200">
            <FaCompass className="text-sky-400" />
            <span>Interactive Navigation Map</span>
            {routingLoading && <FaSpinner className="animate-spin text-sky-400 text-xs ml-2" />}
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            GPS Status: {currentPos ? "Connected" : "Acquiring..."}
          </span>
        </div>

        <div style={{ height: "480px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
          <TripRouteMap
            sourceLocation={
              currentPos
                ? { name: "Current Location", lat: currentPos.lat, lng: currentPos.lng }
                : trip.source_latitude && trip.source_longitude
                ? { name: trip.source, lat: Number(trip.source_latitude), lng: Number(trip.source_longitude) }
                : null
            }
            destinationLocation={{
              name: trip.destination,
              lat: Number(trip.destination_latitude),
              lng: Number(trip.destination_longitude),
            }}
            selectedStation={stationDetail}
            routeGeometry={routeInfo?.geometry}
          />
        </div>
      </div>

      {/* Trip Information Summary Card */}
      <div className="form-card">
        <h3 className="font-bold text-lg mb-4 text-slate-100 flex items-center gap-2">
          <FaRoad className="text-amber-400" /> Planned Trip Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div>
            <span className="block text-xs text-slate-400">Source Address</span>
            <strong>{trip.source}</strong>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Destination Address</span>
            <strong>{trip.destination}</strong>
          </div>
          <div>
            <span className="block text-xs text-slate-400">Selected Vehicle</span>
            <strong>{trip.vehicle_name ? `${trip.vehicle_name} (${trip.vehicle_model || ""})` : `Vehicle #${trip.vehicle}`}</strong>
          </div>
        </div>
      </div>

      {/* End Trip Confirmation Modal (Rendered ONLY when showEndTripModal is true) */}
      {showEndTripModal && (
        <Modal
          isOpen={showEndTripModal}
          onClose={handleContinueTrip}
          title="End Trip Confirmation"
        >
          <div className="p-4 text-slate-200">
            <p className="mb-4">
              Are you sure you want to end this trip? This will record your final destination arrival time and mark the trip as <strong>COMPLETED</strong>.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="secondary-button"
                onClick={handleContinueTrip}
                disabled={ending}
                type="button"
              >
                Continue Trip
              </button>
              <button
                className="danger-button font-bold px-5"
                onClick={handleConfirmEndTrip}
                disabled={ending}
                type="button"
              >
                {ending ? <FaSpinner className="animate-spin" /> : "Confirm End Trip"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
