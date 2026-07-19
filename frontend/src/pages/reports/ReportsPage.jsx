import { useCallback } from "react";
import { FaBolt, FaCalendarCheck, FaChartBar, FaLeaf, FaRupeeSign } from "react-icons/fa";

import { ErrorState, LoadingState, MetricCard, PageHeader } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { formatCurrency, titleCase } from "../../utils/format";

const flattenMetrics = (source, prefix = "") => Object.entries(source || {}).flatMap(([key, value]) => {
  const label = prefix ? `${prefix} · ${titleCase(key)}` : titleCase(key);
  if (value && typeof value === "object" && !Array.isArray(value)) return flattenMetrics(value, titleCase(key));
  return [{ key: `${prefix}-${key}`, label, value: Number(value || 0) }];
});

function ReportsPage() {
  const { role } = useAuth();
  const normalizedRole = role?.toUpperCase() || "USER";
  const loader = useCallback(() => {
    if (normalizedRole === "ADMIN") return evService.reports.admin();
    if (normalizedRole === "OPERATOR") return evService.reports.operator();
    return evService.reports.user();
  }, [normalizedRole]);
  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Compiling your reports..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const metrics = flattenMetrics(data);
  const maxValue = Math.max(1, ...metrics.map((metric) => metric.value));
  const isCurrency = (label) => /revenue|spent/i.test(label);

  return (
    <section>
      <PageHeader eyebrow={`${titleCase(normalizedRole)} analytics`} title="Reports & insights" description="A live operational summary calculated from your EV-ChargeX records." />
      {normalizedRole === "USER" && (
        <div className="dashboard-card-grid report-metric-grid">
          <MetricCard icon={<FaCalendarCheck />} label="Trips" value={data.total_trips || 0} hint="Planned routes" />
          <MetricCard icon={<FaBolt />} label="Charging sessions" value={data.charging_sessions || 0} hint="Recorded sessions" accent="blue" />
          <MetricCard icon={<FaLeaf />} label="Energy consumed" value={`${data.energy_consumed_kwh || 0} kWh`} hint="Lifetime charging energy" accent="green" />
          <MetricCard icon={<FaRupeeSign />} label="Total spent" value={formatCurrency(data.total_spent)} hint="Charging payments" accent="violet" />
        </div>
      )}

      <article className="dashboard-panel report-panel">
        <div className="panel-heading"><div><p className="panel-label">Live API totals</p><h2>Performance overview</h2></div><FaChartBar /></div>
        <div className="report-bars">
          {metrics.map((metric) => (
            <div className="report-bar-row" key={metric.key}>
              <div><span>{metric.label}</span><strong>{isCurrency(metric.label) ? formatCurrency(metric.value) : metric.value}</strong></div>
              <div className="report-track"><i style={{ width: `${Math.max(4, (metric.value / maxValue) * 100)}%` }} /></div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

export default ReportsPage;
