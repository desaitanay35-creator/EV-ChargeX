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
import { FaBolt, FaCalendarCheck, FaChartLine, FaLeaf, FaReceipt, FaRupeeSign } from "react-icons/fa";

import { EmptyState, ErrorState, LoadingState, MetricCard, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { formatCurrency, formatDate, formatEnergy, titleCase } from "../../utils/format";

// Register ChartJS elements once
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

function ReportsPage() {
  const { role } = useAuth();
  const normalizedRole = role?.toUpperCase() || "USER";
  const [range, setRange] = useState("all");

  const loader = useCallback(() => {
    if (normalizedRole === "ADMIN") return evService.reports.admin();
    if (normalizedRole === "OPERATOR") return evService.reports.operator();
    return evService.reports.user();
  }, [normalizedRole]);

  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Compiling live reports and analytics..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  // Operator / Admin Simple View
  if (normalizedRole !== "USER") {
    return (
      <section>
        <PageHeader
          eyebrow={`${titleCase(normalizedRole)} analytics`}
          title="Reports & insights"
          description="Operational metrics calculated directly from system records."
        />
        <div className="dashboard-card-grid">
          {Object.entries(data || {}).map(([key, val]) => {
            if (typeof val === "object" && val !== null) {
              return Object.entries(val).map(([subKey, subVal]) => (
                <MetricCard
                  key={`${key}-${subKey}`}
                  label={`${titleCase(key)}: ${titleCase(subKey)}`}
                  value={subVal}
                />
              ));
            }
            return (
              <MetricCard key={key} label={titleCase(key)} value={val} />
            );
          })}
        </div>
      </section>
    );
  }

  // USER Dashboard & Real Chart.js rendering
  const summary = data.summary || {
    total_trips: data.total_trips || 0,
    total_bookings: data.total_bookings || 0,
    completed_sessions: data.charging_sessions || 0,
    energy_consumed_kwh: data.energy_consumed_kwh || "0.00",
    total_spent: data.total_spent || "0.00",
  };

  const monthlySpending = data.monthly_spending || [];
  const monthlyEnergy = data.monthly_energy || [];
  const sessionsByStatus = data.sessions_by_status || [];
  const recentSessions = data.recent_sessions || [];
  const recentPayments = data.recent_payments || [];

  // Chart 1: Monthly Spending (Line Chart)
  const spendingChartData = {
    labels: monthlySpending.length ? monthlySpending.map((item) => item.label) : ["No data"],
    datasets: [
      {
        label: "Spending (₹)",
        data: monthlySpending.length ? monthlySpending.map((item) => Number(item.amount || 0)) : [0],
        borderColor: "#ff6600",
        backgroundColor: "rgba(255, 102, 0, 0.15)",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: "#ff6600",
        pointRadius: 5,
      },
    ],
  };

  const spendingChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "#94a3b8" } },
      tooltip: {
        callbacks: {
          label: (context) => `Spending: ₹${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
      y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255, 255, 255, 0.05)" } },
    },
  };

  // Chart 2: Monthly Energy (Bar Chart)
  const energyChartData = {
    labels: monthlyEnergy.length ? monthlyEnergy.map((item) => item.label) : ["No data"],
    datasets: [
      {
        label: "Energy Consumed (kWh)",
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

  // Chart 3: Sessions by Status (Doughnut Chart)
  const doughnutData = {
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
        eyebrow="EV Charging Analytics"
        title="Reports & insights"
        description="Real historical spending, energy consumption, and charging activity charts."
      />

      {/* Summary Cards */}
      <div className="dashboard-card-grid report-metric-grid">
        <MetricCard icon={<FaCalendarCheck />} label="Total Trips" value={summary.total_trips || 0} hint="Planned trips" />
        <MetricCard icon={<FaReceipt />} label="Total Bookings" value={summary.total_bookings || 0} hint="Reservations made" accent="blue" />
        <MetricCard icon={<FaBolt />} label="Completed Sessions" value={summary.completed_sessions || 0} hint="Finished charging" accent="orange" />
        <MetricCard icon={<FaLeaf />} label="Energy Consumed" value={formatEnergy(summary.energy_consumed_kwh)} hint="Total power delivered" accent="green" />
        <MetricCard icon={<FaRupeeSign />} label="Total Spent" value={formatCurrency(summary.total_spent)} hint="Settled payments" accent="violet" />
      </div>

      {/* Charts Grid */}
      <div className="reports-charts-grid">
        {/* Monthly Spending Line Chart */}
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Financial breakdown</p>
              <h2>Monthly spending</h2>
            </div>
            <FaChartLine />
          </div>
          <div className="chart-wrapper">
            {monthlySpending.length ? (
              <Line data={spendingChartData} options={spendingChartOptions} />
            ) : (
              <EmptyState title="No spending history yet" message="Completed payments will appear here." />
            )}
          </div>
        </article>

        {/* Monthly Energy Bar Chart */}
        <article className="dashboard-panel chart-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Power usage</p>
              <h2>Monthly energy (kWh)</h2>
            </div>
            <FaLeaf />
          </div>
          <div className="chart-wrapper">
            {monthlyEnergy.length ? (
              <Bar data={energyChartData} options={energyChartOptions} />
            ) : (
              <EmptyState title="No energy history yet" message="Completed charging sessions will populate this chart." />
            )}
          </div>
        </article>
      </div>

      {/* Status Doughnut + Recent Tables Grid */}
      <div className="reports-bottom-grid">
        <article className="dashboard-panel chart-panel doughnut-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Session breakdown</p>
              <h2>Sessions by status</h2>
            </div>
            <FaBolt />
          </div>
          <div className="chart-wrapper doughnut-wrapper">
            {sessionsByStatus.length ? (
              <Doughnut data={doughnutData} options={doughnutOptions} />
            ) : (
              <EmptyState title="No session data" message="Start and complete a session to see status ratios." />
            )}
          </div>
        </article>

        <article className="dashboard-panel table-panel">
          <div className="panel-heading">
            <div>
              <p className="panel-label">Activity log</p>
              <h2>Recent charging sessions</h2>
            </div>
          </div>
          {recentSessions.length ? (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Charger</th>
                    <th>Energy</th>
                    <th>Cost</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.charger}</td>
                      <td>{formatEnergy(session.energy_consumed_kwh)}</td>
                      <td>{formatCurrency(session.charging_cost)}</td>
                      <td><StatusBadge value={session.session_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="No recent sessions" message="Your recent charging activity will appear here." />
          )}
        </article>
      </div>
    </section>
  );
}

export default ReportsPage;
