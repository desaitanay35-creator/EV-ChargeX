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
  getCompatibleChargers: (stationId, vehicleId) =>
    unwrap(
      api.get("/charging/compatible/", {
        params: { station_id: stationId, vehicle_id: vehicleId },
      })
    ),

  dashboard: {
    user: () => unwrap(api.get("/dashboard/user/")),
    operator: () => unwrap(api.get("/dashboard/operator/")),
    admin: (range = "6m") => unwrap(api.get("/dashboard/admin/", { params: { range } })),
  },

  reports: {
    user: () => unwrap(api.get("/reports/dashboard/")),
    operator: (range) => unwrap(api.get("/reports/operator-dashboard/", { params: { range } })),
    admin: () => unwrap(api.get("/reports/admin-dashboard/")),
  },

  admin: {
    users: {
      list: (params) => unwrap(api.get("/auth/admin/users/", { params })),
      detail: (id) => unwrap(api.get(`/auth/admin/users/${id}/`)),
      update: (id, payload) => unwrap(api.patch(`/auth/admin/users/${id}/`, payload)),
      block: (id) => unwrap(api.post(`/auth/admin/users/${id}/block/`)),
      unblock: (id) => unwrap(api.post(`/auth/admin/users/${id}/unblock/`)),
      changeRole: (id, role) => unwrap(api.post(`/auth/admin/users/${id}/change-role/`, { role })),
    },
    operators: {
      list: (params) => unwrap(api.get("/auth/admin/operators/", { params })),
      create: (payload) => unwrap(api.post("/auth/admin/operators/", payload)),
      detail: (id) => unwrap(api.get(`/auth/admin/operators/${id}/`)),
    },
    stations: {
      assignOperator: (stationId, operatorId) =>
        unwrap(api.post(`/auth/admin/stations/${stationId}/assign-operator/`, { operator_id: operatorId })),
    },
  },


  getProfile: () => unwrap(api.get("/auth/profile/")),
  markAllNotificationsRead: () => unwrap(api.post("/notifications/mark-all-read/")),
  validateBookingQr: (qrCode) =>
    unwrap(api.post("/bookings/validate-qr/", { qr_code: qrCode })),
  startCharging: (bookingId) =>
    unwrap(api.post("/charging/start/", { booking_id: bookingId })),
  getCompletionPreview: (sessionId) =>
    unwrap(api.get(`/charging/sessions/${sessionId}/completion-preview/`)),
  stopCharging: (payload) =>
    unwrap(
      api.post(
        "/charging/stop/",
        typeof payload === "object" ? payload : { session_id: payload }
      )
    ),
  interruptCharging: (payload) =>
    unwrap(api.post("/charging/interrupt/", payload)),
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
  nearbyStations: (latitude, longitude, distance = 20) =>
  unwrap(
    api.get("/stations/nearby/", {
      params: {
        latitude,
        longitude,
        distance,
      },
    })
  ),
};

export const toList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  return data?.results || [];
};

export default evService;
