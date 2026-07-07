import apiClient from './apiClient';
import userDataFallback from '../data/userData.json';

/**
 * POST /api/bookings/
 * Creates a new booking for a station/slot.
 * payload shape:
 * {
 *   stationId, chargerId, vehicleId, date, startTime, endTime
 * }
 */
export async function createBooking(payload) {
  try {
    const response = await apiClient.post('/bookings/', payload);
    return response.data;
  } catch (err) {
    console.warn('[bookingService] Backend unavailable, simulating booking creation:', err.message);
    // Simulated success response so the UI flow can be demoed offline.
    return {
      id: `bk-${Math.floor(Math.random() * 90000 + 10000)}`,
      status: 'CONFIRMED',
      ...payload,
    };
  }
}

/**
 * GET /api/bookings/ (optional convenience, not in the original spec
 * but useful for the dashboard "Upcoming Bookings" list).
 */
export async function getBookings() {
  try {
    const response = await apiClient.get('/bookings/');
    return response.data;
  } catch (err) {
    console.warn('[bookingService] Falling back to local booking data:', err.message);
    return userDataFallback.bookings;
  }
}
