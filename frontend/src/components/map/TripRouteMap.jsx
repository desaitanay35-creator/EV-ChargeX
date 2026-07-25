import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { DEFAULT_MAP_CENTER, isValidCoordinate } from "../../utils/geo";
import { formatCurrency } from "../../utils/format";

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

function MapBoundsController({ origin, destination, polylinePoints }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (origin && isValidCoordinate(origin.lat, origin.lng)) {
      points.push([origin.lat, origin.lng]);
    }
    if (destination && isValidCoordinate(destination.lat, destination.lng)) {
      points.push([destination.lat, destination.lng]);
    }
    if (Array.isArray(polylinePoints) && polylinePoints.length > 0) {
      points.push(...polylinePoints);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [map, origin, destination, polylinePoints]);

  return null;
}

function TripRouteMap({
  origin, // { lat, lng, name }
  destination, // { lat, lng, name }
  routeGeometry, // GeoJSON LineString: { coordinates: [[lng, lat], ...] }
  suggestedStations = [],
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

  const centerLat = hasOrigin ? origin.lat : DEFAULT_MAP_CENTER.lat;
  const centerLng = hasOrigin ? origin.lng : DEFAULT_MAP_CENTER.lng;

  return (
    <div className="trip-route-map-wrapper" style={{ height: "380px", width: "100%", borderRadius: "12px", overflow: "hidden" }}>
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

        <MapBoundsController origin={origin} destination={destination} polylinePoints={polylinePoints} />

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

        {/* Route Polyline */}
        {polylinePoints.length > 0 && (
          <Polyline
            positions={polylinePoints}
            pathOptions={{ color: "#3b82f6", weight: 5, opacity: 0.8, lineCap: "round" }}
          />
        )}

        {/* Suggested Stations Markers */}
        {suggestedStations.map((station) => {
          if (!isValidCoordinate(station.latitude, station.longitude)) return null;
          const isSelected = Number(station.id) === Number(selectedStationId);
          return (
            <Marker
              key={station.id}
              position={[Number(station.latitude), Number(station.longitude)]}
              icon={stationIcon}
            >
              <Popup>
                <div className="map-station-popup">
                  <strong>{station.station_name}</strong>
                  <p>{station.address}, {station.city}</p>
                  <small>Available Chargers: {station.available_chargers_count ?? "—"}</small>
                  {onSelectStation && (
                    <button
                      className={`primary-button btn-sm ${isSelected ? "selected" : ""}`}
                      onClick={() => onSelectStation(station)}
                      type="button"
                      style={{ marginTop: "8px", width: "100%" }}
                    >
                      {isSelected ? "Selected Stop ✓" : "Select as Charging Stop"}
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
