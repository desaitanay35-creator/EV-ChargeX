/*
  EV-ChargeX Main Application Shell & Controller
  Manages state routing, page rendering, modal dialogs, forms validation, and UI triggers.
*/

import { dbService } from "./mockData.js";
import { renderMap } from "./components/map.js";
import { charts } from "./components/charts.js";
import { telemetryService } from "./components/telemetry.js";

// Global Application State
const state = {
  currentRole: "USER", // USER, OPERATOR, ADMIN
  activeTab: "dashboard",
  selectedStationId: 1,
  searchQuery: "",
  filterConnector: "",
  activeSession: null,
  activeBookingId: null,
  bookingForm: {
    vehicleId: "",
    chargerId: "",
    date: "",
    slot: ""
  },
  tripForm: {
    source: "",
    destination: "",
    vehicleId: "",
    tripResult: null
  }
};

// Event Listeners for boot
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // Sync active session if already running in localStorage
  state.activeSession = dbService.getActiveSession();

  // Setup Global Listeners
  setupGlobalListeners();
  
  // Render Sidebar and Layout
  renderSidebar();
  renderPage();

  // Show welcome toast
  showToast("Welcome to EV-ChargeX Management Hub!", "success");

  // Setup Notification Event listener
  window.addEventListener("ev_notification", (e) => {
    showToast(`${e.detail.title}: ${e.detail.message}`, "info");
    // If we are on notifications page or header, re-render to reflect new alert
    renderNotificationsBadge();
    if (state.activeTab === "notifications") {
      renderPage();
    }
  });

  // Telemetry reconnect loop
  if (state.activeSession) {
    reconnectTelemetryLoop();
  }
}

// Global DOM Events setup
function setupGlobalListeners() {
  // Role selector trigger
  const roleSelect = document.getElementById("role-select");
  if (roleSelect) {
    roleSelect.value = state.currentRole;
    roleSelect.addEventListener("change", (e) => {
      switchRole(e.target.value);
    });
  }

  // Window resize to redraw maps and charts
  window.addEventListener("resize", () => {
    triggerSubComponentDraws();
  });
}

function switchRole(newRole) {
  state.currentRole = newRole;
  // Reset tabs depending on role
  if (newRole === "USER") {
    state.activeTab = "dashboard";
  } else if (newRole === "OPERATOR") {
    state.activeTab = "operator-dashboard";
  } else if (newRole === "ADMIN") {
    state.activeTab = "admin-dashboard";
  }
  
  renderSidebar();
  renderPage();
  showToast(`Switched view to ${newRole.charAt(0) + newRole.slice(1).toLowerCase()} Portal`, "success");
}

// Renders the responsive Sidebar items based on the active role
function renderSidebar() {
  const sidebarContainer = document.getElementById("sidebar-container");
  if (!sidebarContainer) return;

  const currentUser = dbService.getCurrentUser();
  const operatorUser = dbService.getOperatorUser();
  const adminUser = dbService.getUsers().find(u => u.role === "ADMIN");

  let profile = currentUser;
  let roleBadge = "EV Driver";
  let navItems = [];

  if (state.currentRole === "USER") {
    profile = currentUser;
    roleBadge = "EV Driver";
    navItems = [
      { id: "dashboard", label: "Dashboard", icon: "📊" },
      { id: "stations", label: "Station Finder", icon: "🗺️" },
      { id: "vehicles", label: "My Vehicles", icon: "🚗" },
      { id: "trips", label: "Route Planner", icon: "🛣️" },
      { id: "payments", label: "Payments & Invoices", icon: "💳" },
      { id: "notifications", label: "Notifications", icon: "🔔" }
    ];
  } else if (state.currentRole === "OPERATOR") {
    profile = operatorUser;
    roleBadge = "Operator";
    navItems = [
      { id: "operator-dashboard", label: "Operator Home", icon: "🏠" },
      { id: "station-manager", label: "Station Manager", icon: "⚙️" },
      { id: "session-logs", label: "Charging Sessions", icon: "⚡" },
      { id: "notifications", label: "Operator Alerts", icon: "🔔" }
    ];
  } else if (state.currentRole === "ADMIN") {
    profile = adminUser;
    roleBadge = "System Admin";
    navItems = [
      { id: "admin-dashboard", label: "Analytics Overview", icon: "📈" },
      { id: "user-manager", label: "User Accounts", icon: "👥" },
      { id: "system-alerts", label: "Broadcast Alerts", icon: "📢" }
    ];
  }

  // Build nav links html
  let navHTML = navItems.map(item => `
    <div class="nav-item ${state.activeTab === item.id ? 'active' : ''}" data-tab="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
    </div>
  `).join("");

  sidebarContainer.innerHTML = `
    <div class="logo-container">
      <div class="logo-icon">⚡</div>
      <div class="logo-text">EV-ChargeX</div>
    </div>
    
    <div class="role-switcher-box">
      <span class="role-switcher-label">Portal Perspective</span>
      <select id="role-select" class="role-select">
        <option value="USER">EV Driver</option>
        <option value="OPERATOR">Station Operator</option>
        <option value="ADMIN">System Admin</option>
      </select>
    </div>

    <div class="sidebar-nav">
      ${navHTML}
    </div>

    <div class="user-profile-widget">
      <div class="profile-avatar">${profile.username.substring(0, 2).toUpperCase()}</div>
      <div class="profile-info">
        <span class="profile-name">${profile.username.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}</span>
        <span class="profile-role-badge">${roleBadge}</span>
      </div>
    </div>
  `;

  // Bind Switch Tab Event Listeners
  const items = sidebarContainer.querySelectorAll(".nav-item");
  items.forEach(el => {
    el.addEventListener("click", () => {
      switchTab(el.getAttribute("data-tab"));
    });
  });

  // Re-bind role select listener
  document.getElementById("role-select").value = state.currentRole;
  document.getElementById("role-select").addEventListener("change", (e) => {
    switchRole(e.target.value);
  });
}

function switchTab(tabId) {
  state.activeTab = tabId;
  // Re-render sidebar active highlight
  const items = document.querySelectorAll(".nav-item");
  items.forEach(item => {
    if (item.getAttribute("data-tab") === tabId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
  renderPage();
}

// Renders the main dashboard body depending on role & selected tab
function renderPage() {
  const mainPanel = document.getElementById("main-panel");
  if (!mainPanel) return;

  // Header Title
  let title = "Dashboard";
  let subtitle = "Welcome to EV-ChargeX";
  
  if (state.currentRole === "USER") {
    const roles = {
      dashboard: ["Overview Dashboard", "Manage charging bookings, check stats, and find stations"],
      stations: ["Station Finder", "Locate charging stations, view real-time status and book slot"],
      vehicles: ["My Vehicles", "Manage registered electric vehicles and check state of charge"],
      trips: ["Route Planner & Trips", "Plan optimal trips, calculate battery needs and discover charging stops"],
      payments: ["Payments & Bills", "Download invoices, view receipts and transaction history"],
      notifications: ["Notifications Feed", "Track your booking updates, payments and system status"]
    };
    [title, subtitle] = roles[state.activeTab] || ["Dashboard", ""];
  } else if (state.currentRole === "OPERATOR") {
    const roles = {
      "operator-dashboard": ["Operator Command Center", "Real-time charger utilization, revenue reports and logging"],
      "station-manager": ["Station Management", "Update charger details, pricing levels and toggle maintenance state"],
      "session-logs": ["Active Sessions & Logs", "Live charge telemetry logs and session records"],
      notifications: ["Operator Alerts & Logs", "Critical hardware exceptions and operator notifications"]
    };
    [title, subtitle] = roles[state.activeTab] || ["Operator Panel", ""];
  } else if (state.currentRole === "ADMIN") {
    const roles = {
      "admin-dashboard": ["Global System Analytics", "Monitor charger performance, user demographics, and revenues"],
      "user-manager": ["User Account Center", "Review and verify registered drivers, operators, and support staffs"],
      "system-alerts": ["Broadcast Announcements", "Dispatch announcements and push notifications to all users"]
    };
    [title, subtitle] = roles[state.activeTab] || ["Admin Console", ""];
  }

  // Base Layout Shell for Main Panel
  mainPanel.innerHTML = `
    <header class="header">
      <div class="header-title-section">
        <h1>${title}</h1>
        <p>${subtitle}</p>
      </div>
      <div class="header-actions">
        <div class="notification-bell" id="header-bell-btn">
          🔔
          <span class="notification-badge" id="header-bell-badge" style="display: none;"></span>
        </div>
      </div>
    </header>
    <div class="dashboard-content" id="dashboard-content-body"></div>
  `;

  // Bind Header actions
  document.getElementById("header-bell-btn").addEventListener("click", () => {
    if (state.currentRole === "USER") switchTab("notifications");
    else if (state.currentRole === "OPERATOR") switchTab("notifications");
  });
  renderNotificationsBadge();

  // Render Inner Content
  const body = document.getElementById("dashboard-content-body");
  if (state.currentRole === "USER") {
    if (state.activeTab === "dashboard") renderDriverDashboard(body);
    else if (state.activeTab === "stations") renderStationFinder(body);
    else if (state.activeTab === "vehicles") renderVehiclesPage(body);
    else if (state.activeTab === "trips") renderTripsPage(body);
    else if (state.activeTab === "payments") renderPaymentsPage(body);
    else if (state.activeTab === "notifications") renderNotificationsPage(body);
  } else if (state.currentRole === "OPERATOR") {
    if (state.activeTab === "operator-dashboard") renderOperatorDashboard(body);
    else if (state.activeTab === "station-manager") renderStationManager(body);
    else if (state.activeTab === "session-logs") renderSessionLogs(body);
    else if (state.activeTab === "notifications") renderNotificationsPage(body);
  } else if (state.currentRole === "ADMIN") {
    if (state.activeTab === "admin-dashboard") renderAdminDashboard(body);
    else if (state.activeTab === "user-manager") renderUserManager(body);
    else if (state.activeTab === "system-alerts") renderSystemAlerts(body);
  }

  // Draw subcomponents (charts, maps, etc.)
  triggerSubComponentDraws();
}

function renderNotificationsBadge() {
  const badge = document.getElementById("header-bell-badge");
  if (!badge) return;
  const user = dbService.getCurrentUser();
  const operator = dbService.getOperatorUser();
  const targetId = state.currentRole === "OPERATOR" ? operator.id : user.id;
  const unreadCount = dbService.getNotifications(targetId).filter(n => !n.is_read).length;
  if (unreadCount > 0) {
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

// Draws Map, Charts, Telemetry when their wrapper DOMs are ready
function triggerSubComponentDraws() {
  // SVG Map Finder page
  const mapDiv = document.getElementById("finder-map-container");
  if (mapDiv) {
    const stations = dbService.getStations().filter(s => {
      // Apply filters
      const matchSearch = s.station_name.toLowerCase().includes(state.searchQuery.toLowerCase()) || s.city.toLowerCase().includes(state.searchQuery.toLowerCase());
      const matchConnector = state.filterConnector === "" || s.chargers.some(c => c.connector_type === state.filterConnector);
      return matchSearch && matchConnector;
    });
    renderMap(mapDiv, stations, state.selectedStationId, (stationId) => {
      selectStation(stationId);
    });
  }

  // Operator charts
  const opChartDiv = document.getElementById("operator-earnings-chart");
  if (opChartDiv) {
    const weeklyData = [
      { Day: "Mon", Earnings: 4800 },
      { Day: "Tue", Earnings: 5900 },
      { Day: "Wed", Earnings: 8400 },
      { Day: "Thu", Earnings: 6200 },
      { Day: "Fri", Earnings: 9100 },
      { Day: "Sat", Earnings: 12500 },
      { Day: "Sun", Earnings: 14800 }
    ];
    charts.renderBarChart(opChartDiv, weeklyData, "Day", "Earnings");
  }

  // Admin line charts
  const adminChartDiv = document.getElementById("admin-growth-chart");
  if (adminChartDiv) {
    const growthData = [
      { Month: "Jan", Sessions: 420 },
      { Month: "Feb", Sessions: 580 },
      { Month: "Mar", Sessions: 790 },
      { Month: "Apr", Sessions: 940 },
      { Month: "May", Sessions: 1200 },
      { Month: "Jun", Sessions: 1650 }
    ];
    charts.renderLineChart(adminChartDiv, growthData, "Month", "Sessions");
  }

  // Telemetry simulator re-draw gauge
  const telemetryGauge = document.getElementById("telemetry-gauge-container");
  if (telemetryGauge && state.activeSession) {
    telemetryService.renderGauge(telemetryGauge, state.activeSession.battery_after || state.activeSession.battery_before);
  }
}

// -------------------------------------------------------------
// EV DRIVER (USER) PORTAL RENDERING TEMPLATES
// -------------------------------------------------------------

function renderDriverDashboard(container) {
  const vehicles = dbService.getVehicles();
  const bookings = dbService.getBookings().filter(b => b.booking_status === "CONFIRMED");
  const completedCount = dbService.getBookings().filter(b => b.booking_status === "COMPLETED").length;
  
  // carbon offset math: ~0.12 kg CO2 saved per kWh charging vs petrol
  const totalKWh = dbService.getSessions().reduce((acc, s) => acc + parseFloat(s.energy_consumed_kwh), 0);
  const carbonOffset = (totalKWh * 0.12).toFixed(1);

  // Widget template for Active charging session
  let liveSessionHTML = "";
  if (state.activeSession) {
    const booking = dbService.getBookings().find(b => b.id === state.activeSession.booking_id);
    const stationName = booking ? booking.station.station_name : "EV Charging Station";
    
    liveSessionHTML = `
      <div class="card" style="border-color: var(--accent); background: linear-gradient(135deg, #ffffff, var(--primary-light));">
        <div class="card-header-row">
          <span class="card-title" style="color: var(--primary)">⚡ Charging Active</span>
          <span class="badge badge-success pulse-ring" style="animation: pulse-animation 2s infinite;">Live</span>
        </div>
        <div class="telemetry-layout">
          <div id="telemetry-gauge-container"></div>
          <div class="telemetry-grid">
            <div class="telemetry-item">
              <span class="telemetry-label">Energy Consumed</span>
              <span class="telemetry-value" id="live-energy">${state.activeSession.energy_consumed_kwh} kWh</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Session Cost</span>
              <span class="telemetry-value" id="live-cost">₹${state.activeSession.charging_cost}</span>
            </div>
            <div class="telemetry-item">
              <span class="telemetry-label">Action</span>
              <button class="btn btn-danger" id="stop-charge-btn" style="padding: 6px 12px; font-size: 12px; width: 100%;">Stop</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Active bookings list
  let upcomingBookingsHTML = `<p style="font-size: 13px; color: var(--text-muted);">No upcoming bookings</p>`;
  if (bookings.length > 0) {
    upcomingBookingsHTML = bookings.map(b => `
      <div class="station-card" style="margin-bottom: 10px;">
        <div class="station-card-header">
          <span class="station-card-title">${b.station.station_name}</span>
          <span class="badge badge-info">Confirmed</span>
        </div>
        <span class="station-address" style="margin: 4px 0;">Charger: ${b.charger.charger_name} (${b.charger.power_output_kw} kW)</span>
        <div class="station-meta-row">
          <div class="station-meta-item">📅 ${b.booking_date}</div>
          <div class="station-meta-item">🕒 ${b.booking_start_time} - ${b.booking_end_time}</div>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 10px;">
          <button class="btn btn-primary btn-start-session" data-booking="${b.id}" style="padding: 6px 12px; font-size: 12px;">Start Charging</button>
          <button class="btn btn-secondary btn-view-ticket" data-booking="${b.id}" style="padding: 6px 12px; font-size: 12px;">View Ticket (QR)</button>
        </div>
      </div>
    `).join("");
  }

  container.innerHTML = `
    <!-- Top Stats Row -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon primary">🚗</div>
        <div class="stat-details">
          <span class="stat-label">My Registered Cars</span>
          <span class="stat-value">${vehicles.length}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon warning">📅</div>
        <div class="stat-details">
          <span class="stat-label">Upcoming Bookings</span>
          <span class="stat-value">${bookings.length}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon blue">⚡</div>
        <div class="stat-details">
          <span class="stat-label">Completed Charges</span>
          <span class="stat-value">${completedCount}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon purple">🌳</div>
        <div class="stat-details">
          <span class="stat-label">CO2 Saved (Est)</span>
          <span class="stat-value">${carbonOffset} kg</span>
        </div>
      </div>
    </div>

    <!-- Main Section Grid -->
    <div class="dashboard-grid-2">
      <!-- Left side: Map and Active widgets -->
      <div style="display: flex; flex-direction: column; gap: 32px;">
        ${liveSessionHTML}
        
        <div class="card">
          <div class="card-header-row">
            <span class="card-title">Nearby EV Chargers</span>
            <button class="btn btn-primary" id="go-to-stations-btn" style="padding: 6px 12px; font-size: 12px;">Search / List Views</button>
          </div>
          <!-- SVG map preview widget -->
          <div id="finder-map-container" style="height: 300px; width:100%; border-radius: var(--radius-md); overflow:hidden;"></div>
        </div>
      </div>

      <!-- Right side: Bookings timeline & Quick Actions -->
      <div style="display: flex; flex-direction: column; gap: 32px;">
        <div class="card">
          <div class="card-header-row">
            <span class="card-title">Active Reservations</span>
          </div>
          <div style="max-height: 400px; overflow-y: auto; padding-right: 4px;">
            ${upcomingBookingsHTML}
          </div>
        </div>

        <div class="card" style="background: linear-gradient(135deg, var(--bg-secondary), var(--accent-light));">
          <span class="card-title" style="margin-bottom: 8px; display: block;">Plan a Trip</span>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4; margin-bottom: 16px;">
            Input a source and destination, we will calculate the distance, expected battery load, and suggest optimal stops.
          </p>
          <button class="btn btn-primary" id="quick-trip-btn" style="width: 100%;">Open Route Planner</button>
        </div>
      </div>
    </div>
  `;

  // Bind Buttons
  const startBtns = container.querySelectorAll(".btn-start-session");
  startBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const bId = btn.getAttribute("data-booking");
      openSessionLauncherModal(bId);
    });
  });

  const ticketBtns = container.querySelectorAll(".btn-view-ticket");
  ticketBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const bId = btn.getAttribute("data-booking");
      openBookingTicketModal(bId);
    });
  });

  if (document.getElementById("stop-charge-btn")) {
    document.getElementById("stop-charge-btn").addEventListener("click", () => {
      stopChargingSession();
    });
  }

  document.getElementById("go-to-stations-btn").addEventListener("click", () => switchTab("stations"));
  document.getElementById("quick-trip-btn").addEventListener("click", () => switchTab("trips"));
}

function renderStationFinder(container) {
  const stations = dbService.getStations();
  const vehicles = dbService.getVehicles();

  // Selected station
  const station = dbService.getStationById(state.selectedStationId) || stations[0];

  // List of stations filter matches
  const filteredStations = stations.filter(s => {
    const matchSearch = s.station_name.toLowerCase().includes(state.searchQuery.toLowerCase()) || s.city.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchConnector = state.filterConnector === "" || s.chargers.some(c => c.connector_type === state.filterConnector);
    return matchSearch && matchConnector;
  });

  let stationsListHTML = filteredStations.map(s => {
    const isSel = s.id === state.selectedStationId;
    let badgeClass = "status-badge-open";
    if (s.status === "CLOSED") badgeClass = "status-badge-closed";
    else if (s.status === "MAINTENANCE") badgeClass = "status-badge-maintenance";

    return `
      <div class="station-card ${isSel ? 'selected' : ''}" data-id="${s.id}">
        <div class="station-card-header">
          <span class="station-card-title">${s.station_name}</span>
          <span class="station-card-status ${badgeClass}">${s.status}</span>
        </div>
        <p class="station-address">${s.address}, ${s.city}</p>
        <div class="station-meta-row">
          <div class="station-meta-item"><span class="rating-star">★</span> ${s.rating}</div>
          <div class="station-meta-item">🔌 ${s.chargers.length} Chargers</div>
          <div class="station-price-tag">₹${s.chargers[0]?.price_per_kwh || 12}/kWh</div>
        </div>
      </div>
    `;
  }).join("");

  if (filteredStations.length === 0) {
    stationsListHTML = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No charging stations match your query.</p>`;
  }

  // Right details side card HTML
  let detailsCardHTML = "";
  if (station) {
    const chargersListHTML = station.chargers.map(c => {
      let badgeType = "badge-success";
      if (c.status === "OCCUPIED") badgeType = "badge-warning";
      else if (c.status === "RESERVED") badgeType = "badge-info";
      else if (c.status === "MAINTENANCE" || c.status === "OUT_OF_SERVICE") badgeType = "badge-danger";

      return `
        <tr>
          <td style="font-weight: 600;">${c.charger_name}</td>
          <td><span class="badge badge-success" style="background:#eef7f0; color:var(--primary); font-size:10px;">${c.charger_type}</span></td>
          <td>${c.connector_type}</td>
          <td><span class="badge badge-success" style="font-size:11px;">${c.power_output_kw} kW</span></td>
          <td>₹${c.price_per_kwh}/kWh</td>
          <td><span class="badge ${badgeType}">${c.status}</span></td>
        </tr>
      `;
    }).join("");

    detailsCardHTML = `
      <div class="card" style="height: 100%; display: flex; flex-direction: column; gap: 16px;">
        <div class="card-header-row">
          <span class="card-title">${station.station_name}</span>
          <button class="btn btn-primary" id="btn-open-book-modal" ${station.status !== "OPEN" ? 'disabled' : ''}>Book a Slot</button>
        </div>
        <p class="station-address" style="font-size: 13px; font-weight: 500;">📍 ${station.address}, ${station.city}, ${station.state} - ${station.pincode}</p>
        
        <div class="station-meta-row" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div class="station-meta-item">☎️ ${station.contact_number}</div>
          <div class="station-meta-item">✉️ ${station.email}</div>
          <div class="station-meta-item">🕒 ${station.opening_time} - ${station.closing_time}</div>
        </div>

        <div style="margin: 4px 0;">
          <span style="font-size: 13px; font-weight: 700; color: var(--dark-slate);">Amenities:</span>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${station.amenities || "None"}</p>
        </div>

        <div class="table-responsive" style="margin-top: auto; flex-grow: 1; max-height: 250px; overflow-y:auto;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Charger</th>
                <th>Type</th>
                <th>Plug</th>
                <th>Power</th>
                <th>Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${chargersListHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="finder-container">
      <!-- Left List Sidebar -->
      <div class="finder-sidebar">
        <div class="search-filter-box">
          <div class="search-input-wrapper">
            <span class="search-icon-svg">🔍</span>
            <input type="text" id="station-search" class="search-input" placeholder="Search by name or city (e.g. Bandra, Lonavala)..." value="${state.searchQuery}">
          </div>
          <div class="filter-tags">
            <span class="filter-tag ${state.filterConnector === '' ? 'active' : ''}" data-filter="">All Plugs</span>
            <span class="filter-tag ${state.filterConnector === 'CCS2' ? 'active' : ''}" data-filter="CCS2">CCS2 (DC Fast)</span>
            <span class="filter-tag ${state.filterConnector === 'Type2' ? 'active' : ''}" data-filter="Type2">Type 2 (AC)</span>
            <span class="filter-tag ${state.filterConnector === 'GB/T' ? 'active' : ''}" data-filter="GB/T">GB/T</span>
            <span class="filter-tag ${state.filterConnector === 'CHAdeMO' ? 'active' : ''}" data-filter="CHAdeMO">CHAdeMO</span>
          </div>
        </div>

        <div class="stations-list">
          ${stationsListHTML}
        </div>
      </div>

      <!-- Right Interactive Map / Details Dashboard -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="map-container" style="flex-grow: 1; min-height: 250px;">
          <div id="finder-map-container" style="width: 100%; height: 100%;"></div>
        </div>
        
        <div style="height: 350px;">
          ${detailsCardHTML}
        </div>
      </div>
    </div>
  `;

  // Bind Listeners
  // Search input change
  const searchInput = document.getElementById("station-search");
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    triggerSubComponentDraws();
    // Re-render list section only
    reRenderStationsList(container);
  });

  // Filter tag buttons
  const filters = container.querySelectorAll(".filter-tag");
  filters.forEach(f => {
    f.addEventListener("click", () => {
      state.filterConnector = f.getAttribute("data-filter");
      // render view again
      renderStationFinder(container);
    });
  });

  // Station card clicks
  const cards = container.querySelectorAll(".station-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      selectStation(id);
      renderStationFinder(container);
    });
  });

  // Book slot modal launcher button
  if (document.getElementById("btn-open-book-modal")) {
    document.getElementById("btn-open-book-modal").addEventListener("click", () => {
      openBookingModal(state.selectedStationId);
    });
  }
}

function reRenderStationsList(container) {
  const filtered = dbService.getStations().filter(s => {
    const matchSearch = s.station_name.toLowerCase().includes(state.searchQuery.toLowerCase()) || s.city.toLowerCase().includes(state.searchQuery.toLowerCase());
    const matchConnector = state.filterConnector === "" || s.chargers.some(c => c.connector_type === state.filterConnector);
    return matchSearch && matchConnector;
  });
  
  const listContainer = container.querySelector(".stations-list");
  if (!listContainer) return;

  let html = filtered.map(s => {
    const isSel = s.id === state.selectedStationId;
    let badgeClass = "status-badge-open";
    if (s.status === "CLOSED") badgeClass = "status-badge-closed";
    else if (s.status === "MAINTENANCE") badgeClass = "status-badge-maintenance";

    return `
      <div class="station-card ${isSel ? 'selected' : ''}" data-id="${s.id}">
        <div class="station-card-header">
          <span class="station-card-title">${s.station_name}</span>
          <span class="station-card-status ${badgeClass}">${s.status}</span>
        </div>
        <p class="station-address">${s.address}, ${s.city}</p>
        <div class="station-meta-row">
          <div class="station-meta-item"><span class="rating-star">★</span> ${s.rating}</div>
          <div class="station-meta-item">🔌 ${s.chargers.length} Chargers</div>
          <div class="station-price-tag">₹${s.chargers[0]?.price_per_kwh || 12}/kWh</div>
        </div>
      </div>
    `;
  }).join("");

  if (filtered.length === 0) {
    html = `<p style="padding: 20px; text-align: center; color: var(--text-muted);">No charging stations match your query.</p>`;
  }

  listContainer.innerHTML = html;

  // rebind clicks
  const cards = listContainer.querySelectorAll(".station-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = parseInt(card.getAttribute("data-id"));
      selectStation(id);
      renderStationFinder(container);
    });
  });
}

function selectStation(stationId) {
  state.selectedStationId = stationId;
  
  // Highlight pin on map directly if possible
  const pins = document.querySelectorAll(".map-marker");
  pins.forEach(pin => pin.classList.remove("active"));
  
  const activePin = document.querySelector(`.map-marker[transform*="translate"]`); // SVG selection
  // Re-draw map and details for safety
  const mapDiv = document.getElementById("finder-map-container");
  if (mapDiv) {
    const stations = dbService.getStations();
    renderMap(mapDiv, stations, state.selectedStationId, (id) => {
      selectStation(id);
      renderPage();
    });
  }
}

function renderVehiclesPage(container) {
  const vehicles = dbService.getVehicles();

  const vehiclesListHTML = vehicles.map(v => {
    let plugType = "⚡ AC Charging Type-2";
    if (v.connector_type === "CCS2") plugType = "⚡ DC CCS2 (Fast Charge)";
    
    const fillPercent = v.current_battery_percentage;
    let trackColor = "var(--primary)";
    if (fillPercent < 20) trackColor = "var(--status-maintenance)";
    else if (fillPercent < 50) trackColor = "var(--status-occupied)";

    return `
      <div class="vehicle-card">
        <div class="vehicle-card-header">
          <span class="vehicle-model-title">${v.brand} ${v.model}</span>
          <span class="vehicle-type-tag">${v.vehicle_type}</span>
        </div>
        <span class="vehicle-reg">${v.registration_number}</span>
        
        <div style="font-size:12px; color:var(--text-muted);">
          <div>Battery Capacity: <strong>${v.battery_capacity} kWh</strong></div>
          <div style="margin-top: 4px;">Plug standard: <strong>${plugType}</strong></div>
        </div>

        <div class="vehicle-battery-meter">
          <div class="meter-header">
            <span>Battery Charge</span>
            <span>${fillPercent}%</span>
          </div>
          <div class="meter-track">
            <div class="meter-fill" style="width: ${fillPercent}%; background: ${trackColor};"></div>
          </div>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 32px;">
      <div class="card-header-row">
        <h2 style="font-size: 20px; font-weight: 800;">My Electric Fleet</h2>
        <button class="btn btn-primary" id="btn-add-vehicle">Add Electric Vehicle</button>
      </div>

      <div class="vehicles-grid">
        ${vehiclesListHTML}
      </div>
    </div>
  `;

  document.getElementById("btn-add-vehicle").addEventListener("click", () => {
    openAddVehicleModal();
  });
}

function renderTripsPage(container) {
  const vehicles = dbService.getVehicles();

  const vehicleOptions = vehicles.map(v => `<option value="${v.id}">${v.brand} ${v.model} (${v.registration_number})</option>`).join("");

  let resultHTML = "";
  if (state.tripForm.tripResult) {
    const tr = state.tripForm.tripResult;
    resultHTML = `
      <div class="trip-result-card">
        <h3 style="font-size: 16px; color: var(--primary-dark);">🚗 Route Generated Successfully</h3>
        
        <div class="trip-meta-box">
          <div>
            <span style="font-size: 12px; color: var(--text-muted); display: block;">Total Distance</span>
            <strong style="font-size: 18px; color: var(--dark-slate);">${tr.distance} km</strong>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted); display: block;">Estimated Time</span>
            <strong style="font-size: 18px; color: var(--dark-slate);">${tr.duration} mins</strong>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted); display: block;">Expected Battery Consumption</span>
            <strong style="font-size: 18px; color: var(--dark-slate);">${tr.batteryNeeded.toFixed(1)}% (${tr.batteryKWh.toFixed(1)} kWh)</strong>
          </div>
          <div>
            <span style="font-size: 12px; color: var(--text-muted); display: block;">Charger plug required</span>
            <strong style="font-size: 18px; color: var(--dark-slate);">${tr.connector}</strong>
          </div>
        </div>

        <div class="suggested-station-box">
          <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; color: var(--primary); letter-spacing: 0.5px; display: block; margin-bottom: 8px;">RECOMMENDED CHARGING STOP</span>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <strong style="font-size: 15px; color: var(--dark-slate); display: block;">${tr.station.station_name}</strong>
              <span style="font-size: 12px; color: var(--text-muted);">${tr.station.address}</span>
            </div>
            <button class="btn btn-primary btn-book-suggested" data-station="${tr.station.id}" style="padding: 6px 12px; font-size:12px;">Book Slot</button>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="route-planner-grid">
      <!-- Left planner input panel -->
      <div class="card" style="height: fit-content;">
        <span class="card-title" style="display: block; margin-bottom: 16px;">Calculate EV Travel Parameters</span>
        <form id="trip-planner-form" style="display: flex; flex-direction: column; gap: 16px;">
          <div class="form-group">
            <label class="form-label">Starting Location</label>
            <input type="text" class="form-control" id="trip-source" placeholder="e.g. Bandra West, Mumbai" required value="${state.tripForm.source}">
          </div>
          <div class="form-group">
            <label class="form-label">Destination</label>
            <input type="text" class="form-control" id="trip-destination" placeholder="e.g. Hinjewadi, Pune" required value="${state.tripForm.destination}">
          </div>
          <div class="form-group">
            <label class="form-label">Vehicle to Use</label>
            <select class="form-control" id="trip-vehicle" required>
              ${vehicleOptions}
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="margin-top: 8px; width: 100%;">Analyze & Map Route</button>
        </form>
      </div>

      <!-- Right Output Maps / Results -->
      <div style="display: flex; flex-direction: column; gap: 24px;">
        ${resultHTML}
        
        <div class="card" style="flex-grow: 1; height: 350px;">
          <span class="card-title" style="margin-bottom: 12px; display: block;">Road Network Map</span>
          <div id="finder-map-container" style="width: 100%; height: calc(100% - 30px); border-radius: var(--radius-md); overflow:hidden;"></div>
        </div>
      </div>
    </div>
  `;

  // Bind events
  const form = document.getElementById("trip-planner-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    calculateTripRoute();
  });

  if (state.tripForm.tripResult) {
    container.querySelector(".btn-book-suggested").addEventListener("click", (e) => {
      const sId = e.target.getAttribute("data-station");
      openBookingModal(sId);
    });
  }
}

function calculateTripRoute() {
  const source = document.getElementById("trip-source").value;
  const destination = document.getElementById("trip-destination").value;
  const vehicleId = parseInt(document.getElementById("trip-vehicle").value);

  const vehicles = dbService.getVehicles();
  const vehicle = vehicles.find(v => v.id === vehicleId);

  // Simple simulator for route details: Mumbai-Pune highway route mapping
  const isPuneExpress = destination.toLowerCase().includes("pune") || destination.toLowerCase().includes("hinjewadi");
  const distance = isPuneExpress ? 148 : 28; // km
  const duration = isPuneExpress ? 180 : 45; // minutes
  
  // consumption based on efficiency
  const batteryKWh = distance * parseFloat(vehicle.efficiency);
  const batteryNeeded = (batteryKWh / parseFloat(vehicle.battery_capacity)) * 100;

  // Suggested stops: if Pune route, suggest Lonavala (station 3), else suggest Bandra (station 1)
  const stationId = isPuneExpress ? 3 : 1;
  const station = dbService.getStationById(stationId);

  state.tripForm.source = source;
  state.tripForm.destination = destination;
  state.tripForm.vehicleId = vehicleId;
  state.tripForm.tripResult = {
    distance,
    duration,
    batteryKWh,
    batteryNeeded,
    connector: vehicle.connector_type,
    station
  };

  // Add a Trip database log
  dbService.addTrip({
    vehicle_id: vehicleId,
    source,
    distance_km: distance,
    estimated_time: duration,
    estimated_battery_needed: batteryNeeded,
    suggested_station_id: stationId
  });

  renderPage();
  showToast("Optimal EV charging nodes highlighted on route map!", "success");
}

function renderPaymentsPage(container) {
  const payments = dbService.getPayments();

  const rows = payments.map(p => `
    <tr>
      <td style="font-weight: 700; font-family: monospace;">${p.transaction_id}</td>
      <td>Session #${p.session_id}</td>
      <td>₹${p.amount}</td>
      <td><span class="badge badge-success">${p.payment_method}</span></td>
      <td>${new Date(p.payment_date).toLocaleString()}</td>
      <td><span class="badge badge-success" style="background:#eefdf5; color:var(--primary);">${p.payment_status}</span></td>
      <td><button class="btn btn-secondary btn-download-bill" data-txn="${p.id}" style="padding: 4px 8px; font-size:11px;">PDF Invoice</button></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="card">
      <span class="card-title" style="display: block; margin-bottom: 20px;">Billing Receipts & History</span>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Reference</th>
              <th>Amount Paid</th>
              <th>Method</th>
              <th>Timestamp</th>
              <th>Status</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No payment invoices found.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Bind bill downloads
  const btns = container.querySelectorAll(".btn-download-bill");
  btns.forEach(btn => {
    btn.addEventListener("click", () => {
      showToast("Downloading tax invoice receipt in PDF format...", "success");
    });
  });
}

function renderNotificationsPage(container) {
  const user = dbService.getCurrentUser();
  const operator = dbService.getOperatorUser();
  const targetId = state.currentRole === "OPERATOR" ? operator.id : user.id;

  const notifications = dbService.getNotifications(targetId);

  // Mark all read when visiting
  dbService.markNotificationsAsRead(targetId);
  renderNotificationsBadge();

  const listHTML = notifications.map(n => {
    let typeIcon = "🔔";
    if (n.notification_type === "BOOKING") typeIcon = "📅";
    else if (n.notification_type === "CHARGING") typeIcon = "⚡";
    else if (n.notification_type === "PAYMENT") typeIcon = "💳";
    else if (n.notification_type === "SYSTEM") typeIcon = "⚙️";

    return `
      <div class="notification-item ${!n.is_read ? 'unread' : ''}">
        <div class="notification-icon-box">${typeIcon}</div>
        <div class="notification-details">
          <span class="notification-title">${n.title}</span>
          <span class="notification-desc">${n.message}</span>
          <span class="notification-time">${new Date(n.created_at).toLocaleString()}</span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card" style="max-width: 700px; margin: 0 auto; width: 100%;">
      <span class="card-title" style="display: block; margin-bottom: 20px;">System Inbox</span>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${listHTML.length > 0 ? listHTML : `<p style="text-align: center; padding: 40px; color: var(--text-muted);">Inbox is empty</p>`}
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// STATION OPERATOR PORTAL RENDERING TEMPLATES
// -------------------------------------------------------------

function renderOperatorDashboard(container) {
  const stations = dbService.getStations();
  const operatorStations = stations.filter(s => s.operator_id === 2);
  const totalChargers = operatorStations.reduce((acc, s) => acc + s.chargers.length, 0);
  
  // count active sessions at operator stations
  const activeSessions = dbService.getSessions().filter(s => {
    if (s.session_status !== "ACTIVE") return false;
    const chargerStation = stations.find(st => st.chargers.some(ch => ch.id === s.charger_id));
    return chargerStation ? chargerStation.operator_id === 2 : false;
  }).length;

  container.innerHTML = `
    <!-- Top Stats -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon primary">🏢</div>
        <div class="stat-details">
          <span class="stat-label">Stations Managed</span>
          <span class="stat-value">${operatorStations.length}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon purple">🔌</div>
        <div class="stat-details">
          <span class="stat-label">Total Connected Plugs</span>
          <span class="stat-value">${totalChargers}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon warning">⚡</div>
        <div class="stat-details">
          <span class="stat-label">Active Charging Sessions</span>
          <span class="stat-value">${activeSessions}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon blue">💰</div>
        <div class="stat-details">
          <span class="stat-label">Weekly Net Revenues</span>
          <span class="stat-value">₹61,300</span>
        </div>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="dashboard-grid-2">
      <!-- Left side: SVG Earnings Chart -->
      <div class="card">
        <span class="card-title">Earnings Distribution (Last 7 Days)</span>
        <div id="operator-earnings-chart" class="chart-container"></div>
      </div>

      <!-- Right side: Station occupancy metrics -->
      <div class="card" style="display: flex; flex-direction: column; gap: 16px;">
        <span class="card-title">My Hubs Status</span>
        
        <div style="display: flex; flex-direction: column; gap: 14px; margin-top: 10px;">
          ${operatorStations.map(s => {
            const availCount = s.chargers.filter(c => c.status === "AVAILABLE").length;
            const occupCount = s.chargers.filter(c => c.status === "OCCUPIED").length;
            const maintCount = s.chargers.filter(c => c.status === "MAINTENANCE" || c.status === "OUT_OF_SERVICE").length;
            const utilization = ((occupCount / s.chargers.length) * 100).toFixed(0);

            return `
              <div style="border-bottom: 1px solid var(--border-light); padding-bottom: 12px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
                  <strong style="font-size: 15px; color: var(--dark-slate);">${s.station_name}</strong>
                  <span class="badge badge-success" style="font-size:10px;">${utilization}% Load</span>
                </div>
                <div style="display:flex; gap: 12px; font-size:12px; color: var(--text-muted);">
                  <span>🟢 Available: ${availCount}</span>
                  <span>🟠 Occupied: ${occupCount}</span>
                  <span>🔴 Offline: ${maintCount}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderStationManager(container) {
  const stations = dbService.getStations();
  const operatorStations = stations.filter(s => s.operator_id === 2);

  // List of chargers with toggle triggers
  let hubsHTML = operatorStations.map(s => {
    const chargersHTML = s.chargers.map(c => {
      let selectAvailable = c.status === "AVAILABLE" ? "selected" : "";
      let selectOccupied = c.status === "OCCUPIED" ? "selected" : "";
      let selectMaintenance = c.status === "MAINTENANCE" ? "selected" : "";

      return `
        <tr data-station="${s.id}" data-charger="${c.id}">
          <td style="font-weight: 700; color: var(--dark-slate);">${c.charger_name}</td>
          <td><span class="badge badge-success" style="background:#eef7f0; color:var(--primary); font-size:10px;">${c.charger_type}</span></td>
          <td>${c.connector_type}</td>
          <td><strong>${c.power_output_kw} kW</strong></td>
          <td>₹${c.price_per_kwh}/kWh</td>
          <td>
            <select class="form-control charger-status-select" style="padding: 4px 8px; font-size:12px; width:130px;">
              <option value="AVAILABLE" ${selectAvailable}>🟢 Available</option>
              <option value="OCCUPIED" ${selectOccupied}>🟠 Occupied</option>
              <option value="MAINTENANCE" ${selectMaintenance}>🔴 Maintenance</option>
            </select>
          </td>
        </tr>
      `;
    }).join("");

    return `
      <div class="card" style="margin-bottom: 24px;">
        <span class="card-title" style="display: block; margin-bottom: 12px;">${s.station_name}</span>
        <p class="station-address" style="margin-bottom: 16px;">📍 ${s.address}</p>
        
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Charger Node</th>
                <th>Type</th>
                <th>Plug standard</th>
                <th>Capacity</th>
                <th>Unit Price</th>
                <th>Hardware Status</th>
              </tr>
            </thead>
            <tbody>
              ${chargersHTML}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div style="display: flex; flex-direction: column;">
      <h2 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">Manage Chargers & Pricing</h2>
      ${hubsHTML}
    </div>
  `;

  // Bind status changes
  const selectors = container.querySelectorAll(".charger-status-select");
  selectors.forEach(sel => {
    sel.addEventListener("change", (e) => {
      const tr = sel.closest("tr");
      const sId = tr.getAttribute("data-station");
      const cId = tr.getAttribute("data-charger");
      const newStatus = e.target.value;

      dbService.toggleChargerStatus(sId, cId, newStatus);
      showToast("Charger hardware status updated successfully!", "success");
    });
  });
}

function renderSessionLogs(container) {
  // Populate all sessions globally for operator
  const sessions = dbService.getSessions();
  const stations = dbService.getStations();
  const vehicles = dbService.getVehicles();

  const rows = sessions.map(s => {
    const booking = dbService.getBookings().find(b => b.id === s.booking_id);
    const stationName = booking ? booking.station.station_name : "Unknown Hub";
    const chargerName = booking ? booking.charger.charger_name : "Charger Node";

    let badgeClass = "badge-success";
    if (s.session_status === "ACTIVE") badgeClass = "badge-warning";
    else if (s.session_status === "INTERRUPTED") badgeClass = "badge-danger";

    return `
      <tr>
        <td style="font-weight: 700;">#SESS-${s.id}</td>
        <td><strong>${stationName}</strong> (${chargerName})</td>
        <td>${new Date(s.start_time).toLocaleString()}</td>
        <td>${s.end_time ? new Date(s.end_time).toLocaleString() : "Running..."}</td>
        <td>${s.battery_before}% ➜ ${s.battery_after ? s.battery_after + '%' : 'Charging...'}</td>
        <td>${s.energy_consumed_kwh} kWh</td>
        <td>₹${s.charging_cost}</td>
        <td><span class="badge ${badgeClass}">${s.session_status}</span></td>
      </tr>
    `;
  }).join("");

  container.innerHTML = `
    <div class="card">
      <span class="card-title" style="display: block; margin-bottom: 20px;">Global Charging Sessions Registry</span>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>Location Station</th>
              <th>Started At</th>
              <th>Ended At</th>
              <th>Battery delta</th>
              <th>Energy Consumed</th>
              <th>Charging Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length > 0 ? rows : `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No charging session history.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// -------------------------------------------------------------
// SUPER ADMIN PORTAL RENDERING TEMPLATES
// -------------------------------------------------------------

function renderAdminDashboard(container) {
  const users = dbService.getUsers();
  const stations = dbService.getStations();
  const sessions = dbService.getSessions();
  const bookingsCount = dbService.getBookings().length;

  container.innerHTML = `
    <!-- Top Stats Grid -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon primary">👥</div>
        <div class="stat-details">
          <span class="stat-label">Registered Accounts</span>
          <span class="stat-value">${users.length}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon warning">⚡</div>
        <div class="stat-details">
          <span class="stat-label">Total Station Nodes</span>
          <span class="stat-value">${stations.length}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon blue">📅</div>
        <div class="stat-details">
          <span class="stat-label">Accumulated Bookings</span>
          <span class="stat-value">${bookingsCount}</span>
        </div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon purple">🌳</div>
        <div class="stat-details">
          <span class="stat-label">Global utilization</span>
          <span class="stat-value">62%</span>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dashboard-grid-2">
      <div class="card">
        <span class="card-title">System-wide Charging Load (Sessions/Month)</span>
        <div id="admin-growth-chart" class="chart-container"></div>
      </div>

      <div class="card">
        <span class="card-title">Database Model Integrity Checks</span>
        <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
            <span>accounts.User model sync</span>
            <strong style="color: var(--primary);">SYNCED (3 rows)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
            <span>stations.Station model sync</span>
            <strong style="color: var(--primary);">SYNCED (4 rows)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
            <span>bookings.Booking model sync</span>
            <strong style="color: var(--primary);">SYNCED (2 rows)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:13px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;">
            <span>charging.Charger model sync</span>
            <strong style="color: var(--primary);">SYNCED (12 rows)</strong>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderUserManager(container) {
  const users = dbService.getUsers();

  const rows = users.map(u => `
    <tr>
      <td style="font-weight: 700;">#UID-${u.id}</td>
      <td><strong>${u.username}</strong></td>
      <td>${u.email}</td>
      <td>${u.phone || "N/A"}</td>
      <td><span class="badge badge-info">${u.role}</span></td>
      <td>${u.city || "Mumbai"}</td>
      <td><span class="badge badge-success">${u.is_verified ? "Verified" : "Pending"}</span></td>
    </tr>
  `).join("");

  container.innerHTML = `
    <div class="card">
      <span class="card-title" style="display: block; margin-bottom: 20px;">System Users Registry</span>
      
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Username</th>
              <th>Email Address</th>
              <th>Phone Number</th>
              <th>System Role</th>
              <th>Region</th>
              <th>Verification Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSystemAlerts(container) {
  container.innerHTML = `
    <div class="card" style="max-width: 600px; margin: 0 auto; width:100%;">
      <span class="card-title" style="display: block; margin-bottom: 16px;">Broadcast Global System Announcement</span>
      <form id="broadcast-alert-form" style="display: flex; flex-direction: column; gap: 16px;">
        <div class="form-group">
          <label class="form-label">Alert Header/Title</label>
          <input type="text" class="form-control" id="alert-title" placeholder="e.g. Server Maintenance or Charger Upgrades" required>
        </div>
        <div class="form-group">
          <label class="form-label">Alert Message Body</label>
          <textarea class="form-control" id="alert-message" rows="4" placeholder="Input alert details description here..." required></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Notification Type Category</label>
          <select class="form-control" id="alert-type" required>
            <option value="SYSTEM">System Alert</option>
            <option value="REMINDER">Booking Reminder</option>
            <option value="PAYMENT">Payment Update</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-top: 8px;">Publish Broadcast Notification</button>
      </form>
    </div>
  `;

  // Bind Submit
  const form = document.getElementById("broadcast-alert-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const title = document.getElementById("alert-title").value;
    const msg = document.getElementById("alert-message").value;
    const type = document.getElementById("alert-type").value;

    // Notify Driver (Rohan)
    dbService.addNotification(1, title, msg, type);
    // Notify Operator (Amit)
    dbService.addNotification(2, title, msg, type);

    form.reset();
    showToast("Announcement broadcasted to all portal accounts!", "success");
  });
}

// -------------------------------------------------------------
// MODALS CONTROLLERS (BOOKING, LAUNCH TELEMETRY, ADD VEHICLES)
// -------------------------------------------------------------

function openBookingModal(stationId) {
  const station = dbService.getStationById(stationId);
  const vehicles = dbService.getVehicles();

  // Pick default vehicle
  const defaultVehicleId = vehicles.length > 0 ? vehicles[0].id : "";
  state.bookingForm.vehicleId = defaultVehicleId;
  state.bookingForm.chargerId = station.chargers[0]?.id || "";
  state.bookingForm.date = new Date().toISOString().split("T")[0];
  state.bookingForm.slot = "10:00 - 11:00";

  // Build chargers selections cards HTML
  const chargersHTML = station.chargers.map(c => `
    <div class="charger-select-card ${state.bookingForm.chargerId === c.id ? 'selected' : ''}" data-id="${c.id}">
      <div class="charger-select-header">
        <span class="charger-select-name">${c.charger_name}</span>
        <span class="charger-badge-kw">${c.power_output_kw} kW</span>
      </div>
      <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Type: ${c.charger_type} (${c.connector_type})</div>
      <div class="charger-select-price">₹${c.price_per_kwh}/kWh</div>
    </div>
  `).join("");

  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("class", "modal-overlay");
  modalOverlay.setAttribute("id", "booking-modal");

  modalOverlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2 style="font-size: 18px;">Reserve Charging Slot</h2>
        <button class="btn-icon" id="close-booking-modal-btn">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Select EV Car/Bike</label>
          <select class="form-control" id="booking-vehicle-select">
            ${vehicles.map(v => `<option value="${v.id}">${v.brand} ${v.model} (${v.registration_number})</option>`).join("")}
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Choose Charger Outlet</label>
          <div class="charger-grid">
            ${chargersHTML}
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Select Date</label>
          <input type="date" class="form-control" id="booking-date-input" value="${state.bookingForm.date}">
        </div>

        <div class="form-group">
          <label class="form-label">Available Time Slots</label>
          <div class="slots-timeline">
            <span class="slot-btn selected" data-slot="10:00 - 11:00">10:00 AM</span>
            <span class="slot-btn" data-slot="11:30 - 12:30">11:30 AM</span>
            <span class="slot-btn occupied" data-slot="13:00 - 14:00">01:00 PM</span>
            <span class="slot-btn" data-slot="14:30 - 15:30">02:30 PM</span>
            <span class="slot-btn" data-slot="16:00 - 17:00">04:00 PM</span>
            <span class="slot-btn" data-slot="17:30 - 18:30">05:30 PM</span>
            <span class="slot-btn occupied" data-slot="19:00 - 20:00">07:00 PM</span>
            <span class="slot-btn" data-slot="20:30 - 21:30">08:30 PM</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-booking-btn">Cancel</button>
        <button class="btn btn-primary" id="confirm-booking-btn">Confirm Reservation</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Bind interactions inside modal
  const closeModal = () => modalOverlay.remove();
  document.getElementById("close-booking-modal-btn").addEventListener("click", closeModal);
  document.getElementById("cancel-booking-btn").addEventListener("click", closeModal);

  // Charger card click selectors
  const chargerCards = modalOverlay.querySelectorAll(".charger-select-card");
  chargerCards.forEach(card => {
    card.addEventListener("click", () => {
      chargerCards.forEach(c => c.classList.remove("selected"));
      card.classList.add("selected");
      state.bookingForm.chargerId = parseInt(card.getAttribute("data-id"));
    });
  });

  // Slot buttons click selector
  const slotBtns = modalOverlay.querySelectorAll(".slot-btn:not(.occupied)");
  slotBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      slotBtns.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      state.bookingForm.slot = btn.getAttribute("data-slot");
    });
  });

  // Confirm booking action
  document.getElementById("confirm-booking-btn").addEventListener("click", () => {
    const vehId = parseInt(document.getElementById("booking-vehicle-select").value);
    const date = document.getElementById("booking-date-input").value;
    const startT = state.bookingForm.slot.split(" - ")[0];
    const endT = state.bookingForm.slot.split(" - ")[1];

    dbService.addBooking({
      station_id: parseInt(stationId),
      charger_id: parseInt(state.bookingForm.chargerId),
      trip_id: 902, // dummy trip link
      booking_date: date,
      booking_start_time: startT,
      booking_end_time: endT,
      estimated_duration: 60
    });

    closeModal();
    renderPage();
    showToast("Booking successful! Receipt generated.", "success");
  });
}

function openBookingTicketModal(bookingId) {
  const booking = dbService.getBookings().find(b => b.id === parseInt(bookingId));
  if (!booking) return;

  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("class", "modal-overlay");
  modalOverlay.setAttribute("id", "ticket-modal");

  modalOverlay.innerHTML = `
    <div class="modal-content" style="max-width: 480px;">
      <div class="modal-header">
        <h2 style="font-size: 18px;">Reservation QR Code Ticket</h2>
        <button class="btn-icon" id="close-ticket-modal-btn">✕</button>
      </div>
      <div class="modal-body" style="gap: 16px;">
        <div class="ticket-container">
          <div class="ticket-info">
            <strong style="font-size: 16px; color: var(--primary-dark); display:block;">Booking Ticket</strong>
            <span style="font-size: 12px; color: var(--text-muted); margin-top:2px;">Ticket ID: #BKN-${booking.id}</span>
            <div style="font-size: 13px; color: var(--dark-slate); margin-top:10px; display:flex; flex-direction:column; gap:4px;">
              <span>📍 Hub: <strong>${booking.station.station_name}</strong></span>
              <span>🔌 Outlet: <strong>${booking.charger.charger_name}</strong></span>
              <span>📅 Date: <strong>${booking.booking_date}</strong></span>
              <span>🕒 Time: <strong>${booking.booking_start_time} - ${booking.booking_end_time}</strong></span>
            </div>
          </div>
          <div class="ticket-qr">
            <!-- Render custom inline SVG QR code -->
            <svg class="ticket-qr-svg" viewBox="0 0 100 100">
              <!-- Outline box -->
              <rect width="100" height="100" fill="none" stroke="black" stroke-width="4"></rect>
              <!-- QR Patterns -->
              <rect x="10" y="10" width="25" height="25" fill="black"></rect>
              <rect x="15" y="15" width="15" height="15" fill="white"></rect>
              <rect x="65" y="10" width="25" height="25" fill="black"></rect>
              <rect x="70" y="15" width="15" height="15" fill="white"></rect>
              <rect x="10" y="65" width="25" height="25" fill="black"></rect>
              <rect x="15" y="70" width="15" height="15" fill="white"></rect>
              <!-- Center clusters -->
              <rect x="40" y="40" width="20" height="20" fill="black"></rect>
              <rect x="45" y="45" width="10" height="10" fill="white"></rect>
              <rect x="70" y="70" width="10" height="10" fill="black"></rect>
              <rect x="80" y="80" width="10" height="10" fill="black"></rect>
              <rect x="50" y="75" width="8" height="8" fill="black"></rect>
            </svg>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="close-ticket-btn" style="width: 100%;">Close Ticket</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  document.getElementById("close-ticket-modal-btn").addEventListener("click", closeModal);
  document.getElementById("close-ticket-btn").addEventListener("click", closeModal);
}

function openSessionLauncherModal(bookingId) {
  const booking = dbService.getBookings().find(b => b.id === parseInt(bookingId));
  if (!booking) return;

  const vehicles = dbService.getVehicles();

  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("class", "modal-overlay");
  modalOverlay.setAttribute("id", "session-launcher-modal");

  modalOverlay.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <h2 style="font-size: 18px;">Authenticate & Start Charge</h2>
        <button class="btn-icon" id="close-launcher-modal-btn">✕</button>
      </div>
      <div class="modal-body" style="text-align: center; gap: 16px;">
        <p style="font-size:13px; color: var(--text-muted);">
          Scan the QR code on the charger screen to authenticate your reservation session.
        </p>
        <div class="ticket-qr" style="width: 120px; height: 120px; margin: 0 auto; padding: 10px;">
          <svg style="width: 100%; height: 100%;" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="none" stroke="black" stroke-width="4"></rect>
            <rect x="10" y="10" width="25" height="25" fill="black"></rect>
            <rect x="15" y="15" width="15" height="15" fill="white"></rect>
            <rect x="65" y="10" width="25" height="25" fill="black"></rect>
            <rect x="70" y="15" width="15" height="15" fill="white"></rect>
            <rect x="10" y="65" width="25" height="25" fill="black"></rect>
            <rect x="15" y="70" width="15" height="15" fill="white"></rect>
            <rect x="40" y="40" width="20" height="20" fill="black"></rect>
            <rect x="45" y="45" width="10" height="10" fill="white"></rect>
          </svg>
        </div>
        
        <div class="form-group" style="text-align: left;">
          <label class="form-label">Link vehicle plug</label>
          <select class="form-control" id="launcher-vehicle-select">
            ${vehicles.map(v => `<option value="${v.id}">${v.brand} ${v.model} (${v.registration_number})</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" id="cancel-launcher-btn">Cancel</button>
        <button class="btn btn-primary" id="start-simulation-btn" style="width: 100%;">Connect plug & Start charging</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  const closeModal = () => modalOverlay.remove();
  document.getElementById("close-launcher-modal-btn").addEventListener("click", closeModal);
  document.getElementById("cancel-launcher-btn").addEventListener("click", closeModal);

  document.getElementById("start-simulation-btn").addEventListener("click", () => {
    const vId = document.getElementById("launcher-vehicle-select").value;
    closeModal();
    
    // Start session in DB
    const session = dbService.startChargingSession(bookingId, vId);
    state.activeSession = session;
    
    // Render view to display simulation widgets
    renderPage();

    // Start ticker simulation loops
    startTelemetryLoop(session.id);
  });
}

function startTelemetryLoop(sessionId) {
  telemetryService.startSimulation(
    sessionId,
    (updatedSession) => {
      // Telemetry update tick UI triggers
      state.activeSession = updatedSession;
      const energyEl = document.getElementById("live-energy");
      const costEl = document.getElementById("live-cost");
      const gaugeEl = document.getElementById("telemetry-gauge-container");

      if (energyEl) energyEl.textContent = `${updatedSession.energy_consumed_kwh} kWh`;
      if (costEl) costEl.textContent = `₹${updatedSession.charging_cost}`;
      
      if (gaugeEl) {
        telemetryService.renderGauge(gaugeEl, updatedSession.battery_after);
      }
    },
    (completedSession, payment) => {
      // Completed charge event
      state.activeSession = null;
      renderPage();
      
      // show visual receipt summary invoice alert
      openReceiptModal(completedSession, payment);
    }
  );
}

function reconnectTelemetryLoop() {
  if (state.activeSession) {
    startTelemetryLoop(state.activeSession.id);
  }
}

function stopChargingSession() {
  if (state.activeSession) {
    const finalPercent = state.activeSession.battery_after || state.activeSession.battery_before;
    telemetryService.stopSimulation(state.activeSession.id, (completed, payment) => {
      state.activeSession = null;
      renderPage();
      openReceiptModal(completed, payment);
    });
  }
}

function openReceiptModal(session, payment) {
  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("class", "modal-overlay");

  modalOverlay.innerHTML = `
    <div class="modal-content" style="max-width: 420px;">
      <div class="modal-header">
        <h2 style="font-size:18px;">Payment Invoice Generated</h2>
      </div>
      <div class="modal-body" style="text-align: center; gap: 14px;">
        <span style="font-size: 42px; display:block;">🎉</span>
        <strong style="font-size:16px; color: var(--primary); display:block;">Transaction Successful!</strong>
        <p style="font-size:12px; color:var(--text-muted);">Thank you for utilizing EV-ChargeX smart stations infrastructure.</p>
        
        <div style="background:var(--border-light); border-radius:8px; padding:16px; text-align:left; font-size:13px; display:flex; flex-direction:column; gap:6px; margin-top:8px;">
          <div style="display:flex; justify-content:space-between;">
            <span>Transaction ID</span>
            <strong style="font-family:monospace;">${payment.transaction_id}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span>Energy Consumed</span>
            <strong>${session.energy_consumed_kwh} kWh</strong>
          </div>
          <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-color); padding-top:6px; margin-top:4px;">
            <span>Amount Debited</span>
            <strong style="font-size: 15px; color: var(--dark-slate);">₹${payment.amount}</strong>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" id="btn-close-receipt" style="width:100%;">Done</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
  document.getElementById("btn-close-receipt").addEventListener("click", () => {
    modalOverlay.remove();
  });
}

function openAddVehicleModal() {
  const modalOverlay = document.createElement("div");
  modalOverlay.setAttribute("class", "modal-overlay");

  modalOverlay.innerHTML = `
    <div class="modal-content" style="max-width: 440px;">
      <div class="modal-header">
        <h2 style="font-size: 18px;">Register Electric Vehicle</h2>
        <button class="btn-icon" id="close-veh-modal-btn">✕</button>
      </div>
      <form id="add-vehicle-form">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Vehicle Type</label>
            <select class="form-control" id="veh-type" required>
              <option value="Car">Electric Car</option>
              <option value="Bike">Electric Scooter / Bike</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Brand / Manufacturer</label>
            <input type="text" class="form-control" id="veh-brand" placeholder="e.g. Tesla, Hyundai, Tata" required>
          </div>
          <div class="form-group">
            <label class="form-label">Model Name</label>
            <input type="text" class="form-control" id="veh-model" placeholder="e.g. Nexon EV, Model Y" required>
          </div>
          <div class="form-group">
            <label class="form-label">Registration Plate Number</label>
            <input type="text" class="form-control" id="veh-reg" placeholder="e.g. MH-12-AB-1234" required>
          </div>
          <div class="form-group">
            <label class="form-label">Battery Capacity (kWh)</label>
            <input type="number" step="0.1" class="form-control" id="veh-capacity" placeholder="e.g. 40.5" required>
          </div>
          <div class="form-group">
            <label class="form-label">Current Charge State (%)</label>
            <input type="number" min="0" max="100" class="form-control" id="veh-charge" placeholder="e.g. 50" required>
          </div>
          <div class="form-group">
            <label class="form-label">Connector Standard Plug</label>
            <select class="form-control" id="veh-plug" required>
              <option value="CCS2">CCS2 (DC Fast Charge)</option>
              <option value="Type2">Type 2 (AC Charge)</option>
              <option value="GB/T">GB/T Plug</option>
              <option value="CHAdeMO">CHAdeMO Plug</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="cancel-veh-btn">Cancel</button>
          <button type="submit" class="btn btn-primary">Add to Fleet</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const closeModal = () => modalOverlay.remove();
  document.getElementById("close-veh-modal-btn").addEventListener("click", closeModal);
  document.getElementById("cancel-veh-btn").addEventListener("click", closeModal);

  document.getElementById("add-vehicle-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const type = document.getElementById("veh-type").value;
    const brand = document.getElementById("veh-brand").value;
    const model = document.getElementById("veh-model").value;
    const reg = document.getElementById("veh-reg").value;
    const capacity = parseFloat(document.getElementById("veh-capacity").value);
    const charge = parseFloat(document.getElementById("veh-charge").value);
    const plug = document.getElementById("veh-plug").value;

    dbService.addVehicle({
      vehicle_type: type,
      brand,
      model,
      registration_number: reg,
      battery_capacity: capacity,
      current_battery_percentage: charge,
      connector_type: plug,
      efficiency: type === "Car" ? 0.15 : 0.03,
      manufacturing_year: 2024
    });

    closeModal();
    renderPage();
    showToast(`${brand} ${model} successfully registered in fleet!`, "success");
  });
}

// -------------------------------------------------------------
// TOAST NOTIFICATIONS UTILITY
// -------------------------------------------------------------

function showToast(message, type = "success") {
  // Create toast container if not exists
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.setAttribute("id", "toast-container");
    container.setAttribute("class", "toast-container");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.setAttribute("class", `toast toast-${type}`);
  
  let icon = "🟢";
  if (type === "error") icon = "🔴";
  else if (type === "warning") icon = "🟠";
  else if (type === "info") icon = "🔵";

  toast.innerHTML = `
    <span>${icon}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after 4 seconds
  setTimeout(() => {
    toast.style.animation = "slideOutToast 0.3s ease forwards";
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 4000);
}
