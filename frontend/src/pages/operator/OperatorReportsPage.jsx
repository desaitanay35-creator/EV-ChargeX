import { useCallback, useState } from "react";
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
import { FaBolt, FaCalendarCheck, FaChartLine, FaChargingStation, FaLeaf, FaPlug, FaReceipt, FaRupeeSign } from "react-icons/fa";

import { EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
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

function OperatorReportsPage() {
  const [range, setRange] = useState("30d");

  const loader = useCallback(() => evService.reports.operator(range), [range]);
  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Compiling operator operational analytics..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const summary = data?.summary || {
    assigned_stations: 0,
    total_chargers: 0,
    available_chargers: 0,
    active_sessions: 0,
    completed_sessions: 0,
    interrupted_sessions: 0,
    energy_delivered_kwh: "0.00",
    successful_revenue: "0.00",
    pending_revenue: "0.00",
    total_bookings: 0,
  };

  const monthlyRevenue = data?.monthly_revenue || [];
  const monthlyEnergy = data?.monthly_energy || [];
  const sessionsByStatus = data?.sessions_by_status || [];
  const chargerStatusBreakdown = data?.charger_status_breakdown || [];
  const stationPerformance = data?.station_performance || [];
  const recentPayments = data?.recent_payments || [];

  // Chart 1: Revenue Line Chart
  const revenueChartData = {
    labels: monthlyRevenue.length ? monthlyRevenue.map((item) => item.label) : ["No revenue data"],
    datasets: [
      {
        label: "Successful Revenue (₹)",
        data: monthlyRevenue.length ? monthlyRevenue.map((item) => Number(item.amount || 0)) : [0],
        borderColor: "#ff6600",
        backgroundColor: "rgba(255, 102, 0, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#ff6600",
        pointRadius: 5,
      },
    ],
  };

  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      tooltip: {
        callbacks: {
          label: (context) => `Revenue: ₹${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
    },
  };

  // Chart 2: Energy Delivered Bar Chart
  const energyChartData = {
    labels: monthlyEnergy.length ? monthlyEnergy.map((item) => item.label) : ["No energy data"],
    datasets: [
      {
        label: "Energy Delivered (kWh)",
        data: monthlyEnergy.length ? monthlyEnergy.map((item) => Number(item.energy_kwh || 0)) : [0],
        backgroundColor: "#22c55e",
        borderRadius: 8,
      },
    ],
  };

  const energyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      tooltip: {
        callbacks: {
          label: (context) => `Energy: ${context.raw.toFixed(2)} kWh`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
    },
  };

  // Chart 3: Sessions by Status Doughnut
  const sessionDoughnutData = {
    labels: sessionsByStatus.length ? sessionsByStatus.map((item) => item.status) : ["No sessions"],
    datasets: [
      {
        data: sessionsByStatus.length ? sessionsByStatus.map((item) => item.count) : [1],
        backgroundColor: sessionsByStatus.length
          ? sessionsByStatus.map((item) =>
              item.status === "COMPLETED"
                ? "#22c55e"
                : item.status === "ACTIVE"
                ? "#ff6600"
                : "#ef4444"
            )
          : ["#475569"],
        borderWidth: 2,
        borderColor: "#0f172a",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "right", labels: { color: "#94a3b8" } },
    },
  };

  return (
    <section className="reports-page-section">
      <PageHeader
        eyebrow="Station Operator Analytics"
        title="Operational insights & revenue"
        description="Comprehensive analytics for your assigned stations: revenue settlement, energy delivered, session status ratios and station performance."
        action={
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Reporting Period:</span>
            <select
              className="toolbar-select"
              onChange={(e) => setRange(e.target.value)}
              value={range}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="6m">Last 6 months</option>
              <option value="12m">Last 12 months</option>
              <option value="all">All time</option>
            </select>
          </div>
        }
      />

      {/* Summary Cards Grid */}
      <div className="dashboard-card-grid report-metric-grid" style={{ marginBottom: "25px" }}>
        <MetricCard icon={<FaChargingStation />} label="Assigned stations" value={summary.assigned_stations} hint={`${summary.total_chargers} total chargers`} />
        <MetricCard icon={<FaPlug />} label="Active sessions" value={summary.active_sessions} hint={`${summary.completed_sessions} completed`} accent="orange" />
        <MetricCard icon={<FaCalendarCheck />} label="Total reservations" value={summary.total_bookings} hint="Station bookings" accent="blue" />
        <MetricCard icon={<FaLeaf />} label="Energy delivered" value={formatEnergy(summary.energy_delivered_kwh)} hint="Total power delivered" accent="green" />
        <MetricCard icon={<FaRupeeSign />} label="Settled revenue" value={formatCurrency(summary.successful_revenue)} hint={`₹${summary.pending_revenue} pending`} accent="violet" />
      </div>

      {/* Charts Grid */}
      <div className="reports-charts-grid" style={{ marginBottom: "25px" }}>
        {/* Monthly Revenue Chart */}
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Financial settlement</p>
              <h2>Settled revenue (₹)</h2>
            </div>
            <FaChartLine />
          </div>
          <div className="chart-wrapper">
            {monthlyRevenue.length ? (
              <Line data={revenueChartData} options={revenueChartOptions} />
            ) : (
              <EmptyState title="No revenue history for period" message="Settled payments will populate this chart." />
            )}
          </div>
        </article>

        {/* Monthly Energy Chart */}
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Power distribution</p>
              <h2>Energy delivered (kWh)</h2>
            </div>
            <FaLeaf />
          </div>
          <div className="chart-wrapper">
            {monthlyEnergy.length ? (
              <Bar data={energyChartData} options={energyChartOptions} />
            ) : (
              <EmptyState title="No energy history for period" message="Completed charging sessions will populate this chart." />
            )}
          </div>
        </article>
      </div>

      {/* Session Ratio & Station Performance Grid */}
      <div className="reports-bottom-grid" style={{ marginBottom: "25px" }}>
        <article className="dashboard-panel chart-panel doughnut-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Outcome ratio</p>
              <h2>Sessions by status</h2>
            </div>
            <FaBolt />
          </div>
          <div className="chart-wrapper doughnut-wrapper">
            {sessionsByStatus.length ? (
              <Doughnut data={sessionDoughnutData} options={doughnutOptions} />
            ) : (
              <EmptyState title="No sessions recorded" message="Active and completed session outcomes will appear here." />
            )}
          </div>
        </article>

        <article className="dashboard-panel table-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Station breakdown</p>
              <h2>Assigned station performance</h2>
            </div>
          </div>
          {stationPerformance.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Station</th>
                    <th>City</th>
                    <th>Chargers</th>
                    <th>Completed sessions</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stationPerformance.map((station) => (
                    <tr key={station.id}>
                      <td><strong>{station.station_name}</strong></td>
                      <td>{station.city}</td>
                      <td>{station.chargers_count}</td>
                      <td>{station.completed_sessions}</td>
                      <td><strong>{formatCurrency(station.revenue)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No station performance data" message="Assigned station performance metrics will appear here." />
          )}
        </article>
      </div>

      {/* Recent Payments Table */}
      <article className="dashboard-panel table-panel">
        <div className="panel-heading">
          <div>
            <p className="panel-label">Payment ledger</p>
            <h2>Recent settled payments</h2>
          </div>
        </div>
        {recentPayments.length ? (
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td><strong>#{p.id}</strong></td>
                    <td>{p.transaction_id}</td>
                    <td><strong>{formatCurrency(p.amount)}</strong></td>
                    <td><StatusBadge value={p.payment_status} /></td>
                    <td>{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No payment records" message="Settled transaction history will appear here." />
        )}
      </article>
    </section>
  );
}

export default OperatorReportsPage;
