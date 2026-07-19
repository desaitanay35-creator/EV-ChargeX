import { useCallback } from "react";
import { FaBolt, FaChargingStation, FaPlug, FaRupeeSign } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { ErrorState, LoadingState, MetricCard, PageHeader } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService from "../../services/evService";
import { formatCurrency } from "../../utils/format";

function OperatorDashboardPage() {
  const navigate = useNavigate();
  const loader = useCallback(() => evService.dashboard.operator(), []);
  const { data, loading, error, refresh } = useResource(loader);

  if (loading) return <LoadingState label="Loading station operations..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Station operator"
        title="Operations dashboard"
        description="See charger availability, active demand and completed-session revenue."
        action={<button className="primary-button" onClick={() => navigate("/operator/validate-qr")} type="button">Validate booking QR</button>}
      />
      <div className="dashboard-card-grid">
        <MetricCard icon={<FaChargingStation />} label="Total chargers" value={data.total_chargers} hint={`${data.available} currently available`} />
        <MetricCard icon={<FaPlug />} label="Occupied" value={data.occupied} hint="Chargers in active use" accent="blue" />
        <MetricCard icon={<FaBolt />} label="Reserved" value={data.reserved} hint={`${data.today_sessions} recorded sessions`} accent="violet" />
        <MetricCard icon={<FaRupeeSign />} label="Revenue" value={formatCurrency(data.revenue)} hint="Completed sessions" accent="green" />
      </div>
      <article className="dashboard-panel dashboard-callout">
        <div><p className="panel-label">Operator checklist</p><h2>Ready for the next driver</h2><p>Validate the booking QR before starting a charging session, then keep charger status up to date.</p></div>
        <button className="secondary-button" onClick={() => navigate("/chargers")} type="button">Manage chargers</button>
      </article>
    </section>
  );
}

export default OperatorDashboardPage;
