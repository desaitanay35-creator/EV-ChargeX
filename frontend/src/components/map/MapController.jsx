import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { isValidCoordinate } from "../../utils/geo";

/**
 * Controller component inside MapContainer to manage programatic pan/zoom/bounds.
 */
function MapController({
  userLocation,
  selectedStation,
  validStations = [],
  viewAction = null,
}) {
  const map = useMap();
  const lastActionTimestampRef = useRef(null);

  // Invalidate size on mount & window resize
  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleResize);
    };
  }, [map]);

  // Handle explicitly triggered map actions (Recenter, Fit all, etc.)
  useEffect(() => {
    if (!viewAction || viewAction.timestamp === lastActionTimestampRef.current) {
      return;
    }

    lastActionTimestampRef.current = viewAction.timestamp;

    if (viewAction.type === "recenter" && userLocation) {
      map.flyTo([userLocation.latitude, userLocation.longitude], 14, {
        duration: 1.2,
      });
    } else if (viewAction.type === "fit_all" && validStations.length > 0) {
      const bounds = L.latLngBounds(
        validStations.map((station) => [
          Number(station.latitude),
          Number(station.longitude),
        ])
      );
      if (userLocation) {
        bounds.extend([userLocation.latitude, userLocation.longitude]);
      }
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [viewAction, userLocation, validStations, map]);

  // Center on selected station when user selects a station card/marker
  useEffect(() => {
    if (
      selectedStation &&
      isValidCoordinate(selectedStation.latitude, selectedStation.longitude)
    ) {
      const lat = Number(selectedStation.latitude);
      const lng = Number(selectedStation.longitude);
      map.flyTo([lat, lng], 15, { duration: 1.0 });
    }
  }, [selectedStation, map]);

  return null;
}

export default MapController;
