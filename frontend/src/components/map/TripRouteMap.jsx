import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_MAP_CENTER, isValidCoordinate } from "../../utils/geo";

// Custom Leaflet Markers
const originIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const stationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedStationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -38],
  shadowSize: [41, 41],
});

function MapBoundsController({ origin, destination, polylinePoints, candidateStations = [], reservePoint }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (origin && isValidCoordinate(origin.lat, origin.lng)) {
      points.push([origin.lat, origin.lng]);
    }
    if (destination && isValidCoordinate(destination.lat, destination.lng)) {
      points.push([destination.lat, destination.lng]);
    }
    if (reservePoint && isValidCoordinate(reservePoint.lat, reservePoint.lng)) {
      points.push([reservePoint.lat, reservePoint.lng]);
    }
    if (Array.isArray(polylinePoints) && polylinePoints.length > 0) {
      points.push(...polylinePoints);
    }
    candidateStations.forEach((st) => {
      if (isValidCoordinate(st.latitude, st.longitude)) {
        points.push([Number(st.latitude), Number(st.longitude)]);
      }
    });

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, origin, destination, polylinePoints, candidateStations, reservePoint]);

  return null;
}

function TripRouteMap({
  origin, // { lat, lng, name }
  destination, // { lat, lng, name }
  routeGeometry, // GeoJSON LineString: { coordinates: [[lng, lat], ...] }
  detourGeometry, // GeoJSON LineString for detour via station
  reservePoint, // { lat, lng, distanceKm }
  candidateStations = [],
  selectedStationId,
  onSelectStation,
}) {
  const hasOrigin = origin && isValidCoordinate(origin.lat, origin.lng);
  const hasDestination = destination && isValidCoordinate(destination.lat, destination.lng);

  // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
  const polylinePoints =
    routeGeometry && Array.isArray(routeGeometry.coordinates)
      ? routeGeometry.coordinates.map(([lng, lat]) => [lat, lng])
      : [];

  const detourPolylinePoints =
    detourGeometry && Array.isArray(detourGeometry.coordinates)
      ? detourGeometry.coordinates.map(([lng, lat]) => [lat, lng])
      : [];

  const centerLat = hasOrigin ? origin.lat : DEFAULT_MAP_CENTER.lat;
  const centerLng = hasOrigin ? origin.lng : DEFAULT_MAP_CENTER.lng;

  return (
    <div className="trip-route-map-wrapper" style={{ height: "420px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={DEFAULT_MAP_CENTER.zoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsController
          origin={origin}
          destination={destination}
          polylinePoints={polylinePoints}
          candidateStations={candidateStations}
          reservePoint={reservePoint}
        />

        {/* Origin Marker */}
        {hasOrigin && (
          <Marker position={[origin.lat, origin.lng]} icon={originIcon}>
            <Popup>
              <strong>Starting Point</strong>
              <p>{origin.name || "Origin"}</p>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {hasDestination && (
          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
            <Popup>
              <strong>Destination</strong>
              <p>{destination.name || "Destination"}</p>
            </Popup>
          </Marker>
        )}

        {/* 20% Reserve Point Marker / Target Area */}
        {reservePoint && isValidCoordinate(reservePoint.lat, reservePoint.lng) && (
          <>
            <CircleMarker
              center={[reservePoint.lat, reservePoint.lng]}
              radius={14}
              pathOptions={{ color: "#f97316", fillColor: "#ffedd5", fillOpacity: 0.8, weight: 3 }}
            >
              <Popup>
                <div style={{ padding: "4px" }}>
                  <strong style={{ color: "#c2410c" }}>Recommended Charging Area</strong>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem" }}>
                    Battery predicted to reach ~20% reserve at <strong>{reservePoint.distanceKm} km</strong> along route.
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          </>
        )}

        {/* Direct Route Polyline */}
        {polylinePoints.length > 0 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "#2563eb", weight: 5, opacity: 0.8, lineCap: "round" }}
          />
        )}

        {/* Detour Route Polyline */}
        {detourPolylinePoints.length > 0 && (
          <Polyline
            positions={detourPolylinePoints}
            pathOptions={{ color: "#9333ea", weight: 4, opacity: 0.9, dashArray: "8, 8" }}
          />
        )}

        {/* Candidate Stations Markers */}
        {candidateStations.map((station) => {
          if (!isValidCoordinate(station.latitude, station.longitude)) return null;
          const isSelected = Number(station.id) === Number(selectedStationId);
          return (
            <Marker
              key={station.id}
              position={[Number(station.latitude), Number(station.longitude)]}
              icon={isSelected ? selectedStationIcon : stationIcon}
            >
              <Popup>
                <div className="map-station-popup" style={{ minWidth: "220px" }}>
                  <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{station.station_name}</strong>
                  <p style={{ margin: "2px 0 6px", fontSize: "0.8rem", color: "#64748b" }}>
                    {station.address}, {station.city}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "0.8rem", marginBottom: "8px" }}>
                    <span>⚡ Arrival Battery: <strong>{station.estimatedArrivalBattery}%</strong></span>
                    <span>🛣️ Route Position: <strong>{station.routeProgressKm} km</strong></span>
                    <span>📍 Corridor Distance: <strong>{station.routeProximityKm} km</strong> from route</span>
                    {station.detourKm !== undefined && (
                      <span>🔄 Estimated Detour: <strong>{station.detourKm} km</strong></span>
                    )}
                    <span>🔋 Available Chargers: <strong>{station.availableChargersCount}</strong></span>
                    <span>⭐ Rating: <strong>{station.rating} ★</strong></span>
                  </div>
                  {onSelectStation && (
                    <button
                      className={`primary-button btn-sm ${isSelected ? "selected" : ""}`}
                      onClick={() => onSelectStation(station)}
                      type="button"
                      style={{
                        marginTop: "4px",
                        width: "100%",
                        background: isSelected ? "#eab308" : "#2563eb",
                        color: isSelected ? "#000" : "#fff",
                      }}
                    >
                      {isSelected ? "Stop Selected ✓" : "Select as Charging Stop"}
                    </button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default TripRouteMap;
