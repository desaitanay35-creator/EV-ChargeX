import { useCallback, useState } from "react";
import { FaBatteryFull, FaBolt, FaClock, FaPlay, FaStop } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency, formatDate } from "../../utils/format";

function ChargingPage() {
  const { role } = useAuth();
  const isUser = role?.toUpperCase() === "USER";
  const loader = useCallback(async () => {
    const [sessions, bookings, vehicles, chargers] = await Promise.all([evService.sessions.list(), evService.bookings.list(), evService.vehicles.list(), evService.chargers.list()]);
    return { sessions: toList(sessions), bookings: toList(bookings), vehicles: toList(vehicles), chargers: toList(chargers) };
  }, []);
  const { data, loading, error, refresh } = useResource(loader);
  const [stopSession, setStopSession] = useState(null);
  const [batteryAfter, setBatteryAfter] = useState("80");
  const [saving, setSaving] = useState(false);

  const eligibleBookings = data?.bookings.filter((booking) => booking.booking_status === "CONFIRMED" && booking.is_qr_used) || [];

  const start = async (booking) => {
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

  const stop = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await evService.stopCharging(stopSession.id, batteryAfter);
      toast.success(`Charging completed. Cost: ${formatCurrency(result.charging_cost)}`);
      setStopSession(null);
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
      <PageHeader eyebrow="Live charging" title="Charging sessions" description="Start charging after operator QR verification, then stop the session to calculate energy and cost." />

      {isUser && eligibleBookings.length > 0 && (
        <article className="dashboard-panel ready-panel">
          <div><p className="panel-label">QR verified</p><h2>Ready to start charging</h2><p>{eligibleBookings.length} confirmed booking{eligibleBookings.length === 1 ? " is" : "s are"} ready.</p></div>
          <div className="ready-actions">{eligibleBookings.map((booking) => <button className="primary-button" disabled={saving} key={booking.id} onClick={() => start(booking)} type="button"><FaPlay /> Start booking #{booking.id}</button>)}</div>
        </article>
      )}

      <div className="section-heading"><div><p className="panel-label">In progress</p><h2>Active sessions</h2></div><span>{activeSessions.length}</span></div>
      {activeSessions.length ? (
        <div className="charging-grid">
          {activeSessions.map((session) => {
            const vehicle = data.vehicles.find((item) => Number(item.id) === Number(session.vehicle));
            const charger = data.chargers.find((item) => Number(item.id) === Number(session.charger));
            return (
              <article className="charging-live-card" key={session.id}>
                <div className="charging-pulse"><FaBolt /></div>
                <div className="charging-live-heading"><div><p>Session #{session.id}</p><h2>{charger?.charger_name || `Charger #${session.charger}`}</h2></div><StatusBadge value="ACTIVE" /></div>
                <div className="charging-progress-visual"><div className="charging-wave" /><strong>{session.battery_before}%</strong><span>Starting battery</span></div>
                <div className="entity-details-grid">
                  <div><span>Vehicle</span><strong>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `#${session.vehicle}`}</strong></div>
                  <div><span>Started</span><strong>{formatDate(session.start_time, { hour: "numeric", minute: "2-digit" })}</strong></div>
                </div>
                {isUser && <button className="danger-action" onClick={() => { setBatteryAfter(vehicle?.current_battery_percentage || "80"); setStopSession(session); }} type="button"><FaStop /> Stop charging</button>}
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No active sessions" message={isUser ? "Verify a confirmed booking QR at the station to start charging." : "Active charging sessions at your stations will appear here."} />}

      <div className="section-heading"><div><p className="panel-label">History</p><h2>Completed sessions</h2></div><span>{previousSessions.length}</span></div>
      {previousSessions.length ? (
        <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Session</th><th>Vehicle</th><th>Energy</th><th>Cost</th><th>Ended</th><th>Status</th></tr></thead><tbody>{previousSessions.map((session) => { const vehicle = data.vehicles.find((item) => Number(item.id) === Number(session.vehicle)); return <tr key={session.id}><td>#{session.id}</td><td>{vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${session.vehicle}`}</td><td>{session.energy_consumed_kwh} kWh</td><td>{formatCurrency(session.charging_cost)}</td><td>{formatDate(session.end_time, { hour: "numeric", minute: "2-digit" })}</td><td><StatusBadge value={session.session_status} /></td></tr>; })}</tbody></table></div>
      ) : <p className="muted-copy">No completed charging sessions yet.</p>}

      {stopSession && (
        <Modal title={`Stop session #${stopSession.id}`} description="The final battery percentage is used to calculate energy consumption and cost." onClose={() => setStopSession(null)}>
          <form className="form-grid" onSubmit={stop}>
            <Field label="Final battery percentage" full><input max="100" min={Number(stopSession.battery_before)} onChange={(event) => setBatteryAfter(event.target.value)} required step="0.01" type="number" value={batteryAfter} /></Field>
            <div className="inline-summary field-full"><FaBatteryFull /><span>Started at <strong>{stopSession.battery_before}%</strong></span></div>
            <FormActions loading={saving} onCancel={() => setStopSession(null)} submitLabel="Complete charging" />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ChargingPage;
