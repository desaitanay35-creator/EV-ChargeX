import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet';
import StationPopup from './StationPopup.jsx';
import { getStationIcon, userLocationIcon } from './mapIcons.js';
import './StationsMap.css';

const DEFAULT_CENTER = [18.9, 73.1]; // Mumbai-Pune corridor, matches the reference screenshot
const DEFAULT_ZOOM = 8;

/** Recenters the map whenever `center` changes (e.g. after "Use my location"). */
function RecenterOnChange({ center, zoom }) {
  const map = useMap();
  React.useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? map.getZoom(), { duration: 0.8 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function StationsMap({ stations, userPosition, focusPosition, height = '100%' }) {
  return (
    <div className="stations-map-wrapper" style={{ height }}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />

        {stations.map((station) => (
          <Marker
            key={station.id}
            position={[station.lat, station.lng]}
            icon={getStationIcon(station)}
          >
            <Popup>
              <StationPopup station={station} />
            </Popup>
          </Marker>
        ))}

        {userPosition && (
          <Marker position={[userPosition.lat, userPosition.lng]} icon={userLocationIcon}>
            <Popup>You are here</Popup>
          </Marker>
        )}

        {focusPosition && <RecenterOnChange center={[focusPosition.lat, focusPosition.lng]} zoom={12} />}
      </MapContainer>
    </div>
  );
}
