import { useCallback } from "react";
import { FaBolt, FaChargingStation, FaExclamationTriangle, FaPlug, FaRupeeSign } from "react-icons/fa";
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

  const isUnassigned = data.summary?.assigned_stations === 0 || (data.total_chargers === 0 && (!data.stations || data.stations.length === 0));

  return (
    <section>
      <PageHeader
        eyebrow="Station operator"
        title="Operations dashboard"
        description="See charger availability, active demand and completed-session revenue for assigned stations."
        action={
          <button className="primary-button" onClick={() => navigate("/operator/validate-qr")} type="button">
            Validate booking QR
          </button>
        }
      />

      {isUnassigned && (
        <div className="location-status-banner error" style={{ marginBottom: "20px" }}>
          <p>
            <FaExclamationTriangle /> No station is currently assigned to your operator account. Contact an administrator to assign a station.
          </p>
        </div>
      )}

      <div className="dashboard-card-grid">
        <MetricCard
          icon={<FaChargingStation />}
          label="Total chargers"
          value={data.summary?.total_chargers ?? data.total_chargers ?? 0}
          hint={`${data.summary?.available_chargers ?? data.available ?? 0} available`}
        />
        <MetricCard
          icon={<FaPlug />}
          label="Occupied"
          value={data.summary?.occupied_chargers ?? data.occupied ?? 0}
          hint="Active charging sessions"
          accent="blue"
        />
        <MetricCard
          icon={<FaBolt />}
          label="Reserved"
          value={data.summary?.reserved_chargers ?? data.reserved ?? 0}
          hint={`${data.summary?.active_sessions ?? data.today_sessions ?? 0} active sessions`}
          accent="violet"
        />
        <MetricCard
          icon={<FaRupeeSign />}
          label="Total revenue"
          value={formatCurrency(data.summary?.total_revenue ?? data.revenue ?? 0)}
          hint="Settled payments"
          accent="green"
        />
      </div>

      <article className="dashboard-panel dashboard-callout">
        <div>
          <p className="panel-label">Operator checklist</p>
          <h2>Ready for the next driver</h2>
          <p>Validate the booking QR before starting a charging session, then keep charger status up to date.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="secondary-button"
            onClick={() => navigate("/operator/stations")}
            type="button"
          >
            Manage stations
          </button>
          <button
            className="primary-button"
            disabled={isUnassigned}
            onClick={() => navigate("/operator/chargers")}
            type="button"
          >
            Manage chargers
          </button>
        </div>
      </article>
    </section>
  );
}

export default OperatorDashboardPage;
