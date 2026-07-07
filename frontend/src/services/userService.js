import apiClient from './apiClient';
import userDataFallback from '../data/userData.json';

/**
 * GET /api/user/dashboard/
 * Returns aggregated dashboard data: profile, stats, active bookings.
 */
export async function getUserDashboard() {
  try {
    const response = await apiClient.get('/user/dashboard/');
    return response.data;
  } catch (err) {
    console.warn('[userService] Falling back to local dashboard data:', err.message);
    return userDataFallback;
  }
}

/**
 * GET /api/user/vehicles/
 */
export async function getVehicles() {
  try {
    const response = await apiClient.get('/user/vehicles/');
    return response.data;
  } catch (err) {
    console.warn('[userService] Falling back to local vehicle data:', err.message);
    return userDataFallback.vehicles;
  }
}

/**
 * POST /api/user/vehicles/
 */
export async function addVehicle(vehicle) {
  try {
    const response = await apiClient.post('/user/vehicles/', vehicle);
    return response.data;
  } catch (err) {
    console.warn('[userService] Simulating vehicle creation offline:', err.message);
    return { id: `v-${Date.now()}`, ...vehicle };
  }
}

/**
 * GET /api/user/notifications/
 */
export async function getNotifications() {
  try {
    const response = await apiClient.get('/user/notifications/');
    return response.data;
  } catch (err) {
    console.warn('[userService] Falling back to local notification data:', err.message);
    return userDataFallback.notifications;
  }
}

/**
 * GET /api/user/reports/
 */
export async function getReports() {
  try {
    const response = await apiClient.get('/user/reports/');
    return response.data;
  } catch (err) {
    console.warn('[userService] Falling back to local report data:', err.message);
    return userDataFallback.reports;
  }
}
