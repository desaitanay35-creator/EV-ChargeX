import { useCallback } from "react";
import {
  FaCalendarCheck,
  FaCar,
  FaChargingStation,
  FaMapMarkerAlt,
  FaRupeeSign,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  MetricCard,
  PageHeader,
  StatusBadge,
} from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import evService, { toList } from "../../services/evService";
import { getApiError } from "../../services/api";
import { formatCurrency, formatDate, formatTime } from "../../utils/format";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const loadDashboard = useCallback(async () => {
    const [summary, vehicles, bookings, payments, notifications, stations] =
      await Promise.all([
        evService.dashboard.user(),
        evService.vehicles.list(),
        evService.bookings.list(),
        evService.payments.list(),
        evService.notifications.list(),
        evService.stations.list(),
      ]);

    return {
      summary,
      vehicles: toList(vehicles),
      bookings: toList(bookings),
      payments: toList(payments),
      notifications: toList(notifications),
      stations: toList(stations),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loadDashboard);

  if (loading) {
    return <LoadingState label="Preparing your charging dashboard..." />;
  }

  if (error) {
    return <ErrorState message={getApiError(error)} onRetry={refresh} />;
  }

  const primaryVehicle = data.vehicles[0];
  const nextBooking = data.bookings
    .filter((booking) => ["PENDING", "CONFIRMED"].includes(booking.booking_status))
    .sort((a, b) => `${a.booking_date}${a.booking_start_time}`.localeCompare(`${b.booking_date}${b.booking_start_time}`))[0];
  const totalSpent = data.payments
    .filter((payment) => payment.payment_status === "SUCCESS")
    .reduce((total, payment) => total + Number(payment.amount || 0), 0);
  const battery = Number(primaryVehicle?.current_battery_percentage || 0);
  const userName = user?.username || user?.email?.split("@")[0] || "EV driver";

  return (
    <section className="dashboard-page">
      <PageHeader
        eyebrow={`Welcome back, ${userName}`}
        title="Your charging command center"
        description="Track your vehicle, bookings and charging activity from one live dashboard."
        action={
          <button className="primary-button" onClick={() => navigate("/trips")} type="button">
            Plan a new trip
          </button>
        }
      />

      <div className="dashboard-card-grid">
        <MetricCard icon={<FaCar />} label="My Vehicles" value={data.summary.total_vehicles ?? data.vehicles.length} hint="Registered electric vehicles" />
        <MetricCard icon={<FaChargingStation />} label="Active Charging" value={data.summary.active_sessions ?? 0} hint="Sessions running now" accent="green" />
        <MetricCard icon={<FaCalendarCheck />} label="Bookings" value={data.summary.total_bookings ?? data.bookings.length} hint="All charging reservations" accent="blue" />
        <MetricCard icon={<FaRupeeSign />} label="Total Paid" value={formatCurrency(totalSpent)} hint="Successful payments" accent="violet" />
      </div>

      <div className="dashboard-main-grid">
        <article className="dashboard-panel large-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Primary vehicle</p>
              <h2>Battery status</h2>
            </div>
            {primaryVehicle && <StatusBadge value={battery > 25 ? "Healthy" : "Low"} />}
          </div>

          {primaryVehicle ? (
            <div className="battery-display">
              <div className="battery-percentage">
                <strong>{battery.toFixed(0)}%</strong>
                <span>Current battery</span>
              </div>
              <div className="battery-progress">
                <div className="battery-progress-value" style={{ width: `${Math.min(100, battery)}%` }} />
              </div>
              <div className="battery-details">
                <div><span>Vehicle</span><strong>{primaryVehicle.brand} {primaryVehicle.model}</strong></div>
                <div><span>Connector</span><strong>{primaryVehicle.connector_type}</strong></div>
                <div><span>Battery capacity</span><strong>{primaryVehicle.battery_capacity} kWh</strong></div>
              </div>
            </div>
          ) : (
            <EmptyState
              title="Add your first EV"
              message="Vehicle details unlock battery predictions and smart trip planning."
              action={<button className="primary-button" onClick={() => navigate("/vehicles")} type="button">Add vehicle</button>}
            />
          )}
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading">
            <div><p className="panel-label">Next reservation</p><h2>Upcoming booking</h2></div>
          </div>
          {nextBooking ? (
            <div className="booking-preview">
              <h3>Booking #{nextBooking.id}</h3>
              <p>{formatDate(nextBooking.booking_date)} · {formatTime(nextBooking.booking_start_time)} – {formatTime(nextBooking.booking_end_time)}</p>
              <div className="booking-preview-row"><span>Station / charger</span><strong>#{nextBooking.station} · Charger #{nextBooking.charger}</strong></div>
              <div className="booking-preview-row"><span>Status</span><StatusBadge value={nextBooking.booking_status} /></div>
              <button className="secondary-button" onClick={() => navigate("/bookings")} type="button">View bookings</button>
            </div>
          ) : (
            <EmptyState title="No upcoming bookings" message="Reserve an available charger for your next trip." />
          )}
        </article>
      </div>

      <div className="dashboard-bottom-grid">
        <article className="dashboard-panel">
          <div className="panel-heading"><div><p className="panel-label">Charging network</p><h2>Top-rated stations</h2></div></div>
          <div className="station-mini-list">
            {data.stations.slice(0, 3).map((station) => (
              <button className="station-mini-item" key={station.id} onClick={() => navigate(`/stations?station=${station.id}`)} type="button">
                <span className="station-mini-icon"><FaMapMarkerAlt /></span>
                <span><strong>{station.station_name}</strong><small>{station.city}, {station.state}</small></span>
                <span className="station-rating">★ {station.rating}</span>
              </button>
            ))}
            {!data.stations.length && <EmptyState title="No stations available" message="Ask an operator to add charging stations." />}
          </div>
        </article>

        <article className="dashboard-panel">
          <div className="panel-heading"><div><p className="panel-label">Latest activity</p><h2>Recent notifications</h2></div></div>
          <div className="notification-list">
            {data.notifications.slice(0, 4).map((notification) => (
              <div className="notification-item" key={notification.id}>
                <span className="notification-icon" />
                <div><strong>{notification.title}</strong><p>{notification.message}</p></div>
              </div>
            ))}
            {!data.notifications.length && <EmptyState title="You're all caught up" message="New booking and charging updates will appear here." />}
          </div>
        </article>
      </div>
    </section>
  );
}

export default DashboardPage;
