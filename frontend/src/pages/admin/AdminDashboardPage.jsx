import { useCallback, useEffect, useState } from "react";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  FaExclamationTriangle,
  FaInfoCircle,
  FaShieldAlt,
  FaSync,
  FaUsers,
  FaChargingStation,
  FaCalendarCheck,
  FaRupeeSign,
  FaPlug,
  FaUserCog,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { ErrorState, LoadingState, MetricCard, PageHeader } from "../../components/ui/UI";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { formatCurrency, formatDate, formatEnergy, titleCase } from "../../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RANGES = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "3 Months", value: "3m" },
  { label: "6 Months", value: "6m" },
  { label: "12 Months", value: "12m" },
  { label: "All Time", value: "all" },
];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState("6m");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchDashboard = useCallback(async (selectedRange = range, isBackground = false) => {
    try {
      if (!isBackground) setRefreshing(true);
      const res = await evService.dashboard.admin(selectedRange);
      setData(res);
      setError(null);
    } catch (err) {
      if (!isBackground) setError(getApiError(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    fetchDashboard(range);
  }, [range, fetchDashboard]);

  // Polling every 30 seconds when enabled and tab active
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchDashboard(range, true);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, range, fetchDashboard]);

  if (loading && !data) {
    return <LoadingState label="Loading platform statistics & system status..." />;
  }

  if (error && !data) {
    return <ErrorState message={error} onRetry={() => fetchDashboard(range)} />;
  }

  const summary = data?.summary || {};
  const period = data?.period_summary || {};
  const alerts = data?.system_alerts || [];
  const recentUsers = data?.recent_users || [];
  const recentBookings = data?.recent_bookings || [];
  const activeSessions = data?.active_sessions || [];

  // Chart 1: Revenue Trend Line Chart
  const trendLabels = (data?.revenue_trend || []).map((t) => t.date || "—");
  const trendValues = (data?.revenue_trend || []).map((t) => Number(t.revenue || 0));

  const revenueTrendData = {
    labels: trendLabels.length ? trendLabels : ["No Data"],
    datasets: [
      {
        label: `Revenue (${period.range ? period.range.toUpperCase() : "6M"})`,
        data: trendValues.length ? trendValues : [0],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.12)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#10b981",
        pointRadius: 4,
      },
    ],
  };

  // Chart 2: Station Status Doughnut
  const stationBreakdown = data?.station_status_breakdown || [];
  const stationLabels = stationBreakdown.map((s) => titleCase(s.status));
  const stationValues = stationBreakdown.map((s) => s.count);

  const stationChartData = {
    labels: stationLabels,
    datasets: [
      {
        data: stationValues,
        backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
        borderWidth: 1,
      },
    ],
  };

  // Chart 3: Charger Status Bar
  const chargerBreakdown = data?.charger_status_breakdown || [];
  const chargerLabels = chargerBreakdown.map((c) => titleCase(c.status));
  const chargerValues = chargerBreakdown.map((c) => c.count);

  const chargerChartData = {
    labels: chargerLabels,
    datasets: [
      {
        label: "Chargers",
        data: chargerValues,
        backgroundColor: ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444"],
        borderRadius: 6,
      },
    ],
  };

  // Chart 4: Payment Status Doughnut
  const paymentBreakdown = data?.payment_status_breakdown || [];
  const paymentLabels = paymentBreakdown.map((p) => titleCase(p.status));
  const paymentValues = paymentBreakdown.map((p) => p.count);

  const paymentChartData = {
    labels: paymentLabels,
    datasets: [
      {
        data: paymentValues,
        backgroundColor: ["#f59e0b", "#10b981", "#ef4444", "#6b7280"],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="admin-dashboard-container">
      <PageHeader
        eyebrow="Global Control Center"
        title="Admin System Overview"
        description="Comprehensive monitoring, revenue trends, and dynamic system alerts across EV-ChargeX."
        actions={
          <div className="admin-header-actions">
            <button
              className={`auto-refresh-toggle ${autoRefresh ? "active" : ""}`}
              onClick={() => setAutoRefresh((prev) => !prev)}
              type="button"
              title="Toggle 30s auto-refresh"
            >
              <FaClock /> {autoRefresh ? "Auto-refresh On (30s)" : "Auto-refresh Off"}
            </button>
            <button
              className="primary-button refresh-btn"
              onClick={() => fetchDashboard(range)}
              disabled={refreshing}
              type="button"
            >
              <FaSync className={refreshing ? "spinning" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        }
      />

      {/* Lifetime / Global Summary Metric Grid */}
      <section className="dashboard-section">
        <h3 className="section-title">Platform Summary (Lifetime)</h3>
        <div className="dashboard-card-grid">
          <MetricCard
            icon={<FaUsers />}
            label="Total Accounts"
            value={summary.total_users || 0}
            hint={`${summary.active_users || 0} active, ${summary.blocked_users || 0} blocked`}
            accent="blue"
          />
          <MetricCard
            icon={<FaUserCog />}
            label="Station Operators"
            value={summary.operators || 0}
            hint={`${summary.operators_with_stations || 0} assigned, ${summary.operators_without_stations || 0} unassigned`}
            accent="violet"
          />
          <MetricCard
            icon={<FaChargingStation />}
            label="Stations"
            value={summary.stations || 0}
            hint={`${summary.open_stations || 0} open, ${summary.closed_stations || 0} closed`}
            accent="teal"
          />
          <MetricCard
            icon={<FaPlug />}
            label="Chargers"
            value={summary.chargers || 0}
            hint={`${summary.available_chargers || 0} available, ${summary.occupied_chargers || 0} occupied`}
            accent="emerald"
          />
          <MetricCard
            icon={<FaCalendarCheck />}
            label="Active Sessions"
            value={summary.active_sessions || 0}
            hint={`${summary.today_bookings || 0} bookings today`}
            accent="amber"
          />
          <MetricCard
            icon={<FaRupeeSign />}
            label="Lifetime Revenue"
            value={formatCurrency(summary.successful_revenue)}
            hint={`Pending: ${formatCurrency(summary.pending_revenue)}`}
            accent="green"
          />
        </div>
      </section>

      {/* Range Control & Period Summary */}
      <section className="dashboard-section period-section">
        <div className="period-header">
          <h3>Period Activity Analytics</h3>
          <div className="range-pills">
            {RANGES.map((r) => (
              <button
                key={r.value}
                className={`range-pill ${range === r.value ? "active" : ""}`}
                onClick={() => setRange(r.value)}
                type="button"
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="period-metrics-strip">
          <div className="period-metric-box">
            <span>Period Revenue</span>
            <strong>{formatCurrency(period.period_successful_revenue)}</strong>
            <small>{period.period_successful_payments_count || 0} completed payments</small>
          </div>
          <div className="period-metric-box">
            <span>Completed Sessions</span>
            <strong>{period.period_completed_sessions || 0}</strong>
            <small>In selected timeframe</small>
          </div>
          <div className="period-metric-box">
            <span>Energy Delivered</span>
            <strong>{formatEnergy(period.period_energy_consumed_kwh)}</strong>
            <small>Total kWh consumed</small>
          </div>
        </div>
      </section>

      {/* Calculated System Alerts */}
      <section className="dashboard-section alerts-section">
        <div className="section-header-inline">
          <h3>System Integrity & Health Alerts</h3>
          <span className="badge badge-neutral">{alerts.length} Issue(s) Detected</span>
        </div>

        {alerts.length === 0 ? (
          <div className="alerts-empty-state">
            <FaCheckCircle className="empty-icon success" />
            <div>
              <h4>No System Issues Detected</h4>
              <p>All chargers, stations, operators, and active sessions are operating within expected parameters.</p>
            </div>
          </div>
        ) : (
          <div className="alerts-grid">
            {alerts.map((alert) => (
              <div key={alert.id} className={`alert-card alert-${alert.type.toLowerCase()}`}>
                <div className="alert-header">
                  <span className={`severity-badge ${alert.type.toLowerCase()}`}>{alert.type}</span>
                  <span className="alert-category">{alert.category}</span>
                </div>
                <h4 className="alert-title">{alert.title}</h4>
                <p className="alert-message">{alert.message}</p>
                <div className="alert-footer">
                  <span className="alert-count">Count: {alert.count}</span>
                  {alert.action_available && alert.target ? (
                    <button
                      className="alert-action-btn"
                      onClick={() => navigate(alert.target)}
                      type="button"
                    >
                      Resolve Issue →
                    </button>
                  ) : (
                    <span className="next-stage-badge">Available in next stage</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Visual Analytics Charts */}
      <section className="dashboard-section charts-section">
        <h3 className="section-title">Visual Analytics & Distribution</h3>
        <div className="charts-grid">
          {/* Revenue Trend */}
          <div className="chart-card line-chart-card">
            <h4>Revenue Growth Trend ({range.toUpperCase()})</h4>
            <div className="chart-wrapper">
              <Line
                data={revenueTrendData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>

          {/* Charger Status Breakdown */}
          <div className="chart-card">
            <h4>Charger Status Breakdown</h4>
            <div className="chart-wrapper">
              <Bar
                data={chargerChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
              />
            </div>
          </div>

          {/* Station Status Breakdown */}
          <div className="chart-card">
            <h4>Station Status</h4>
            <div className="chart-wrapper doughnut-wrapper">
              <Doughnut
                data={stationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="chart-card">
            <h4>Payment Status</h4>
            <div className="chart-wrapper doughnut-wrapper">
              <Doughnut
                data={paymentChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recent Operational Data */}
      <section className="dashboard-section recent-activity-section">
        <h3 className="section-title">Recent Operational Records</h3>

        <div className="recent-tables-grid">
          {/* Active Charging Sessions */}
          <div className="recent-panel">
            <div className="panel-header">
              <h4>Live Active Sessions ({activeSessions.length})</h4>
            </div>
            {activeSessions.length === 0 ? (
              <div className="table-empty">No active charging sessions right now.</div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Station</th>
                      <th>Charger</th>
                      <th>Driver</th>
                      <th>Start Battery</th>
                      <th>Elapsed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeSessions.map((s) => (
                      <tr key={s.id}>
                        <td><strong>{s.station_name}</strong></td>
                        <td>{s.charger_name}</td>
                        <td>{s.username}</td>
                        <td>{s.battery_before ? `${s.battery_before}%` : "—"}</td>
                        <td><span className="badge badge-active">{s.elapsed_minutes}m</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="recent-panel">
            <div className="panel-header">
              <h4>Latest User Registrations</h4>
              <button
                className="text-link"
                onClick={() => navigate("/system-admin/users")}
                type="button"
              >
                View all users →
              </button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.slice(0, 5).map((u) => (
                    <tr key={u.id}>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td><span className="role-tag">{u.role}</span></td>
                      <td>
                        <span className={`status-pill ${u.is_active ? "active" : "blocked"}`}>
                          {u.is_active ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td>{formatDate(u.date_joined)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="recent-panel full-width-panel">
            <div className="panel-header">
              <h4>Recent Reservations & Bookings</h4>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Station & Charger</th>
                    <th>Status</th>
                    <th>QR Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b) => (
                    <tr key={b.id}>
                      <td>#{b.id}</td>
                      <td>{formatDate(b.booking_date)}</td>
                      <td>{b.booking_start_time} - {b.booking_end_time}</td>
                      <td><strong>{b.username}</strong></td>
                      <td>{b.station_name} ({b.charger_name})</td>
                      <td>
                        <span className={`badge booking-status-${b.booking_status?.toLowerCase()}`}>
                          {b.booking_status}
                        </span>
                      </td>
                      <td>{b.is_qr_used ? "Scanned & Used" : "Unused"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
