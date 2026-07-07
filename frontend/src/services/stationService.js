import apiClient from './apiClient';
import stationsFallback from '../data/stations.json';

/**
 * GET /api/stations/
 * Returns the list of charging stations.
 * Falls back to bundled dummy data when the backend is unreachable,
 * so the frontend remains fully demoable without Django running.
 */
export async function getStations(params = {}) {
  try {
    const response = await apiClient.get('/stations/', { params });
    return response.data;
  } catch (err) {
    console.warn('[stationService] Falling back to local station data:', err.message);
    return stationsFallback;
  }
}

/**
 * GET /api/stations/:id
 * Returns a single station's details.
 */
export async function getStationById(id) {
  try {
    const response = await apiClient.get(`/stations/${id}/`);
    return response.data;
  } catch (err) {
    console.warn('[stationService] Falling back to local station data:', err.message);
    return stationsFallback.find((s) => s.id === id) || null;
  }
}
