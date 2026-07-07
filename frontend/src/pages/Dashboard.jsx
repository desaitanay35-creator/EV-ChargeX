import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import StatCard from '../components/common/StatCard.jsx';
import StationsMap from '../components/map/StationsMap.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import stations from '../data/stations.json';
import './Dashboard.css';

export default function Dashboard() {
  const { onMenuClick } = useOutletContext();
  const { dashboard, isLoading } = useUserData();
  const navigate = useNavigate();

  const stats = dashboard?.dashboardStats;
  const bookings = dashboard?.bookings || [];
  const activeBooking = bookings[0];

  // Preview a handful of stations on the dashboard's small map, mirroring
  // the original design's simplified "Nearby EV Chargers" widget.
  const previewStations = stations.slice(0, 3);

  return (
    <>
      <Header
        title="Overview Dashboard"
        subtitle="Manage charging bookings, check stats, and find stations"
        onMenuClick={onMenuClick}
      />

      <section className="dashboard-stats">
        <StatCard icon="🚗" iconBg="#e3f6ef" label="My Registered Cars" value={isLoading ? '—' : stats?.registeredCars} />
        <StatCard icon="🗓️" iconBg="#fdf1d8" label="Upcoming Bookings" value={isLoading ? '—' : stats?.upcomingBookings} />
        <StatCard icon="⚡" iconBg="#eaf1fe" label="Completed Charges" value={isLoading ? '—' : stats?.completedCharges} />
        <StatCard icon="🌳" iconBg="#f2e9fb" label="CO2 Saved (Est)" value={isLoading ? '—' : `${stats?.co2SavedKg} kg`} />
      </section>

      <section className="dashboard-main">
        <div className="card dashboard-map-card">
          <div className="dashboard-map-header">
            <h2>Nearby EV Chargers</h2>
            <button className="btn btn-primary" onClick={() => navigate('/stations')}>
              Search / List Views
            </button>
          </div>
          <StationsMap stations={previewStations} height="420px" />
        </div>

        <div className="dashboard-side">
          <div className="card dashboard-reservation-card">
            <h2>Active Reservations</h2>
            {activeBooking ? (
              <div className="reservation-item">
                <div className="reservation-item-top">
                  <strong>{activeBooking.stationName}</strong>
                  <span className="badge badge-info">{activeBooking.status}</span>
                </div>
                <p className="reservation-charger">Charger: {activeBooking.charger}</p>
                <div className="reservation-meta">
                  <span>📅 {activeBooking.date}</span>
                  <span>🕐 {activeBooking.startTime} - {activeBooking.endTime}</span>
                </div>
                <div className="reservation-actions">
                  <button className="btn btn-primary">Start Charging</button>
                  <button className="btn btn-secondary">View Ticket (QR)</button>
                </div>
              </div>
            ) : (
              <p className="dashboard-empty">No active reservations right now.</p>
            )}
          </div>

          <div className="card dashboard-trip-card">
            <h2>Plan a Trip</h2>
            <p>Input a source and destination, we will calculate the distance, expected battery load, and suggest optimal stops.</p>
            <button className="btn btn-primary btn-block" onClick={() => navigate('/route-planner')}>
              Open Route Planner
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
