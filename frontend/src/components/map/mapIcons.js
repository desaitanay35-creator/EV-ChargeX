import L from 'leaflet';

/**
 * We build markers with L.divIcon + inline SVG instead of the default
 * Leaflet PNG icons. This sidesteps the well-known Vite/webpack issue
 * where Leaflet's default marker images 404 after bundling, and lets us
 * color markers by station status without shipping extra image assets.
 */
function pin(color) {
  return L.divIcon({
    className: 'ev-map-pin',
    html: `
      <svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.7 23.3 0 15 0z" fill="${color}"/>
        <circle cx="15" cy="15" r="6.5" fill="#ffffff"/>
      </svg>
    `,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
    popupAnchor: [0, -36],
  });
}

export const availableStationIcon = pin('#16a679');
export const busyStationIcon = pin('#dc2626');
export const fastChargerIcon = pin('#2563eb');

export const userLocationIcon = L.divIcon({
  className: 'ev-map-user-pin',
  html: `
    <div style="
      width: 18px; height: 18px; border-radius: 50%;
      background: #2563eb; border: 3px solid white;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.25);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export function getStationIcon(station) {
  if (station.availableSlots <= 0) return busyStationIcon;
  if (station.chargerType?.toLowerCase().includes('fast')) return fastChargerIcon;
  return availableStationIcon;
}
