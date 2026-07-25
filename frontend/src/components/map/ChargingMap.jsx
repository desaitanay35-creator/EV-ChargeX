import React, { useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import MapController from "./MapController";
import RouteLayer from "./RouteLayer";
import { evaluateStationCompatibility } from "../../utils/connectorCompatibility";
import { DEFAULT_MAP_CENTER, formatDistance, getValidStationCoordinates, isValidCoordinate } from "../../utils/geo";

// Create custom EV-ChargeX Leaflet DivIcon markers
const createStationIcon = (isSelected = false, status = "OPEN", hasRoute = false, compStatus = "UNKNOWN") => {
  const isClosed = status === "CLOSED";
  const isMaint = status === "MAINTENANCE";
  
  let bg = isClosed ? "#ef4444" : isMaint ? "#f59e0b" : "#ff6600";
  if (compStatus === "NOT_COMPATIBLE" && !isClosed && !isMaint) {
    bg = "#64748b"; // Slate gray for incompatible stations
  }

  const border = isSelected || hasRoute ? "#ffffff" : "rgba(255, 255, 255, 0.8)";
  const size = isSelected || hasRoute ? 36 : 30;
  const shadow = hasRoute
    ? "0 0 20px rgba(59, 130, 246, 0.9)"
    : isSelected
    ? "0 0 16px rgba(255, 102, 0, 0.9)"
    : "0 4px 10px rgba(0, 0, 0, 0.4)";

  return L.divIcon({
    className: "custom-station-marker-wrapper",
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bg};
        border: 2px solid ${border};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${shadow};
        transform: translate(-50%, -50%);
        transition: all 0.2s ease;
        cursor: pointer;
      ">
        <svg width="${size * 0.5}" height="${size * 0.5}" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: "custom-user-marker-wrapper",
    html: `
      <div style="
        position: relative;
        width: 24px;
        height: 24px;
        transform: translate(-50%, -50%);
      ">
        <div style="
          position: absolute;
          width: 24px;
          height: 24px;
          background: rgba(59, 130, 246, 0.35);
          border-radius: 50%;
          animation: user-pulse 2s infinite;
        "></div>
        <div style="
          position: absolute;
          top: 4px;
          left: 4px;
          width: 16px;
          height: 16px;
          background: #3b82f6;
          border: 2px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
        "></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
};

function ChargingMap({
  stations = [],
  chargers = [],
  selectedStationId = null,
  routedStationId = null,
  selectedVehicle = null,
  onSelectStation,
  onBookStation,
  onNavigateStation,
  userLocation = null,
  viewAction = null,
  routeData = null,
  routeTimestamp = null,
}) {
  const validStations = useMemo(() => {
    return getValidStationCoordinates(stations);
  }, [stations]);

  const selectedStation = useMemo(() => {
    return validStations.find((s) => Number(s.id) === Number(selectedStationId)) || null;
  }, [validStations, selectedStationId]);

  // Determine initial center
  const initialCenter = useMemo(() => {
    if (userLocation) {
      return [userLocation.latitude, userLocation.longitude];
    }
    if (selectedStation && isValidCoordinate(selectedStation.latitude, selectedStation.longitude)) {
      return [Number(selectedStation.latitude), Number(selectedStation.longitude)];
    }
    if (validStations.length > 0) {
      return [Number(validStations[0].latitude), Number(validStations[0].longitude)];
    }
    return [DEFAULT_MAP_CENTER.lat, DEFAULT_MAP_CENTER.lng];
  }, [userLocation, selectedStation, validStations]);

  return (
    <div className="charging-map-container">
      <MapContainer
        center={initialCenter}
        zoom={DEFAULT_MAP_CENTER.zoom}
        scrollWheelZoom={true}
        style={{ width: "100%", height: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          userLocation={userLocation}
          selectedStation={selectedStation}
          validStations={validStations}
          viewAction={viewAction}
        />

        {/* Driving Route Polyline Layer */}
        <RouteLayer geometry={routeData?.geometry} routeTimestamp={routeTimestamp} />

        {/* User Location Marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createUserIcon()}
          >
            <Popup className="ev-map-popup">
              <div className="popup-content-inner">
                <strong>Your Current Location</strong>
                <p>GPS accuracy: ~{Math.round(userLocation.accuracy || 0)} meters</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Station Markers */}
        {validStations.map((station) => {
          const isSelected = Number(station.id) === Number(selectedStationId);
          const isRouted = Number(station.id) === Number(routedStationId);
          const stationChargers = chargers.filter(
            (c) => Number(c.station) === Number(station.id)
          );
          const availableCount = stationChargers.filter(
            (c) => c.status === "AVAILABLE"
          ).length;

          const comp = evaluateStationCompatibility(selectedVehicle, stationChargers);
          const formattedDist = formatDistance(station.distance_km);

          const canBook =
            availableCount > 0 &&
            station.status === "OPEN" &&
            comp.status === "COMPATIBLE";

          return (
            <Marker
              key={station.id}
              position={[Number(station.latitude), Number(station.longitude)]}
              icon={createStationIcon(isSelected, station.status, isRouted, comp.status)}
              eventHandlers={{
                click: () => {
                  if (onSelectStation) {
                    onSelectStation(station.id);
                  }
                },
              }}
            >
              <Popup className="ev-map-popup">
                <div className="popup-content-inner">
                  <div className="popup-header">
                    <h3>{station.station_name}</h3>
                    <span className={`popup-status-badge status-${station.status?.toLowerCase()}`}>
                      {station.status}
                    </span>
                  </div>
                  <p className="popup-address">{station.address}, {station.city}</p>
                  
                  {selectedVehicle && (
                    <div className={`popup-comp-pill comp-${comp.status.toLowerCase()}`}>
                      {comp.status === "COMPATIBLE"
                        ? `Compatible (${comp.availableMatchingChargers.length} match ${selectedVehicle.connector_type})`
                        : comp.status === "PARTIALLY_COMPATIBLE"
                        ? `Matching unavailable (${comp.matchingChargers.length} total)`
                        : comp.status === "NOT_COMPATIBLE"
                        ? `Not compatible (Requires ${selectedVehicle.connector_type})`
                        : "Compatibility unknown"}
                    </div>
                  )}

                  <div className="popup-metrics">
                    <div>
                      <small>Rating</small>
                      <strong>★ {station.rating ?? "N/A"}</strong>
                    </div>
                    <div>
                      <small>Available</small>
                      <strong>{availableCount} / {stationChargers.length}</strong>
                    </div>
                    {formattedDist && (
                      <div>
                        <small>Distance</small>
                        <strong className="popup-distance-tag">{formattedDist}</strong>
                      </div>
                    )}
                  </div>

                  <div className="popup-actions">
                    {onNavigateStation && userLocation && (
                      <button
                        className="popup-btn navigate-btn"
                        onClick={() => onNavigateStation(station)}
                        type="button"
                      >
                        Navigate
                      </button>
                    )}
                    <button
                      className="popup-btn select-btn"
                      onClick={() => onSelectStation && onSelectStation(station.id)}
                      type="button"
                    >
                      Select
                    </button>
                    {onBookStation && (
                      <button
                        className="popup-btn book-btn"
                        disabled={!canBook}
                        onClick={() => canBook && onBookStation(station)}
                        type="button"
                        title={
                          !canBook
                            ? !selectedVehicle
                              ? "Select a vehicle"
                              : comp.status !== "COMPATIBLE"
                              ? `Incompatible connector (${selectedVehicle.connector_type})`
                              : "No available chargers"
                            : "Book charger"
                        }
                      >
                        Book
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default React.memo(ChargingMap);
