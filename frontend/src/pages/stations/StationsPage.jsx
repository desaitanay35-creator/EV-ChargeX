import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaCar,
  FaClock,
  FaCompass,
  FaCrosshairs,
  FaDirections,
  FaEdit,
  FaExclamationTriangle,
  FaExpand,
  FaExternalLinkAlt,
  FaHeart,
  FaList,
  FaMap,
  FaMapMarkerAlt,
  FaPhone,
  FaPlus,
  FaRegHeart,
  FaRoad,
  FaStar,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import ChargingMap from "../../components/map/ChargingMap";
import {
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { getCurrentLocation } from "../../services/locationService";
import routeService, { ROUTE_ERROR_CODES, formatDuration } from "../../services/routeService";
import { evaluateStationCompatibility } from "../../utils/connectorCompatibility";
import { formatTime } from "../../utils/format";
import { calculateDistanceKm, formatDistance, isValidCoordinate } from "../../utils/geo";

const emptyStation = {
  station_name: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
  opening_time: "06:00",
  closing_time: "23:00",
  contact_number: "",
  email: "",
  amenities: "",
  status: "OPEN",
};

function StationsPage() {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const userRole = (role || user?.role)?.toUpperCase();
  const isUserRole = userRole === "USER";
  const isAdminRole = userRole === "ADMIN";
  const isOperatorRole = userRole === "OPERATOR";

  const [searchParams, setSearchParams] = useSearchParams();

  // Search, filtering, sorting, selection state
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("RECOMMENDED"); // RECOMMENDED | NEAREST | RATING | AVAILABILITY | NAME
  const [radiusFilter, setRadiusFilter] = useState("ALL"); // ALL | 5 | 10 | 25 | 50
  const [compatibilityFilter, setCompatibilityFilter] = useState("ALL"); // ALL | COMPATIBLE | PARTIALLY_COMPATIBLE | NOT_COMPATIBLE | UNKNOWN
  const [connectorTypeFilter, setConnectorTypeFilter] = useState("ALL"); // ALL | Type2 | CCS2 | CHAdeMO | GB/T
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);

  // Map & location state
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("idle"); // idle | locating | success | error_code
  const [locationError, setLocationError] = useState("");
  const [viewAction, setViewAction] = useState(null);
  const [mobileMode, setMobileMode] = useState("list"); // 'list' | 'map'

  // Route state
  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [routedStationId, setRoutedStationId] = useState(null);
  const [routeTimestamp, setRouteTimestamp] = useState(null);
  const abortControllerRef = useRef(null);

  // Modals
  const [modal, setModal] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [stationForm, setStationForm] = useState(emptyStation);
  const [reviewForm, setReviewForm] = useState({ rating: "5", comment: "" });
  const [saving, setSaving] = useState(false);

  // Card DOM references for scrolling
  const cardRefs = useRef({});

  // Role-aware data fetching: Do NOT fetch personal vehicles for ADMIN or OPERATOR
  const loader = useCallback(async () => {
    const isUser = (role || user?.role)?.toUpperCase() === "USER";
    const promises = [
      evService.stations.list(),
      evService.chargers.list(),
      evService.favorites.list(),
      evService.reviews.list(),
      isUser ? evService.vehicles.list() : Promise.resolve([]),
    ];
    const [stations, chargers, favorites, reviews, vehicles] = await Promise.all(promises);
    return {
      stations: toList(stations),
      chargers: toList(chargers),
      favorites: toList(favorites),
      reviews: toList(reviews),
      vehicles: toList(vehicles),
    };
  }, [role, user?.role]);

  const { data, loading, error, refresh } = useResource(loader);

  // Handle URL parameters & default vehicle selection (USER only)
  useEffect(() => {
    const navbarSearch = searchParams.get("search");
    const paramStation = searchParams.get("station");
    const paramVehicle = searchParams.get("vehicle");

    if (navbarSearch !== null && navbarSearch !== query) {
      setQuery(navbarSearch);
    }
    if (paramStation) {
      setSelectedStationId(Number(paramStation));
    }
    if (isUserRole) {
      if (paramVehicle) {
        setSelectedVehicleId(Number(paramVehicle));
      } else if (data?.vehicles?.length && !selectedVehicleId) {
        setSelectedVehicleId(data.vehicles[0].id);
      }
    }
  }, [searchParams, data?.vehicles, isUserRole, selectedVehicleId, query]);

  // Clean up routing request on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Selected vehicle object (USER only)
  const selectedVehicle = useMemo(() => {
    if (!isUserRole || !data?.vehicles?.length) return null;
    return data.vehicles.find((v) => Number(v.id) === Number(selectedVehicleId)) || data.vehicles[0];
  }, [data?.vehicles, selectedVehicleId, isUserRole]);

  // Step 1: Distance & Compatibility enrichment (useMemo)
  const enrichedStations = useMemo(() => {
    if (!data?.stations) return [];
    return data.stations.map((station) => {
      const distance_km =
        userLocation && isValidCoordinate(station.latitude, station.longitude)
          ? calculateDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              station.latitude,
              station.longitude
            )
          : null;

      const stationChargers = (data.chargers || []).filter(
        (charger) => Number(charger.station) === Number(station.id)
      );

      const availableChargersCount = stationChargers.filter(
        (charger) => charger.status === "AVAILABLE"
      ).length;

      const connectorTypes = Array.from(
        new Set(stationChargers.map((c) => c.connector_type).filter(Boolean))
      );

      const compatibility = isUserRole
        ? evaluateStationCompatibility(selectedVehicle, stationChargers)
        : { status: "UNKNOWN", matchingChargers: [], availableMatchingChargers: [] };

      return {
        ...station,
        distance_km,
        available_chargers_count: availableChargersCount,
        total_chargers_count: stationChargers.length,
        connector_types: connectorTypes,
        compatibility_status: compatibility.status,
        matching_chargers_count: compatibility.matchingChargers.length,
        available_matching_chargers_count: compatibility.availableMatchingChargers.length,
        compatible_chargers: compatibility.matchingChargers,
      };
    });
  }, [data?.stations, data?.chargers, userLocation, selectedVehicle, isUserRole]);

  // Step 2 & 3: Filtering & Sorting pipeline (useMemo)
  const filteredStations = useMemo(() => {
    const lowered = query.trim().toLowerCase();

    return enrichedStations
      // Search filter
      .filter(
        (station) =>
          !lowered ||
          [station.station_name, station.city, station.state, station.address].some((val) =>
            val?.toLowerCase().includes(lowered)
          )
      )
      // Status filter
      .filter((station) => statusFilter === "ALL" || station.status === statusFilter)
      // Radius distance filter
      .filter((station) => {
        if (radiusFilter === "ALL") return true;
        const maxKm = Number(radiusFilter);
        return station.distance_km !== null && station.distance_km <= maxKm;
      })
      // Compatibility (USER) vs Connector Type (ADMIN / OPERATOR) filter
      .filter((station) => {
        if (isUserRole) {
          if (compatibilityFilter === "ALL") return true;
          return station.compatibility_status === compatibilityFilter;
        } else {
          if (connectorTypeFilter === "ALL") return true;
          return station.connector_types?.includes(connectorTypeFilter);
        }
      })
      // Sorting
      .sort((a, b) => {
        if (sortBy === "NEAREST") {
          if (a.distance_km === null && b.distance_km === null) return 0;
          if (a.distance_km === null) return 1;
          if (b.distance_km === null) return -1;
          return a.distance_km - b.distance_km;
        }

        if (sortBy === "RATING") {
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          return ratingB - ratingA;
        }

        if (sortBy === "AVAILABILITY") {
          return b.available_chargers_count - a.available_chargers_count;
        }

        if (sortBy === "NAME") {
          return a.station_name.localeCompare(b.station_name);
        }

        // Default: RECOMMENDED (prioritizes vehicle compatibility for USER, or station availability/rating for ADMIN)
        if (isUserRole && selectedVehicle) {
          const rankMap = {
            COMPATIBLE: 1,
            PARTIALLY_COMPATIBLE: 2,
            UNKNOWN: 3,
            NOT_COMPATIBLE: 4,
          };
          const rankA = rankMap[a.compatibility_status] || 3;
          const rankB = rankMap[b.compatibility_status] || 3;
          if (rankA !== rankB) return rankA - rankB;
        }

        if (a.status === "OPEN" && b.status !== "OPEN") return -1;
        if (a.status !== "OPEN" && b.status === "OPEN") return 1;

        if (a.available_chargers_count > 0 && b.available_chargers_count === 0) return -1;
        if (a.available_chargers_count === 0 && b.available_chargers_count > 0) return 1;

        const ratingDiff = Number(b.rating || 0) - Number(a.rating || 0);
        if (Math.abs(ratingDiff) > 0.1) return ratingDiff;

        if (a.distance_km !== null && b.distance_km !== null) {
          const distDiff = a.distance_km - b.distance_km;
          if (Math.abs(distDiff) > 0.1) return distDiff;
        }

        return a.station_name.localeCompare(b.station_name);
      });
  }, [enrichedStations, query, statusFilter, radiusFilter, compatibilityFilter, connectorTypeFilter, sortBy, selectedVehicle, isUserRole]);

  // Find routed station object if active
  const activeRoutedStation = useMemo(() => {
    if (!routedStationId || !data?.stations) return null;
    return data.stations.find((s) => Number(s.id) === Number(routedStationId)) || null;
  }, [routedStationId, data?.stations]);

  // Request user location with clear user feedback
  const handleRequestLocation = async () => {
    setLocationStatus("locating");
    setLocationError("");

    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      setLocationStatus("success");
      toast.success("Location acquired.");
      setViewAction({ type: "recenter", timestamp: Date.now() });
    } catch (err) {
      setLocationStatus(err.code || "error");
      setLocationError(err.message || "Unable to retrieve location.");
      toast.error(err.message || "Location access failed.");
    }
  };

  const handleRecenter = () => {
    if (userLocation) {
      setViewAction({ type: "recenter", timestamp: Date.now() });
    } else {
      handleRequestLocation();
    }
  };

  const handleFitAll = () => {
    setViewAction({ type: "fit_all", timestamp: Date.now() });
  };

  // Route calculation handler
  const handleShowRoute = async (station) => {
    if (!userLocation) {
      toast.info("Use your current location before calculating a route.");
      handleRequestLocation();
      return;
    }

    if (!isValidCoordinate(station.latitude, station.longitude)) {
      toast.error("This station does not have valid map coordinates.");
      return;
    }

    setSelectedStationId(station.id);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setRouteLoading(true);
    setRouteError(null);
    setRoutedStationId(station.id);

    try {
      const result = await routeService.getRouteToStation({
        originLatitude: userLocation.latitude,
        originLongitude: userLocation.longitude,
        destinationLatitude: station.latitude,
        destinationLongitude: station.longitude,
        signal: controller.signal,
      });

      setRouteData(result);
      setRouteTimestamp(Date.now());
      toast.success(`Route calculated to ${station.station_name}.`);
    } catch (err) {
      if (err.code === ROUTE_ERROR_CODES.ROUTE_REQUEST_ABORTED) {
        return;
      }
      setRouteError(err.message || "Failed to calculate route.");
      toast.error(err.message || "Failed to calculate route.");
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setRouteData(null);
    setRouteLoading(false);
    setRouteError(null);
    setRoutedStationId(null);
    toast.info("Route cleared.");
  };

  const handleCardClick = (stationId) => {
    setSelectedStationId(stationId);
    setSearchParams({
      search: query,
      station: String(stationId),
      ...(selectedVehicleId ? { vehicle: String(selectedVehicleId) } : {}),
    });
  };

  const handleSelectStationFromMap = (stationId) => {
    setSelectedStationId(stationId);
    const cardEl = cardRefs.current[stationId];
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handleBookStation = (station) => {
    if (!selectedVehicle) {
      toast.warning("Please select or add a vehicle before reserving.");
      return;
    }
    if (station.compatibility_status !== "COMPATIBLE" || station.available_matching_chargers_count === 0) {
      toast.error("No compatible available chargers at this station.");
      return;
    }
    navigate(`/bookings?station=${station.id}&vehicle=${selectedVehicle.id}`);
  };

  const toggleFavorite = async (station) => {
    const favorite = data.favorites.find(
      (item) => Number(item.station) === Number(station.id)
    );
    try {
      if (favorite) {
        await evService.favorites.remove(favorite.id);
        toast.success("Removed from favourites.");
      } else {
        await evService.favorites.create({ station: station.id });
        toast.success("Station saved to favourites.");
      }
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update favourites."));
    }
  };

  const openStationForm = (station = null) => {
    setSelectedStation(station);
    setStationForm(
      station
        ? Object.fromEntries(
            Object.keys(emptyStation).map((key) => [key, station[key] ?? ""])
          )
        : emptyStation
    );
    setModal("station");
  };

  const saveStation = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (selectedStation) {
        await evService.stations.update(selectedStation.id, stationForm);
        toast.success("Station updated.");
      } else {
        await evService.stations.create(stationForm);
        toast.success("Station created.");
      }
      setModal(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save the station."));
    } finally {
      setSaving(false);
    }
  };

  const deleteStation = async (station) => {
    if (!window.confirm(`Delete station "${station.station_name}"?`)) return;
    try {
      await evService.stations.remove(station.id);
      toast.success("Station deleted.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete station."));
    }
  };

  const openReview = (station) => {
    setSelectedStation(station);
    setReviewForm({ rating: "5", comment: "" });
    setModal("review");
  };

  const saveReview = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await evService.reviews.create({
        station: selectedStation.id,
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment,
      });
      toast.success("Review posted.");
      setModal(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not submit review."));
    } finally {
      setSaving(false);
    }
  };

  const renderLocationButtonLabel = () => {
    if (locationStatus === "locating") return "Locating...";
    if (locationStatus === "success") return "Location Active";
    return "Use My Location";
  };

  const renderCompatibilityBadge = (station) => {
    switch (station.compatibility_status) {
      case "COMPATIBLE":
        return (
          <span className="compatibility-badge compatible" title="Compatible chargers available">
            Compatible now ({station.available_matching_chargers_count} available)
          </span>
        );
      case "PARTIALLY_COMPATIBLE":
        return (
          <span className="compatibility-badge partial" title="Matching connector exists but all matching chargers are occupied/reserved">
            Matching connector unavailable ({station.matching_chargers_count} total, 0 available)
          </span>
        );
      case "NOT_COMPATIBLE":
        return (
          <span className="compatibility-badge incompatible" title="No chargers match vehicle connector type">
            Not compatible (Vehicle requires {selectedVehicle?.connector_type})
          </span>
        );
      case "UNKNOWN":
      default:
        return (
          <span className="compatibility-badge unknown" title="Vehicle connector missing or no charger data">
            Compatibility unknown
          </span>
        );
    }
  };

  const renderStationBadges = (station) => {
    if (isUserRole) {
      return renderCompatibilityBadge(station);
    }
    if (station.connector_types && station.connector_types.length) {
      return (
        <span className="compatibility-badge info" title={`Supported connectors: ${station.connector_types.join(", ")}`}>
          {station.connector_types.join(" · ")}
        </span>
      );
    }
    return null;
  };

  if (loading) return <LoadingState label="Loading stations network..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section className="stations-page-section">
      <PageHeader
        eyebrow={isUserRole ? "Charging network" : "Network Management"}
        title={isUserRole ? "Find a charging station" : "Charging stations"}
        description={
          isUserRole
            ? "Compare vehicle connector compatibility, driving routes, status, ratings and amenities before you reserve."
            : "Review station status, charger availability, location, ratings and network coverage."
        }
        action={
          isOperatorRole ? (
            <button className="primary-button" onClick={() => openStationForm()} type="button">
              <FaPlus /> Add station
            </button>
          ) : null
        }
      />

      {/* Active Vehicle Selector Bar — USER Only */}
      {isUserRole && (
        <div className="vehicle-selector-panel">
          <div className="vehicle-selector-info">
            <FaCar className="vehicle-icon" />
            {data.vehicles.length ? (
              <div>
                <span className="panel-sublabel">Active Vehicle</span>
                <div className="vehicle-select-wrap">
                  <select
                    aria-label="Select active vehicle for compatibility check"
                    className="vehicle-dropdown"
                    onChange={(e) => {
                      setSelectedVehicleId(Number(e.target.value));
                      setSearchParams({
                        search: query,
                        ...(selectedStationId ? { station: String(selectedStationId) } : {}),
                        vehicle: e.target.value,
                      });
                    }}
                    value={selectedVehicleId || ""}
                  >
                    {data.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.brand} {v.model} ({v.registration_number}) · {v.connector_type} · {v.current_battery_percentage}% battery
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <span className="panel-sublabel">Active Vehicle</span>
                <p className="no-vehicle-msg">Add a vehicle to check charger connector compatibility.</p>
              </div>
            )}
          </div>

          {!data.vehicles.length && (
            <button
              className="primary-button compact-btn"
              onClick={() => navigate("/vehicles")}
              type="button"
            >
              <FaPlus /> Add vehicle
            </button>
          )}
        </div>
      )}

      {/* Control Toolbar */}
      <div className="page-toolbar station-toolbar">
        <div className="toolbar-search-group">
          <input
            className="toolbar-input"
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchParams({
                search: event.target.value,
                ...(selectedStationId ? { station: String(selectedStationId) } : {}),
                ...(selectedVehicleId ? { vehicle: String(selectedVehicleId) } : {}),
              });
            }}
            placeholder="Search by station, city or address"
            value={query}
          />
          <select
            className="toolbar-select"
            onChange={(event) => setStatusFilter(event.target.value)}
            value={statusFilter}
            aria-label="Filter by station status"
          >
            <option value="ALL">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="CLOSED">Closed</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {/* Role-based Filter: Vehicle Compatibility for USER vs Connector Type for ADMIN / OPERATOR */}
          {isUserRole ? (
            <select
              className="toolbar-select compatibility-select"
              disabled={!data.vehicles.length}
              onChange={(event) => setCompatibilityFilter(event.target.value)}
              value={compatibilityFilter}
              aria-label="Filter by vehicle compatibility"
            >
              <option value="ALL">Compatibility: All</option>
              <option value="COMPATIBLE">Compatible now</option>
              <option value="PARTIALLY_COMPATIBLE">Matching connector, unavailable</option>
              <option value="NOT_COMPATIBLE">Not compatible</option>
              <option value="UNKNOWN">Unknown</option>
            </select>
          ) : (
            <select
              className="toolbar-select connector-select"
              onChange={(event) => setConnectorTypeFilter(event.target.value)}
              value={connectorTypeFilter}
              aria-label="Filter by connector type"
            >
              <option value="ALL">All connectors</option>
              <option value="Type2">Type2</option>
              <option value="CCS2">CCS2</option>
              <option value="CHAdeMO">CHAdeMO</option>
              <option value="GB/T">GB/T</option>
            </select>
          )}

          {/* Sort Dropdown */}
          <select
            className="toolbar-select sort-select"
            onChange={(event) => setSortBy(event.target.value)}
            value={sortBy}
            aria-label="Sort charging stations"
          >
            <option value="RECOMMENDED">Sort: Recommended</option>
            <option value="NEAREST" disabled={!userLocation}>
              Sort: Nearest first {!userLocation ? "(Location required)" : ""}
            </option>
            <option value="RATING">Sort: Highest rated</option>
            <option value="AVAILABILITY">Sort: Most chargers available</option>
            <option value="NAME">Sort: Name (A–Z)</option>
          </select>

          {/* Distance Radius Filter */}
          <select
            className="toolbar-select radius-select"
            disabled={!userLocation}
            onChange={(event) => setRadiusFilter(event.target.value)}
            value={radiusFilter}
            aria-label="Filter by distance radius"
          >
            <option value="ALL">Distance: All</option>
            <option value="5">Within 5 km</option>
            <option value="10">Within 10 km</option>
            <option value="25">Within 25 km</option>
            <option value="50">Within 50 km</option>
          </select>
        </div>

        <div className="toolbar-map-controls">
          <button
            className={`secondary-button location-btn ${locationStatus === "success" ? "active-location" : ""}`}
            disabled={locationStatus === "locating"}
            onClick={handleRequestLocation}
            type="button"
            aria-label="Use my current location"
          >
            <FaCrosshairs />
            <span>{renderLocationButtonLabel()}</span>
          </button>

          {userLocation && (
            <button
              className="icon-button-badge"
              onClick={handleRecenter}
              title="Recenter to my location"
              type="button"
            >
              <FaCompass />
            </button>
          )}

          <button
            className="icon-button-badge"
            onClick={handleFitAll}
            title="Fit all station markers"
            type="button"
          >
            <FaExpand />
          </button>

          <span className="toolbar-count">
            {filteredStations.length} station{filteredStations.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Location Status Message Banner */}
      {locationError && locationStatus !== "success" && (
        <div className="location-status-banner error" aria-live="polite">
          <p>{locationError}</p>
        </div>
      )}

      {/* Route Error Banner */}
      {routeError && (
        <div className="location-status-banner error" aria-live="polite">
          <p>
            <FaExclamationTriangle /> {routeError}
          </p>
        </div>
      )}

      {/* Active Driving Route Summary Panel */}
      {(routeData || routeLoading) && activeRoutedStation && (
        <div className="route-summary-panel" aria-live="polite" aria-busy={routeLoading}>
          <div className="route-summary-header">
            <div className="route-summary-title">
              <FaDirections className="route-icon-heading" />
              <div>
                <span className="route-eyebrow">Driving Directions</span>
                <h2>{activeRoutedStation.station_name}</h2>
              </div>
            </div>
            <button
              className="route-clear-btn"
              onClick={handleClearRoute}
              type="button"
              aria-label="Clear active route"
            >
              <FaTimes /> Clear route
            </button>
          </div>

          {routeLoading ? (
            <div className="route-summary-loading">
              <span className="loading-spinner-inline" />
              <span>Calculating driving route via OSRM...</span>
            </div>
          ) : (
            <div className="route-summary-details">
              <div className="route-metric-pill">
                <FaRoad />
                <span>
                  <small>Road distance</small>
                  <strong>{routeData.distance_km.toFixed(1)} km</strong>
                </span>
              </div>

              <div className="route-metric-pill">
                <FaClock />
                <span>
                  <small>Est. drive time</small>
                  <strong>{formatDuration(routeData.duration_minutes)}</strong>
                </span>
              </div>

              {activeRoutedStation.distance_km && (
                <div className="route-metric-pill muted">
                  <FaMapMarkerAlt />
                  <span>
                    <small>Straight-line</small>
                    <strong>{formatDistance(activeRoutedStation.distance_km)}</strong>
                  </span>
                </div>
              )}

              <div className="route-summary-actions">
                <a
                  className="secondary-button external-maps-btn"
                  href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${activeRoutedStation.latitude},${activeRoutedStation.longitude}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaExternalLinkAlt /> Open in Maps
                </a>

                {isUserRole &&
                  activeRoutedStation.status === "OPEN" &&
                  activeRoutedStation.compatibility_status === "COMPATIBLE" &&
                  activeRoutedStation.available_matching_chargers_count > 0 && (
                    <button
                      className="primary-button"
                      onClick={() => handleBookStation(activeRoutedStation)}
                      type="button"
                    >
                      Book charger
                    </button>
                  )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mobile Toggle Tabs */}
      <div className="mobile-view-tabs" role="tablist">
        <button
          className={`tab-btn ${mobileMode === "list" ? "active" : ""}`}
          onClick={() => setMobileMode("list")}
          type="button"
          role="tab"
          aria-selected={mobileMode === "list"}
        >
          <FaList /> Station list ({filteredStations.length})
        </button>
        <button
          className={`tab-btn ${mobileMode === "map" ? "active" : ""}`}
          onClick={() => setMobileMode("map")}
          type="button"
          role="tab"
          aria-selected={mobileMode === "map"}
        >
          <FaMap /> Interactive map
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="stations-split-layout">
        {/* Left Side: Cards List */}
        <div className={`stations-list-panel ${mobileMode === "map" ? "mobile-hidden" : ""}`}>
          {filteredStations.length ? (
            <div className="station-card-stack">
              {filteredStations.map((station) => {
                const isFavorite = data.favorites.some(
                  (favorite) => Number(favorite.station) === Number(station.id)
                );
                const reviewCount = data.reviews.filter(
                  (review) => Number(review.station) === Number(station.id)
                ).length;
                const isSelected = Number(station.id) === Number(selectedStationId);
                const isRouted = Number(station.id) === Number(routedStationId);
                const validCoords = isValidCoordinate(station.latitude, station.longitude);
                const formattedDist = formatDistance(station.distance_km);

                const canBook =
                  isUserRole &&
                  selectedVehicle &&
                  station.status === "OPEN" &&
                  station.compatibility_status === "COMPATIBLE" &&
                  station.available_matching_chargers_count > 0;

                return (
                  <article
                    className={`entity-card station-card ${isSelected ? "selected-card" : ""} ${isRouted ? "routed-card" : ""}`}
                    key={station.id}
                    ref={(el) => (cardRefs.current[station.id] = el)}
                    onClick={() => handleCardClick(station.id)}
                  >
                    <div className="entity-card-top">
                      <div className="card-top-left-badges">
                        <StatusBadge value={station.status} />
                        {station.external_source === "OPEN_CHARGE_MAP" && (
                          <span className="ocm-source-badge" title="Source: Open Charge Map">
                            Open Charge Map
                          </span>
                        )}
                        {renderStationBadges(station)}
                        {formattedDist && (
                          <span className="station-distance-badge">
                            <FaMapMarkerAlt /> {formattedDist} away
                          </span>
                        )}
                        {isRouted && (
                          <span className="station-routed-badge">
                            <FaDirections /> Route active
                          </span>
                        )}
                      </div>

                      <div className="card-top-actions">
                        {!validCoords && (
                          <span className="location-unavailable-pill" title="Station missing valid map coordinates">
                            Location unavailable
                          </span>
                        )}
                        {!userLocation && validCoords && (
                          <span className="location-prompt-pill" title="Click 'Use my location' to calculate distance & routes">
                            Distance unavailable
                          </span>
                        )}
                        {isUserRole && (
                          <button
                            className={`favorite-button ${isFavorite ? "active" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(station);
                            }}
                            type="button"
                            aria-label="Toggle favourite"
                          >
                            {isFavorite ? <FaHeart /> : <FaRegHeart />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="entity-card-title">
                      <p>
                        <FaMapMarkerAlt /> {station.city}, {station.state}
                      </p>
                      <h2>{station.station_name}</h2>
                      <span>{station.address}</span>
                      {station.operator_name && (
                        <span className="operator-network-subtext">Network: {station.operator_name}</span>
                      )}
                    </div>

                    <div className="station-availability">
                      <strong>{station.available_chargers_count}</strong>
                      <span>
                        of {station.total_chargers_count} chargers listed
                        {isUserRole && selectedVehicle ? ` (${station.available_matching_chargers_count} match ${selectedVehicle.connector_type})` : ""}
                      </span>
                    </div>

                    {(!station.availability_is_live || station.external_source === "OPEN_CHARGE_MAP") && (
                      <div className="ocm-non-live-notice">
                        <small>
                          <FaExclamationTriangle /> Availability unverified — Live availability not provided by source.
                        </small>
                      </div>
                    )}

                    <div className="entity-details-grid">
                      <div>
                        <span>Rating</span>
                        <strong>
                          <FaStar /> {station.rating} ({reviewCount})
                        </strong>
                      </div>
                      <div>
                        <span>Hours</span>
                        <strong>
                          <FaClock /> {station.opening_time ? `${formatTime(station.opening_time)} – ${formatTime(station.closing_time)}` : "Not specified"}
                        </strong>
                      </div>
                      <div>
                        <span>Phone</span>
                        <strong>
                          <FaPhone /> {station.contact_number || "N/A"}
                        </strong>
                      </div>
                      <div>
                        <span>Source</span>
                        <strong>{station.external_source === "OPEN_CHARGE_MAP" ? "Open Charge Map" : "EV-ChargeX"}</strong>
                      </div>
                    </div>

                    <div className="card-actions" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="secondary-button navigate-action-btn"
                        disabled={!validCoords || routeLoading}
                        onClick={() => handleShowRoute(station)}
                        type="button"
                        aria-label={`Show driving route to ${station.station_name}`}
                      >
                        <FaDirections /> {isRouted ? "Recalculate route" : "Navigate"}
                      </button>

                      {isUserRole && (
                        <button
                          className="primary-button compact-btn"
                          disabled={!canBook || station.booking_enabled === false || station.external_source === "OPEN_CHARGE_MAP"}
                          onClick={() => handleBookStation(station)}
                          type="button"
                          title={
                            station.booking_enabled === false || station.external_source === "OPEN_CHARGE_MAP"
                              ? "Discovery only — direct booking is not yet available at this station."
                              : !selectedVehicle
                              ? "Please select a vehicle"
                              : station.compatibility_status === "NOT_COMPATIBLE"
                              ? `Incompatible connector (Vehicle requires ${selectedVehicle.connector_type})`
                              : station.compatibility_status === "PARTIALLY_COMPATIBLE"
                              ? "Matching connector chargers are currently unavailable"
                              : station.status !== "OPEN"
                              ? "Station is currently closed"
                              : "Book charger"
                          }
                        >
                          {station.booking_enabled === false || station.external_source === "OPEN_CHARGE_MAP" ? "Discovery Only" : "Book charger"}
                        </button>
                      )}


                      {isUserRole && (
                        <button
                          className="secondary-button"
                          onClick={() => openReview(station)}
                          type="button"
                        >
                          <FaStar /> Review
                        </button>
                      )}

                      {(isAdminRole || isOperatorRole) && (
                        <button
                          className="secondary-button"
                          onClick={() => openStationForm(station)}
                          type="button"
                        >
                          <FaEdit /> Edit
                        </button>
                      )}

                      {(isAdminRole || isOperatorRole) && (
                        <button
                          className="danger-button"
                          onClick={() => deleteStation(station)}
                          type="button"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No stations match"
              message="Try another search term, status, connector type, or distance filter."
            />
          )}
        </div>

        {/* Right Side: Map Panel */}
        <div className={`stations-map-panel ${mobileMode === "list" ? "mobile-hidden" : ""}`}>
          <ChargingMap
            stations={filteredStations}
            chargers={data.chargers}
            selectedStationId={selectedStationId}
            routedStationId={routedStationId}
            onSelectStation={handleSelectStationFromMap}
            onBookStation={handleBookStation}
            onNavigateStation={handleShowRoute}
            userLocation={userLocation}
            viewAction={viewAction}
            routeData={routeData}
            routeTimestamp={routeTimestamp}
            selectedVehicle={selectedVehicle}
          />
        </div>
      </div>

      {/* Modals */}
      {modal === "station" && (
        <Modal
          title={selectedStation ? "Edit station" : "Add charging station"}
          description="Accurate coordinates are used for driving route calculation."
          onClose={() => setModal(null)}
          wide
        >
          <form className="form-grid" onSubmit={saveStation}>
            <Field label="Station name" full>
              <input
                name="station_name"
                onChange={(e) =>
                  setStationForm({ ...stationForm, station_name: e.target.value })
                }
                required
                value={stationForm.station_name}
              />
            </Field>
            <Field label="Address" full>
              <textarea
                name="address"
                onChange={(e) =>
                  setStationForm({ ...stationForm, address: e.target.value })
                }
                required
                value={stationForm.address}
              />
            </Field>
            {[
              ["city", "City"],
              ["state", "State"],
              ["pincode", "Pincode"],
              ["latitude", "Latitude (e.g. 23.0225)"],
              ["longitude", "Longitude (e.g. 72.5714)"],
              ["contact_number", "Contact number"],
              ["email", "Email"],
              ["opening_time", "Opening time"],
              ["closing_time", "Closing time"],
            ].map(([name, label]) => (
              <Field key={name} label={label}>
                <input
                  name={name}
                  onChange={(e) =>
                    setStationForm({ ...stationForm, [name]: e.target.value })
                  }
                  required
                  type={
                    name === "email"
                      ? "email"
                      : name.includes("time")
                      ? "time"
                      : "text"
                  }
                  value={stationForm[name]}
                />
              </Field>
            ))}
            <Field label="Status">
              <select
                onChange={(e) =>
                  setStationForm({ ...stationForm, status: e.target.value })
                }
                value={stationForm.status}
              >
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </Field>
            <Field label="Amenities (comma-separated)" full>
              <input
                name="amenities"
                onChange={(e) =>
                  setStationForm({ ...stationForm, amenities: e.target.value })
                }
                placeholder="WiFi, Cafe, Restroom"
                value={stationForm.amenities}
              />
            </Field>
            <FormActions
              loading={saving}
              onCancel={() => setModal(null)}
              submitLabel={selectedStation ? "Update station" : "Create station"}
            />
          </form>
        </Modal>
      )}

      {modal === "review" && (
        <Modal
          title={`Review ${selectedStation?.station_name}`}
          description="Share your feedback to help other EV drivers."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={saveReview}>
            <Field label="Rating">
              <select
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, rating: e.target.value })
                }
                value={reviewForm.rating}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} star{r > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Comment" full>
              <textarea
                onChange={(e) =>
                  setReviewForm({ ...reviewForm, comment: e.target.value })
                }
                placeholder="How was your charging experience?"
                required
                rows={4}
                value={reviewForm.comment}
              />
            </Field>
            <FormActions
              loading={saving}
              onCancel={() => setModal(null)}
              submitLabel="Submit review"
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default StationsPage;
