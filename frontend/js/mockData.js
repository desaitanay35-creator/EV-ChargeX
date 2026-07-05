/*
  EV-ChargeX Mock Database Layer
  Simulates a backend database storing records for:
  Users, Vehicles, Stations, Chargers, Bookings, Sessions, Trips, Payments, Notifications.
  Uses localStorage for persistence so mutations (bookings, vehicle adds, charger state toggles) feel real.
*/

const SEED_DATA = {
  users: [
    { id: 1, username: "rohan_mehta", email: "rohan@gmail.com", role: "USER", phone: "+91 98765 43210", profile_image: "", city: "Mumbai", state: "Maharashtra", is_verified: true },
    { id: 2, username: "amit_sharma", email: "amit.operator@evchargex.com", role: "OPERATOR", phone: "+91 98123 45678", profile_image: "", city: "Pune", state: "Maharashtra", is_verified: true },
    { id: 3, username: "priya_nair", email: "priya.admin@evchargex.com", role: "ADMIN", phone: "+91 99999 88888", profile_image: "", city: "Mumbai", state: "Maharashtra", is_verified: true }
  ],
  
  vehicles: [
    { id: 1, user_id: 1, vehicle_type: "Car", brand: "Tata", model: "Nexon EV Max", registration_number: "MH-12-UV-4321", battery_capacity: 40.5, current_battery_percentage: 42.0, connector_type: "CCS2", efficiency: 0.14, manufacturing_year: 2023, color: "Intense Teal" },
    { id: 2, user_id: 1, vehicle_type: "Car", brand: "Tesla", model: "Model 3", registration_number: "MH-02-XY-9999", battery_capacity: 75.0, current_battery_percentage: 22.0, connector_type: "CCS2", efficiency: 0.15, manufacturing_year: 2024, color: "Pearl White" },
    { id: 3, user_id: 1, vehicle_type: "Bike", brand: "Ather", model: "450X Gen 4", registration_number: "MH-14-AB-5678", battery_capacity: 3.7, current_battery_percentage: 58.0, connector_type: "Type2", efficiency: 0.03, manufacturing_year: 2023, color: "Space Grey" }
  ],
  
  stations: [
    {
      id: 1,
      operator_id: 2,
      station_name: "GreenDrive Hub - Bandra",
      address: "Linking Road, near National College, Bandra West",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400050",
      latitude: 19.0607,
      longitude: 72.8362,
      opening_time: "06:00",
      closing_time: "23:30",
      contact_number: "+91 22 2640 1234",
      email: "bandra@greendrive.com",
      amenities: "WiFi, Cafe, Washroom, Lounge, CCTV",
      rating: 4.7,
      status: "OPEN",
      chargers: [
        { id: 101, charger_name: "Bandra DC-Fast C1", charger_number: "CH-BND-01", charger_type: "DC", connector_type: "CCS2", power_output_kw: 120, voltage: 400, current: 300, price_per_kwh: 18.50, status: "AVAILABLE" },
        { id: 102, charger_name: "Bandra DC-Fast C2", charger_number: "CH-BND-02", charger_type: "DC", connector_type: "CCS2", power_output_kw: 60, voltage: 400, current: 150, price_per_kwh: 16.00, status: "OCCUPIED" },
        { id: 103, charger_name: "Bandra AC-Slow C3", charger_number: "CH-BND-03", charger_type: "AC", connector_type: "Type2", power_output_kw: 22, voltage: 230, current: 32, price_per_kwh: 11.20, status: "AVAILABLE" },
        { id: 104, charger_name: "Bandra AC-Slow C4", charger_number: "CH-BND-04", charger_type: "AC", connector_type: "Type2", power_output_kw: 7.4, voltage: 230, current: 32, price_per_kwh: 10.00, status: "MAINTENANCE" }
      ]
    },
    {
      id: 2,
      operator_id: 2,
      station_name: "EcoCharge Express - Hinjewadi",
      address: "Phase 1, Main Road, near IT Park Entrance, Hinjewadi",
      city: "Pune",
      state: "Maharashtra",
      pincode: "411057",
      latitude: 18.5913,
      longitude: 73.7389,
      opening_time: "00:00",
      closing_time: "23:59",
      contact_number: "+91 20 4011 5678",
      email: "hinjewadi@ecocharge.in",
      amenities: "Cafe, Washroom, Work Cabin, EV Accessories Shop",
      rating: 4.5,
      status: "OPEN",
      chargers: [
        { id: 201, charger_name: "Hinjewadi Super-DC C1", charger_number: "CH-HJW-01", charger_type: "DC", connector_type: "CCS2", power_output_kw: 150, voltage: 800, current: 200, price_per_kwh: 21.00, status: "AVAILABLE" },
        { id: 202, charger_name: "Hinjewadi DC-Fast C2", charger_number: "CH-HJW-02", charger_type: "DC", connector_type: "GB/T", power_output_kw: 60, voltage: 400, current: 150, price_per_kwh: 15.50, status: "OCCUPIED" },
        { id: 203, charger_name: "Hinjewadi AC-Slow C3", charger_number: "CH-HJW-03", charger_type: "AC", connector_type: "Type2", power_output_kw: 22, voltage: 230, current: 32, price_per_kwh: 11.50, status: "AVAILABLE" }
      ]
    },
    {
      id: 3,
      operator_id: 2,
      station_name: "VoltStation Express - Lonavala",
      address: "Old Mumbai-Pune Highway, near Valvan Dam",
      city: "Lonavala",
      state: "Maharashtra",
      pincode: "410401",
      latitude: 18.7557,
      longitude: 73.4091,
      opening_time: "05:00",
      closing_time: "23:00",
      contact_number: "+91 99887 76655",
      email: "lonavala@voltstation.com",
      amenities: "Food Court, Washroom, Scenic View Lounge, Kids Play Area",
      rating: 4.9,
      status: "OPEN",
      chargers: [
        { id: 301, charger_name: "Lonavala Highway DC C1", charger_number: "CH-LNV-01", charger_type: "DC", connector_type: "CCS2", power_output_kw: 120, voltage: 450, current: 260, price_per_kwh: 19.80, status: "AVAILABLE" },
        { id: 302, charger_name: "Lonavala Highway DC C2", charger_number: "CH-LNV-02", charger_type: "DC", connector_type: "CHAdeMO", power_output_kw: 50, voltage: 400, current: 125, price_per_kwh: 16.50, status: "AVAILABLE" },
        { id: 303, charger_name: "Lonavala AC-Slow C3", charger_number: "CH-LNV-03", charger_type: "AC", connector_type: "Type2", power_output_kw: 11, voltage: 230, current: 16, price_per_kwh: 12.00, status: "AVAILABLE" }
      ]
    },
    {
      id: 4,
      operator_id: 99,
      station_name: "Thunderbolt Arena - Andheri",
      address: "Saki Naka Junction, Andheri East",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400072",
      latitude: 19.1006,
      longitude: 72.8835,
      opening_time: "08:00",
      closing_time: "22:00",
      contact_number: "+91 22 2850 5678",
      email: "andheri@thunderbolt.com",
      amenities: "Washroom, Coffee Vending Machine",
      rating: 4.1,
      status: "MAINTENANCE",
      chargers: [
        { id: 401, charger_name: "Andheri DC C1", charger_number: "CH-AND-01", charger_type: "DC", connector_type: "CCS2", power_output_kw: 50, voltage: 400, current: 125, price_per_kwh: 17.00, status: "MAINTENANCE" },
        { id: 402, charger_name: "Andheri AC C2", charger_number: "CH-AND-02", charger_type: "AC", connector_type: "Type2", power_output_kw: 22, voltage: 230, current: 32, price_per_kwh: 12.00, status: "MAINTENANCE" }
      ]
    }
  ],
  
  bookings: [
    { id: 801, user_id: 1, trip_id: 901, station_id: 1, charger_id: 102, booking_date: "2026-07-04", booking_start_time: "14:00", booking_end_time: "15:00", estimated_duration: 60, booking_status: "COMPLETED", qr_code: "QR_BKN_801", created_at: "2026-07-04T12:00:00Z" },
    { id: 802, user_id: 1, trip_id: 902, station_id: 3, charger_id: 301, booking_date: "2026-07-05", booking_start_time: "16:30", booking_end_time: "17:15", estimated_duration: 45, booking_status: "CONFIRMED", qr_code: "QR_BKN_802", created_at: "2026-07-05T09:30:00Z" }
  ],
  
  sessions: [
    { id: 701, booking_id: 801, charger_id: 102, vehicle_id: 1, start_time: "2026-07-04T14:05:00Z", end_time: "2026-07-04T15:02:00Z", battery_before: 15.0, battery_after: 80.0, energy_consumed_kwh: 26.3, charging_cost: 420.80, session_status: "COMPLETED", created_at: "2026-07-04T14:05:00Z" }
  ],
  
  trips: [
    { id: 901, user_id: 1, vehicle_id: 1, source: "Dadar, Mumbai", source_latitude: 19.0178, source_longitude: 72.8478, destination_latitude: 19.0607, destination_longitude: 72.8362, distance_km: 6.5, estimated_time: 20, estimated_battery_needed: 2.2, suggested_station_id: 1, trip_status: "COMPLETED", start_time: "2026-07-04T13:40:00Z", end_time: "2026-07-04T15:20:00Z", created_at: "2026-07-04T12:00:00Z" },
    { id: 902, user_id: 1, vehicle_id: 2, source: "Bandra, Mumbai", source_latitude: 19.0607, source_longitude: 72.8362, destination_latitude: 18.5913, destination_longitude: 73.7389, distance_km: 142.0, estimated_time: 180, estimated_battery_needed: 28.4, suggested_station_id: 3, trip_status: "PLANNED", start_time: null, end_time: null, created_at: "2026-07-05T09:30:00Z" }
  ],
  
  payments: [
    { id: 601, session_id: 701, user_id: 1, amount: 420.80, payment_method: "UPI", transaction_id: "TXN_987654321EV", payment_status: "SUCCESS", payment_date: "2026-07-04T15:05:00Z", bill_pdf: "bills/invoice_801.pdf", created_at: "2026-07-04T15:05:00Z" }
  ],
  
  notifications: [
    { id: 501, user_id: 1, title: "Booking Confirmed", message: "Your booking for Charger Bandra DC-Fast C1 is confirmed for 2026-07-05 at 16:30.", notification_type: "BOOKING", is_read: false, created_at: "2026-07-05T09:30:00Z" },
    { id: 502, user_id: 1, title: "Payment Successful", message: "Receipt for booking #801 of ₹420.80 has been generated.", notification_type: "PAYMENT", is_read: true, created_at: "2026-07-04T15:06:00Z" },
    { id: 503, user_id: 2, title: "Charger Alert", message: "Charger Bandra AC-Slow C4 was marked as MAINTENANCE by system auto-diag.", notification_type: "SYSTEM", is_read: false, created_at: "2026-07-05T08:15:00Z" }
  ]
};

// Initialize localStorage if empty
const getStoredDB = () => {
  const db = localStorage.getItem("ev_chargex_db");
  if (!db) {
    localStorage.setItem("ev_chargex_db", JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(db);
};

const saveStoredDB = (data) => {
  localStorage.setItem("ev_chargex_db", JSON.stringify(data));
};

export const dbService = {
  // Reset database to seed data
  resetDB() {
    saveStoredDB(SEED_DATA);
    return SEED_DATA;
  },

  // Users
  getUsers() {
    return getStoredDB().users;
  },
  getCurrentUser() {
    // Rohan Mehta is the default driver user
    return this.getUsers().find(u => u.username === "rohan_mehta");
  },
  getOperatorUser() {
    return this.getUsers().find(u => u.username === "amit_sharma");
  },

  // Vehicles
  getVehicles() {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    return db.vehicles.filter(v => v.user_id === currentUser.id);
  },
  addVehicle(vehicleData) {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    const newVehicle = {
      id: db.vehicles.length > 0 ? Math.max(...db.vehicles.map(v => v.id)) + 1 : 1,
      user_id: currentUser.id,
      ...vehicleData,
      created_at: new Date().toISOString()
    };
    db.vehicles.push(newVehicle);
    saveStoredDB(db);
    return newVehicle;
  },
  updateVehicleBattery(vehicleId, newPercentage) {
    const db = getStoredDB();
    const vehicle = db.vehicles.find(v => v.id === parseInt(vehicleId));
    if (vehicle) {
      vehicle.current_battery_percentage = Math.min(100, Math.max(0, parseFloat(newPercentage)));
      saveStoredDB(db);
    }
  },

  // Stations & Chargers
  getStations() {
    return getStoredDB().stations;
  },
  getStationById(id) {
    return this.getStations().find(s => s.id === parseInt(id));
  },
  toggleChargerStatus(stationId, chargerId, newStatus) {
    const db = getStoredDB();
    const station = db.stations.find(s => s.id === parseInt(stationId));
    if (station) {
      const charger = station.chargers.find(c => c.id === parseInt(chargerId));
      if (charger) {
        charger.status = newStatus;
        saveStoredDB(db);
        
        // Add a notification if charger state changed
        if (newStatus === "MAINTENANCE") {
          this.addNotification(2, "Charger Offline", `Charger ${charger.charger_name} at ${station.station_name} requires service.`, "SYSTEM");
        }
        return true;
      }
    }
    return false;
  },

  // Bookings
  getBookings() {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    return db.bookings.map(booking => {
      // populate relationships
      const station = db.stations.find(s => s.id === booking.station_id);
      const charger = station ? station.chargers.find(c => c.id === booking.charger_id) : null;
      const trip = db.trips.find(t => t.id === booking.trip_id);
      return {
        ...booking,
        station,
        charger,
        trip
      };
    });
  },
  addBooking(bookingData) {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    const newBooking = {
      id: db.bookings.length > 0 ? Math.max(...db.bookings.map(b => b.id)) + 1 : 801,
      user_id: currentUser.id,
      booking_status: "CONFIRMED",
      qr_code: `QR_BKN_${Date.now()}`,
      created_at: new Date().toISOString(),
      ...bookingData
    };
    
    db.bookings.push(newBooking);
    
    // Add notification
    const station = db.stations.find(s => s.id === bookingData.station_id);
    const charger = station ? station.chargers.find(c => c.id === bookingData.charger_id) : null;
    this.addNotification(
      currentUser.id,
      "Booking Confirmed",
      `Your booking at ${station ? station.station_name : 'Station'} is confirmed for ${bookingData.booking_date} at ${bookingData.booking_start_time}.`,
      "BOOKING"
    );
    
    // Mark charger as Reserved (in-memory persistent state)
    if (station && charger) {
      const chargerInDb = db.stations.find(s => s.id === station.id).chargers.find(c => c.id === charger.id);
      if (chargerInDb) chargerInDb.status = "RESERVED";
    }

    saveStoredDB(db);
    return newBooking;
  },
  cancelBooking(bookingId) {
    const db = getStoredDB();
    const booking = db.bookings.find(b => b.id === parseInt(bookingId));
    if (booking) {
      booking.booking_status = "CANCELLED";
      
      // Free charger
      const station = db.stations.find(s => s.id === booking.station_id);
      if (station) {
        const charger = station.chargers.find(c => c.id === booking.charger_id);
        if (charger && charger.status === "RESERVED") {
          charger.status = "AVAILABLE";
        }
      }
      
      saveStoredDB(db);
      this.addNotification(booking.user_id, "Booking Cancelled", `Your booking #${booking.id} was successfully cancelled.`, "BOOKING");
      return true;
    }
    return false;
  },

  // Sessions (Live Telemetry Simulation)
  getSessions() {
    const db = getStoredDB();
    return db.sessions;
  },
  getActiveSession() {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    // find if there is an active session for the current user's bookings
    const userBookingIds = db.bookings.filter(b => b.user_id === currentUser.id).map(b => b.id);
    return db.sessions.find(s => s.session_status === "ACTIVE" && userBookingIds.includes(s.booking_id));
  },
  startChargingSession(bookingId, vehicleId) {
    const db = getStoredDB();
    const booking = db.bookings.find(b => b.id === parseInt(bookingId));
    if (!booking) return null;

    // Check if session already active
    const active = this.getActiveSession();
    if (active) return active;

    const newSession = {
      id: db.sessions.length > 0 ? Math.max(...db.sessions.map(s => s.id)) + 1 : 701,
      booking_id: booking.id,
      charger_id: booking.charger_id,
      vehicle_id: parseInt(vehicleId),
      start_time: new Date().toISOString(),
      end_time: null,
      battery_before: parseFloat(db.vehicles.find(v => v.id === parseInt(vehicleId))?.current_battery_percentage || 20),
      battery_after: null,
      energy_consumed_kwh: 0,
      charging_cost: 0,
      session_status: "ACTIVE",
      created_at: new Date().toISOString()
    };

    db.sessions.push(newSession);

    // Update charger status to Occupied
    const station = db.stations.find(s => s.id === booking.station_id);
    if (station) {
      const charger = station.chargers.find(c => c.id === booking.charger_id);
      if (charger) charger.status = "OCCUPIED";
    }

    booking.booking_status = "COMPLETED";

    saveStoredDB(db);
    this.addNotification(booking.user_id, "Charging Started", `Your charging session at ${station?.station_name || 'station'} has started.`, "CHARGING");
    return newSession;
  },
  updateActiveSessionTelemetry(sessionId, energyAdded, costAdded, currentBattery) {
    const db = getStoredDB();
    const session = db.sessions.find(s => s.id === parseInt(sessionId));
    if (session && session.session_status === "ACTIVE") {
      session.energy_consumed_kwh = parseFloat((parseFloat(session.energy_consumed_kwh) + energyAdded).toFixed(2));
      session.charging_cost = parseFloat((parseFloat(session.charging_cost) + costAdded).toFixed(2));
      session.battery_after = parseFloat(parseFloat(currentBattery).toFixed(1));
      
      // Update vehicle charge in db too
      const vehicle = db.vehicles.find(v => v.id === session.vehicle_id);
      if (vehicle) vehicle.current_battery_percentage = session.battery_after;

      saveStoredDB(db);
      return session;
    }
    return null;
  },
  stopChargingSession(sessionId, finalBattery) {
    const db = getStoredDB();
    const session = db.sessions.find(s => s.id === parseInt(sessionId));
    if (session && session.session_status === "ACTIVE") {
      session.session_status = "COMPLETED";
      session.end_time = new Date().toISOString();
      session.battery_after = parseFloat(finalBattery);

      // Create Payment entry
      const booking = db.bookings.find(b => b.id === session.booking_id);
      const transactionId = `TXN_${Math.floor(1000000000 + Math.random() * 9000000000)}EV`;
      
      const newPayment = {
        id: db.payments.length > 0 ? Math.max(...db.payments.map(p => p.id)) + 1 : 601,
        session_id: session.id,
        user_id: booking ? booking.user_id : 1,
        amount: session.charging_cost,
        payment_method: "UPI",
        transaction_id: transactionId,
        payment_status: "SUCCESS",
        payment_date: new Date().toISOString(),
        bill_pdf: `bills/invoice_${session.id}.pdf`,
        created_at: new Date().toISOString()
      };

      db.payments.push(newPayment);

      // Free charger
      if (booking) {
        const station = db.stations.find(s => s.id === booking.station_id);
        if (station) {
          const charger = station.chargers.find(c => c.id === booking.charger_id);
          if (charger) charger.status = "AVAILABLE";
        }
      }

      // Update vehicle percentage
      const vehicle = db.vehicles.find(v => v.id === session.vehicle_id);
      if (vehicle) vehicle.current_battery_percentage = parseFloat(finalBattery);

      saveStoredDB(db);
      this.addNotification(newPayment.user_id, "Charging Session Invoice", `Charging session completed. Receipt of ₹${session.charging_cost} generated.`, "PAYMENT");
      return { session, payment: newPayment };
    }
    return null;
  },

  // Trips & Routing
  getTrips() {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    return db.trips.filter(t => t.user_id === currentUser.id);
  },
  addTrip(tripData) {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    const newTrip = {
      id: db.trips.length > 0 ? Math.max(...db.trips.map(t => t.id)) + 1 : 901,
      user_id: currentUser.id,
      trip_status: "PLANNED",
      created_at: new Date().toISOString(),
      ...tripData
    };
    db.trips.push(newTrip);
    saveStoredDB(db);
    return newTrip;
  },

  // Payments
  getPayments() {
    const db = getStoredDB();
    const currentUser = this.getCurrentUser();
    return db.payments.filter(p => p.user_id === currentUser.id);
  },

  // Notifications
  getNotifications(userId) {
    const db = getStoredDB();
    return db.notifications.filter(n => n.user_id === parseInt(userId)).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  },
  addNotification(userId, title, message, type) {
    const db = getStoredDB();
    const newNotification = {
      id: db.notifications.length > 0 ? Math.max(...db.notifications.map(n => n.id)) + 1 : 501,
      user_id: parseInt(userId),
      title,
      message,
      notification_type: type,
      is_read: false,
      created_at: new Date().toISOString()
    };
    db.notifications.push(newNotification);
    saveStoredDB(db);
    
    // Dispatch system event to notify UI in real-time
    window.dispatchEvent(new CustomEvent("ev_notification", { detail: newNotification }));
    return newNotification;
  },
  markNotificationsAsRead(userId) {
    const db = getStoredDB();
    db.notifications.forEach(n => {
      if (n.user_id === parseInt(userId)) n.is_read = true;
    });
    saveStoredDB(db);
  }
};
