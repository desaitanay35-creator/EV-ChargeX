import { useEffect, useMemo } from "react";
import { Polyline, useMap } from "react-leaflet";
import L from "leaflet";

/**
 * RouteLayer renders an active driving route polyline on the Leaflet map.
 * Converts GeoJSON [lng, lat] to Leaflet [lat, lng].
 */
function RouteLayer({ geometry, routeTimestamp }) {
  const map = useMap();

  const positions = useMemo(() => {
    if (
      !geometry ||
      geometry.type !== "LineString" ||
      !Array.isArray(geometry.coordinates)
    ) {
      return [];
    }
    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    return geometry.coordinates.map(([lng, lat]) => [Number(lat), Number(lng)]);
  }, [geometry]);

  // Fit bounds to the route whenever a new route geometry is set
  useEffect(() => {
    if (positions.length > 1) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [positions, routeTimestamp, map]);

  if (positions.length < 2) {
    return null;
  }

  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color: "#ff6600",
        weight: 5,
        opacity: 0.85,
        lineCap: "round",
        lineJoin: "round",
      }}
    />
  );
}

export default RouteLayer;
