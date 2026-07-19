import { useCallback } from "react";
import { FaCalendarCheck, FaChargingStation, FaRupeeSign, FaUsers } from "react-icons/fa";

import { ErrorState, LoadingState, MetricCard, PageHeader } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { formatCurrency } from "../../utils/format";

function AdminDashboardPage() {
  const loader = useCallback(() => evService.dashboard.admin(), []);
  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Loading platform overview..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader eyebrow="Administrator workspace" title="Platform overview" description="Monitor adoption, infrastructure and revenue across EV-ChargeX." />
      <div className="dashboard-card-grid">
        <MetricCard icon={<FaUsers />} label="EV users" value={data.users} hint={`${data.operators} station operators`} />
        <MetricCard icon={<FaChargingStation />} label="Stations" value={data.stations} hint={`${data.chargers} chargers managed`} accent="blue" />
        <MetricCard icon={<FaCalendarCheck />} label="Bookings" value={data.bookings} hint={`${data.charging_sessions} charging sessions`} accent="violet" />
        <MetricCard icon={<FaRupeeSign />} label="Revenue" value={formatCurrency(data.revenue)} hint={`${data.payments} payment records`} accent="green" />
      </div>
      <article className="dashboard-panel dashboard-callout">
        <div><p className="panel-label">System pulse</p><h2>EV-ChargeX is connected</h2><p>Use the navigation to review stations, chargers, bookings and complete charging activity.</p></div>
        <span className="live-indicator"><i /> Live API</span>
      </article>
    </section>
  );
}

export default AdminDashboardPage;
