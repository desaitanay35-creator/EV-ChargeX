import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBolt, FaCar, FaCheckCircle, FaClock, FaCompass, FaCrosshairs, FaExclamationTriangle, FaExternalLinkAlt, FaFilter, FaMapMarkerAlt, FaRoute, FaSearch, FaSpinner, FaStar, FaStopCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, LoadingState, PageHeader } from "../../components/ui/UI";
import LocationDropdown from "../../components/ui/LocationDropdown";
import TripRouteMap from "../../components/map/TripRouteMap";
import useResource from "../../hooks/useResource";
import evService, { toList } from "../../services/evService";
import routeService from "../../services/routeService";
import locationService from "../../services/locationService";
import { isConnectorCompatible } from "../../utils/connectorCompatibility";
import { calculateDistanceKm, isValidCoordinate } from "../../utils/geo";

function getDistanceMeters(lat1, lon1, lat2, lon2) {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) return Infinity;
  const R = 6371e3;
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

const DEFAULT_LAT = 23.0225; // Default Ahmedabad center if no GPS
const DEFAULT_LNG = 72.5714;

function ChargeNearbyPage() {
  const navigate = useNavigate();

  const loader = useCallback(async () => {
    const [vehiclesRes, stationsRes] = await Promise.all([
      evService.vehicles.list(),
      evService.stations.list(),
    ]);
    return {
      vehicles: toList(vehiclesRes),
      stations: toList(stationsRes),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  // State
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [userLocation, setUserLocation] = useState(null); // { lat, lng, displayName }
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [manualQuery, setManualQuery] = useState("");
  const [selectedRadius, setSelectedRadius] = useState(10); // km
  const [sortBy, setSortBy] = useState("nearest"); // nearest, available, rated, power, price
  const [showAllStations, setShowAllStations] = useState(false);

  // Selected Station & Route
  const [selectedStation, setSelectedStation] = useState(null);
  const [osrmRoute, setOsrmRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);

  // Live Navigation State
  const [isNavigating, setIsNavigating] = useState(false);
  const [livePos, setLivePos] = useState(null);
  const [navGeoError, setNavGeoError] = useState("");
  const [reachedStation, setReachedStation] = useState(false);
  const lastNavRoutedPos = useRef(null);

  // Live GPS Tracking Watcher
  useEffect(() => {
    let watchId = null;

    if (isNavigating) {
      if (navigator.geolocation) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const newPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              name: "Current GPS Position",
            };
            setLivePos(newPos);
            setUserLocation(newPos);
            setNavGeoError("");
          },
          (err) => {
            let msg = "GPS location error during navigation.";
            if (err.code === err.PERMISSION_DENIED) msg = "Location permission denied.";
            else if (err.code === err.POSITION_UNAVAILABLE) msg = "Position unavailable.";
            else if (err.code === err.TIMEOUT) msg = "GPS timeout.";
            setNavGeoError(msg);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
        );
      } else {
        setNavGeoError("Browser does not support geolocation.");
      }
    }

    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isNavigating]);

  // Dynamic Live OSRM Re-Routing during Navigation
  useEffect(() => {
    if (!isNavigating || !livePos || !selectedStation) return;

    if (lastNavRoutedPos.current) {
      const movedM = getDistanceMeters(
        lastNavRoutedPos.current.lat,
        lastNavRoutedPos.current.lng,
        livePos.lat,
        livePos.lng
      );
      if (movedM < 30) return;
    }

    let isSubscribed = true;
    const fetchRoute = async () => {
      try {
        setCalculatingRoute(true);
        const res = await routeService.getDrivingRoute({
          originLatitude: livePos.lat,
          originLongitude: livePos.lng,
          destinationLatitude: selectedStation.lat,
          destinationLongitude: selectedStation.lng,
        });
        if (isSubscribed && res) {
          setOsrmRoute(res);
          lastNavRoutedPos.current = livePos;
        }
      } catch (err) {
        console.warn("OSRM Navigation error:", err);
      } finally {
        if (isSubscribed) setCalculatingRoute(false);
      }
    };

    fetchRoute();
    return () => {
      isSubscribed = false;
    };
  }, [isNavigating, livePos, selectedStation]);

  // Geofenced Arrival Check (within 200m)
  useEffect(() => {
    if (isNavigating && livePos && selectedStation) {
      const distM = getDistanceMeters(
        livePos.lat,
        livePos.lng,
        selectedStation.lat,
        selectedStation.lng
      );
      if (distM <= 200) {
        setReachedStation(true);
      } else {
        setReachedStation(false);
      }
    } else {
      setReachedStation(false);
    }
  }, [isNavigating, livePos, selectedStation]);

  const handleStartNavigation = (station) => {
    setSelectedStation(station);
    setIsNavigating(true);
    lastNavRoutedPos.current = null;
    toast.success(`Started live navigation to ${station.station_name}!`);
    handleViewRoute(station);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setLivePos(null);
    setReachedStation(false);
    toast.info("Live navigation stopped.");
  };

  const googleMapsUrl = useMemo(() => {
    if (!userLocation || !selectedStation) return "#";
    return `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${selectedStation.lat},${selectedStation.lng}&travelmode=driving`;
  }, [userLocation, selectedStation]);

  // Synchronize initial vehicle
  useEffect(() => {
    if (data?.vehicles?.length && !selectedVehicleId) {
      setSelectedVehicleId(String(data.vehicles[0].id));
    }
  }, [data?.vehicles, selectedVehicleId]);

  const selectedVehicle = useMemo(() => {
    if (!data?.vehicles?.length || !selectedVehicleId) return null;
    return data.vehicles.find((v) => String(v.id) === String(selectedVehicleId)) || data.vehicles[0];
  }, [data?.vehicles, selectedVehicleId]);

  // Request Browser Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser. Please search your area manually.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        let name = "Current Location";
        try {
          const results = await locationService.searchLocations(`${lat}, ${lng}`);
          if (results && results.length) {
            name = results[0].displayName || results[0].name;
          }
        } catch {
          // Keep coordinates even if reverse geocoding fails
        }

        setUserLocation({ lat, lng, name });
        setLocating(false);
        toast.success("Current location updated!");
      },
      (err) => {
        setLocating(false);
        let msg = "Location access was denied or unavailable. Please search your area manually.";
        if (err.code === err.PERMISSION_DENIED) {
          msg = "Location access is needed to find nearby stations. You can search an area manually instead.";
        }
        setLocationError(msg);
        toast.error("Could not fetch location.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Default initial location if none set
  useEffect(() => {
    if (!userLocation && !locationError) {
      setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, name: "Ahmedabad (Default Area)" });
    }
  }, [userLocation, locationError]);

  // Calculate Nearby Stations with Haversine Ranking & Filtering
  const filteredNearbyStations = useMemo(() => {
    if (!data?.stations?.length || !userLocation || !selectedVehicle) return [];

    return data.stations
      .map((st) => {
        const lat = Number(st.latitude);
        const lng = Number(st.longitude);

        if (isNaN(lat) || isNaN(lng)) return null;

        const distanceKm = calculateDistanceKm(
          userLocation.lat,
          userLocation.lng,
          lat,
          lng
        );

        const chargers = Array.isArray(st.chargers) ? st.chargers : [];
        const compatibleChargers = chargers.filter((c) =>
          isConnectorCompatible(selectedVehicle.connector_type, c.connector_type)
        );
        const availableCompatibleChargers = compatibleChargers.filter(
          (c) => c.status === "AVAILABLE"
        );

        const maxPower = compatibleChargers.reduce(
          (max, c) => Math.max(max, Number(c.power_output_kw) || 0),
          0
        );

        const minPrice = compatibleChargers.reduce(
          (min, c) => Math.min(min, Number(c.price_per_kwh) || 999),
          999
        );

        return {
          ...st,
          lat,
          lng,
          distanceKm: Number(distanceKm.toFixed(1)),
          compatibleChargersCount: compatibleChargers.length,
          availableCompatibleCount: availableCompatibleChargers.length,
          bestCharger: availableCompatibleChargers[0] || compatibleChargers[0] || null,
          maxPower,
          minPrice: minPrice === 999 ? 0 : minPrice,
        };
      })
      .filter((st) => {
        if (!st) return false;
        if (st.distanceKm > selectedRadius) return false;
        if (!showAllStations) {
          if (st.status !== "OPEN") return false;
          if (st.compatibleChargersCount === 0) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "nearest") return a.distanceKm - b.distanceKm;
        if (sortBy === "available") return b.availableCompatibleCount - a.availableCompatibleCount;
        if (sortBy === "rated") return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        if (sortBy === "power") return b.maxPower - a.maxPower;
        if (sortBy === "price") return a.minPrice - b.minPrice;
        return a.distanceKm - b.distanceKm;
      });
  }, [data?.stations, userLocation, selectedVehicle, selectedRadius, showAllStations, sortBy]);

  // Request OSRM Driving Route to Selected Station
  const handleViewRoute = async (station) => {
    setSelectedStation(station);
    if (!userLocation) return;

    setCalculatingRoute(true);
    setOsrmRoute(null);

    try {
      const res = await routeService.getDrivingRoute({
        originLatitude: userLocation.lat,
        originLongitude: userLocation.lng,
        destinationLatitude: station.lat,
        destinationLongitude: station.lng,
      });
      if (res) {
        setOsrmRoute(res);
        toast.success(`Driving route: ${res.distance_km} km (${res.duration_minutes} min)`);
      }
    } catch (err) {
      toast.error("Could not calculate road route.");
    } finally {
      setCalculatingRoute(false);
    }
  };

  // Direct Booking Handler
  const handleBookCharger = (station, charger) => {
    if (!selectedVehicle) {
      toast.error("Please select a vehicle first.");
      return;
    }
    const chargerId = charger ? charger.id : station.bestCharger?.id || "";
    navigate(`/bookings?station=${station.id}&charger=${chargerId}&vehicle=${selectedVehicle.id}&mode=nearby`);
  };

  if (loading) return <LoadingState label="Finding nearby charging stations..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <section className="charge-nearby-container" style={{ padding: "16px 0" }}>
      <PageHeader
        eyebrow="Direct Charging Discovery"
        title="Charge nearby"
        description="Find an available compatible charger near your current location without planning a road trip."
      />

      {/* Top Filter Bar: Vehicle, Location & Controls */}
      <div className="nearby-controls-card" style={{ background: "var(--surface-dark)", padding: "20px", borderRadius: "12px", marginBottom: "20px", border: "1px solid var(--border-color)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", alignItems: "end" }}>
          
          {/* Vehicle Selector */}
          <Field label="Select Vehicle (Required for Connector Match)" full>
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "var(--surface-light)", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
            >
              {data.vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} ({v.registration_number}) · Connector: {v.connector_type} ({v.current_battery_percentage}%)
                </option>
              ))}
            </select>
          </Field>

          {/* Location Action & Search */}
          <div className="location-control-block">
            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Location Source</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="secondary-button"
                onClick={handleUseCurrentLocation}
                disabled={locating}
                type="button"
                style={{ flexShrink: 0 }}
              >
                <FaCrosshairs /> {locating ? "Locating..." : "Use My Location"}
              </button>

              <div style={{ flexGrow: 1 }}>
                <LocationDropdown
                  placeholder="Search city/area manually..."
                  value={manualQuery}
                  onChange={setManualQuery}
                  onSelectLocation={(loc) => {
                    setUserLocation({ lat: loc.lat, lng: loc.lng, name: loc.displayName || loc.name });
                    setLocationError("");
                    setOsrmRoute(null);
                    setSelectedStation(null);
                  }}
                  selectedLocation={userLocation}
                />
              </div>
            </div>
          </div>

          {/* Radius & Sort Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Field label="Search Radius">
              <select value={selectedRadius} onChange={(e) => setSelectedRadius(Number(e.target.value))}>
                <option value={5}>5 km</option>
                <option value={10}>10 km (Default)</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </Field>

            <Field label="Sort By">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="nearest">Nearest</option>
                <option value="available">Most Available Chargers</option>
                <option value="rated">Highest Rated</option>
                <option value="power">Fastest Charger (kW)</option>
                <option value="price">Lowest Price per kWh</option>
              </select>
            </Field>
          </div>

        </div>

      {/* Location Status / Error Banner */}
        {locationError ? (
          <div className="inline-alert error" style={{ marginTop: "16px", padding: "10px 14px", borderRadius: "6px", background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca" }}>
            {locationError}
          </div>
        ) : userLocation ? (
          <div style={{ marginTop: "12px", fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaMapMarkerAlt style={{ color: "#3b82f6" }} /> 
            Active location: <strong style={{ color: "var(--text-primary)" }}>{userLocation.name}</strong> ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
          </div>
        ) : null}
      </div>

      {/* Live Navigation Active Banner */}
      {isNavigating && selectedStation && (
        <div style={{ background: "rgba(14, 165, 233, 0.15)", border: "1px solid rgba(14, 165, 233, 0.4)", color: "#7dd3fc", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <FaCompass style={{ fontSize: "1.6rem", color: "#38bdf8" }} />
            <div>
              <strong style={{ fontSize: "1.05rem", color: "#f0f9ff", display: "block" }}>
                Live Navigation Active ➜ {selectedStation.station_name}
              </strong>
              <span style={{ fontSize: "0.85rem", color: "#bae6fd" }}>
                {osrmRoute ? (
                  <>Remaining Road Distance: <strong>{osrmRoute.distance_km} km</strong> · Est. Driving Time: <strong>{osrmRoute.duration_minutes} min</strong></>
                ) : (
                  "Acquiring live OSRM route..."
                )}
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-button btn-sm"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FaExternalLinkAlt /> Open Google Maps
            </a>
            <button
              className="danger-button btn-sm"
              onClick={handleStopNavigation}
              type="button"
              style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <FaStopCircle /> Stop Navigation
            </button>
          </div>
        </div>
      )}

      {/* Station Arrival Geofence Banner */}
      {reachedStation && selectedStation && (
        <div style={{ background: "rgba(34, 197, 94, 0.2)", border: "1px solid rgba(34, 197, 94, 0.5)", color: "#86efac", padding: "16px 20px", borderRadius: "12px", marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <FaCheckCircle style={{ fontSize: "1.8rem", color: "#4ade80" }} />
            <div>
              <strong style={{ fontSize: "1.1rem", color: "#f0fdf4", display: "block" }}>You have arrived at {selectedStation.station_name}!</strong>
              <span style={{ fontSize: "0.85rem", color: "#bbf7d0" }}>{selectedStation.address}, {selectedStation.city}</span>
            </div>
          </div>
          <button
            className="primary-button"
            onClick={() => handleBookCharger(selectedStation)}
            type="button"
            style={{ background: "#16a34a" }}
          >
            Book Charger Now ⚡
          </button>
        </div>
      )}

      {/* Main Grid: Station Cards + Map */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(340px, 1fr) minmax(360px, 1.2fr)", gap: "20px" }}>
        
        {/* Left Column: Station Cards List */}
        <div className="nearby-stations-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem" }}>
              Nearby Available Stations ({filteredNearbyStations.length})
            </h3>
            <label style={{ fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
              <input
                type="checkbox"
                checked={showAllStations}
                onChange={(e) => setShowAllStations(e.target.checked)}
              />
              Show all stations (including occupied/closed)
            </label>
          </div>

          {filteredNearbyStations.length ? (
            filteredNearbyStations.map((station) => {
              const isSelected = selectedStation?.id === station.id;
              return (
                <article
                  key={station.id}
                  className={`station-card ${isSelected ? "selected-card" : ""}`}
                  style={{
                    background: isSelected ? "rgba(59, 130, 246, 0.08)" : "var(--surface-dark)",
                    border: isSelected ? "2px solid #3b82f6" : "1px solid var(--border-color)",
                    borderRadius: "10px",
                    padding: "16px",
                    transition: "all 0.2s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-primary)" }}>{station.station_name}</h4>
                      <p style={{ margin: "2px 0 0 0", fontSize: "0.85rem", color: "var(--text-muted)" }}>{station.address}, {station.city}</p>
                    </div>
                    <span className="badge" style={{ background: "#3b82f620", color: "#3b82f6", padding: "4px 8px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {station.distanceKm} km away
                    </span>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "0.85rem", margin: "10px 0", color: "var(--text-primary)" }}>
                    <div><FaBolt style={{ color: "#eab308" }} /> Available: <strong>{station.availableCompatibleCount} / {station.compatibleChargersCount}</strong></div>
                    <div><FaCar /> Connector: <strong>{selectedVehicle?.connector_type}</strong></div>
                    <div>Power: <strong>{station.maxPower} kW</strong></div>
                    <div>Price: <strong>₹{station.minPrice}/kWh</strong></div>
                    {station.rating && <div><FaStar style={{ color: "#f59e0b" }} /> <strong>{station.rating}</strong></div>}
                    {station.predicted_wait_time > 0 && (
                      <div style={{ color: "#ef4444", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaClock /> Queue Wait: <strong>{station.predicted_wait_time} mins</strong>
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
                    <button
                      className="secondary-button btn-sm"
                      onClick={() => handleViewRoute(station)}
                      disabled={calculatingRoute && isSelected}
                      type="button"
                    >
                      <FaRoute /> {calculatingRoute && isSelected ? "Calculating..." : "View Driving Route"}
                    </button>

                    <button
                      className="primary-button btn-sm"
                      onClick={() => handleStartNavigation(station)}
                      type="button"
                      style={{ background: "#0284c7" }}
                    >
                      <FaCompass /> {isNavigating && isSelected ? "Navigating Live..." : "Start Live Navigation"}
                    </button>

                    <button
                      className="primary-button btn-sm"
                      onClick={() => handleBookCharger(station)}
                      type="button"
                      disabled={station.availableCompatibleCount === 0}
                    >
                      Book Charger
                    </button>
                  </div>

                  {isSelected && osrmRoute && (
                    <div style={{ marginTop: "12px", padding: "10px", background: "var(--surface-light)", borderRadius: "6px", fontSize: "0.85rem" }}>
                      <strong>Road Route Summary:</strong> {osrmRoute.distance_km} km · Est. driving time {osrmRoute.duration_minutes} min
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <EmptyState
              title="No compatible available charging stations nearby"
              message={`No OPEN stations with available ${selectedVehicle?.connector_type || ""} chargers were found within ${selectedRadius} km.`}
              action={
                <button className="secondary-button" onClick={() => setSelectedRadius(selectedRadius * 2)} type="button">
                  Expand Radius to {selectedRadius * 2} km
                </button>
              }
            />
          )}

        </div>

        {/* Right Column: Interactive Leaflet Map */}
        <div className="nearby-map-wrapper" style={{ height: "600px", sticky: "top 80px" }}>
          <TripRouteMap
            origin={userLocation ? { lat: userLocation.lat, lng: userLocation.lng, name: userLocation.name } : null}
            destination={selectedStation ? { lat: selectedStation.lat, lng: selectedStation.lng, name: selectedStation.station_name } : null}
            candidateStations={filteredNearbyStations}
            selectedStationId={selectedStation?.id}
            onSelectStation={(station) => handleViewRoute(station)}
            routeGeometry={osrmRoute?.geometry}
          />
        </div>

      </div>
    </section>
  );
}

export default ChargeNearbyPage;
