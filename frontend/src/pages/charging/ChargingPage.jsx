import { useCallback, useEffect, useState } from "react";
import { FaBatteryFull, FaBatteryHalf, FaBolt, FaClock, FaLeaf, FaPlay, FaRedo, FaRupeeSign, FaStop } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency, formatDate, formatEnergy } from "../../utils/format";

function ChargingPage() {
  const { role } = useAuth();
  const isUser = role?.toUpperCase() === "USER";
  const loader = useCallback(async () => {
    const [sessions, bookings, vehicles, chargers] = await Promise.all([
      evService.sessions.list(),
      evService.bookings.list(),
      evService.vehicles.list(),
      evService.chargers.list(),
    ]);
    return {
      sessions: toList(sessions),
      bookings: toList(bookings),
      vehicles: toList(vehicles),
      chargers: toList(chargers),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);
  const [stopSession, setStopSession] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const eligibleBookings =
    data?.bookings.filter((booking) => booking.booking_status === "CONFIRMED" && booking.is_qr_used) || [];

  const start = async (booking) => {
    if (saving) return;
    setSaving(true);
    try {
      await evService.startCharging(booking.id);
      toast.success("Charging session started.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not start charging."));
    } finally {
      setSaving(false);
    }
  };

  const fetchPreview = useCallback(async (session) => {
    if (!session) return;
    setLoadingPreview(true);
    try {
      const res = await evService.getCompletionPreview(session.id);
      setPreviewData(res.estimate);
    } catch (err) {
      toast.error(getApiError(err, "Could not calculate completion estimate."));
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const openStopModal = (session) => {
    setStopSession(session);
    setPreviewData(null);
    fetchPreview(session);
  };

  const stop = async (event) => {
    event.preventDefault();
    if (!stopSession || saving) return;

    setSaving(true);
    try {
      const result = await evService.stopCharging(stopSession.id);
      toast.success(`Charging completed. Cost: ${formatCurrency(result.charging_cost || 0)}`);
      setStopSession(null);
      setPreviewData(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not stop charging."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading charging sessions..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const activeSessions = data.sessions.filter((session) => session.session_status === "ACTIVE");
  const previousSessions = data.sessions.filter((session) => session.session_status !== "ACTIVE");

  return (
    <section>
      <PageHeader
        eyebrow="Live charging"
        title="Charging sessions"
        description="Start charging after operator QR verification, then stop the session to calculate energy and cost."
      />

      {isUser && eligibleBookings.length > 0 && (
        <article className="dashboard-panel ready-panel">
          <div>
            <p className="panel-label">QR verified</p>
            <h2>Ready to start charging</h2>
            <p>{eligibleBookings.length} confirmed booking{eligibleBookings.length === 1 ? " is" : "s are"} ready.</p>
          </div>
          <div className="ready-actions">
            {eligibleBookings.map((booking) => (
              <button
                className="primary-button"
                disabled={saving}
                key={booking.id}
                onClick={() => start(booking)}
                type="button"
              >
                <FaPlay /> {saving ? "Starting..." : `Start booking #${booking.id}`}
              </button>
            ))}
          </div>
        </article>
      )}

      <div className="section-heading">
        <div>
          <p className="panel-label">In progress</p>
          <h2>Active sessions</h2>
        </div>
        <span>{activeSessions.length}</span>
      </div>

      {activeSessions.length ? (
        <div className="charging-grid">
          {activeSessions.map((session) => {
            const vehicle = data.vehicles.find((item) => Number(item.id) === Number(session.vehicle));
            const charger = data.chargers.find((item) => Number(item.id) === Number(session.charger));
            return (
              <article className="charging-live-card" key={session.id}>
                <div className="charging-pulse"><FaBolt /></div>
                <div className="charging-live-heading">
                  <div>
                    <p>Session #{session.id}</p>
                    <h2>{charger?.charger_name || `Charger #${session.charger}`}</h2>
                  </div>
                  <StatusBadge value="ACTIVE" />
                </div>
                <div className="charging-progress-visual">
                  <div className="charging-wave" />
                  <strong>{session.battery_before}%</strong>
                  <span>Starting battery</span>
                </div>
                <div className="entity-details-grid">
                  <div>
                    <span>Vehicle</span>
                    <strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `#${session.vehicle}`}</strong>
                  </div>
                  <div>
                    <span>Started</span>
                    <strong>{formatDate(session.start_time, { hour: "numeric", minute: "2-digit" })}</strong>
                  </div>
                </div>
                {isUser && (
                  <button
                    className="danger-action"
                    disabled={saving}
                    onClick={() => openStopModal(session)}
                    type="button"
                  >
                    <FaStop /> Stop charging
                  </button>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active sessions"
          message={isUser ? "Verify a confirmed booking QR at the station to start charging." : "Active charging sessions at your stations will appear here."}
        />
      )}

      <div className="section-heading">
        <div>
          <p className="panel-label">History</p>
          <h2>Completed sessions</h2>
        </div>
        <span>{previousSessions.length}</span>
      </div>

      {previousSessions.length ? (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Vehicle</th>
                <th>Starting %</th>
                <th>Final %</th>
                <th>Energy</th>
                <th>Cost</th>
                <th>Ended</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {previousSessions.map((session) => {
                const vehicle = data.vehicles.find((item) => Number(item.id) === Number(session.vehicle));
                return (
                  <tr key={session.id}>
                    <td>#{session.id}</td>
                    <td>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${session.vehicle}`}</td>
                    <td>{session.battery_before}%</td>
                    <td><strong>{session.battery_after ?? "—"}%</strong></td>
                    <td>{formatEnergy(session.energy_consumed_kwh)}</td>
                    <td><strong>{formatCurrency(session.charging_cost)}</strong></td>
                    <td>{formatDate(session.end_time, { hour: "numeric", minute: "2-digit" })}</td>
                    <td><StatusBadge value={session.session_status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted-copy">No completed charging sessions yet.</p>
      )}

      {/* Automatic Completion Modal for User */}
      {stopSession && (
        <Modal
          title={`Stop session #${stopSession.id}`}
          description="Review automatic duration, energy, and cost estimations before completing charging."
          onClose={() => setStopSession(null)}
        >
          <form className="form-grid" onSubmit={stop}>
            {loadingPreview ? (
              <LoadingState label="Calculating energy & battery estimate..." />
            ) : previewData ? (
              <>
                <div className="dashboard-panel" style={{ gridColumn: "span 2", marginBottom: "12px" }}>
                  <p className="panel-label">Session Summary & Calculation</p>
                  <div className="trip-metrics" style={{ marginTop: "10px" }}>
                    <span><FaBatteryHalf /><strong>{previewData.battery_before}%</strong><small>Starting Battery</small></span>
                    <span><FaClock /><strong>{previewData.duration_minutes} min</strong><small>Duration</small></span>
                    <span><FaBolt /><strong>{previewData.energy_delivered_kwh} kWh</strong><small>Est. Energy Delivered</small></span>
                    <span><FaBatteryHalf /><strong>+{previewData.battery_gain_percent}%</strong><small>Est. Battery Gained</small></span>
                    <span><FaBatteryHalf /><strong>{previewData.battery_after}%</strong><small>Est. Final Battery</small></span>
                    <span><FaRupeeSign /><strong>₹{previewData.charging_cost}</strong><small>Est. Total Cost</small></span>
                  </div>
                </div>

                <div className="location-status-banner info" style={{ gridColumn: "span 2", marginBottom: "12px" }}>
                  <p>
                    <FaLeaf /> <strong>Notice:</strong> Battery and energy values are estimated from charger power ({previewData.charger_power_kw} kW) and session duration because live vehicle telemetry is unavailable.
                  </p>
                </div>

                <div style={{ gridColumn: "span 2", display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                  <button
                    className="secondary-button btn-sm"
                    onClick={() => fetchPreview(stopSession)}
                    type="button"
                  >
                    <FaRedo /> Refresh Estimate
                  </button>

                  <FormActions
                    loading={saving}
                    onCancel={() => setStopSession(null)}
                    submitLabel={saving ? "Completing..." : "Confirm & Complete Charging"}
                  />
                </div>
              </>
            ) : (
              <div className="location-status-banner error" style={{ gridColumn: "span 2" }}>
                <p>Could not load completion estimate. Please try again.</p>
              </div>
            )}
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ChargingPage;
