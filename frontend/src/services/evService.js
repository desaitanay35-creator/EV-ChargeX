import api from "./api";

const unwrap = (request) => request.then((response) => response.data);

const collection = (path) => ({
  list: (params) => unwrap(api.get(path, { params })),
  create: (payload) => unwrap(api.post(path, payload)),
  update: (id, payload) => unwrap(api.patch(`${path}${id}/`, payload)),
  remove: (id) => unwrap(api.delete(`${path}${id}/`)),
});

const evService = {
  vehicles: collection("/vehicles/"),
  stations: collection("/stations/"),
  chargers: collection("/charging/chargers/"),
  trips: collection("/trips/"),
  bookings: collection("/bookings/"),
  sessions: collection("/charging/sessions/"),
  payments: collection("/payments/"),
  notifications: collection("/notifications/"),
  favorites: collection("/favorites/"),
  reviews: collection("/reviews/"),

  dashboard: {
    user: () => unwrap(api.get("/dashboard/user/")),
    operator: () => unwrap(api.get("/dashboard/operator/")),
    admin: () => unwrap(api.get("/dashboard/admin/")),
  },

  reports: {
    user: () => unwrap(api.get("/reports/dashboard/")),
    operator: () => unwrap(api.get("/reports/operator-dashboard/")),
    admin: () => unwrap(api.get("/reports/admin-dashboard/")),
  },

  getProfile: () => unwrap(api.get("/auth/profile/")),
  validateBookingQr: (qrCode) =>
    unwrap(api.post("/bookings/validate-qr/", { qr_code: qrCode })),
  startCharging: (bookingId) =>
    unwrap(api.post("/charging/start/", { booking_id: bookingId })),
  stopCharging: (sessionId, batteryAfter) =>
    unwrap(
      api.post("/charging/stop/", {
        session_id: sessionId,
        battery_after: batteryAfter,
      })
    ),
  payNow: (paymentId, paymentMethod) =>
    unwrap(
      api.post("/payments/pay/", {
        payment_id: paymentId,
        payment_method: paymentMethod,
      })
    ),
  predictBattery: (payload) => unwrap(api.post("/ml/battery/", payload)),
  predictWaitTime: (stationId) =>
    unwrap(api.post("/ml/wait-time/", { station_id: stationId })),
};

export const toList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
};

export default evService;
