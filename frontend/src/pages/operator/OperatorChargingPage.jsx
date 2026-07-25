import { useCallback, useEffect, useMemo, useState } from "react";
import { FaBatteryHalf, FaBolt, FaCalendarCheck, FaCar, FaClock, FaExclamationTriangle, FaLeaf, FaPlug, FaPowerOff, FaQrcode, FaRedo, FaRupeeSign, FaStopCircle, FaUser } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, MetricCard, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency, formatDate, formatEnergy, formatTime } from "../../utils/format";

function formatElapsedSeconds(seconds) {
  if (seconds <= 0) return "0 min";
  const mins = Math.floor(seconds / 60);
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs > 0) {
    return `${hrs} hr ${remMins} min`;
  }
  return `${mins} min`;
}

function OperatorChargingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const bookingParam = searchParams.get("booking");

  const loader = useCallback(async () => {
    const [sessions, stations, chargers, bookings] = await Promise.all([
      evService.sessions.list(),
      evService.stations.list(),
      evService.chargers.list(),
      evService.bookings.list(),
    ]);
    return {
      sessions: toList(sessions),
      stations: toList(stations),
      chargers: toList(chargers),
      bookings: toList(bookings),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  // Polling active sessions every 20 seconds while page is open
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        refresh();
      }
    }, 20000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Live timer tick for client-side elapsed time update every 5 seconds
  const [nowSec, setNowSec] = useState(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const timer = setInterval(() => {
      setNowSec(Math.floor(Date.now() / 1000));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Handoff booking state
  const [handoffBooking, setHandoffBooking] = useState(null);
  const [startingSession, setStartingSession] = useState(false);

  // Stop session modal state & automatic estimation preview
  const [stoppingSession, setStoppingSession] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submittingStop, setSubmittingStop] = useState(false);

  // Interrupt session modal state
  const [interruptingSession, setInterruptingSession] = useState(null);
  const [interruptReason, setInterruptReason] = useState("Operator emergency stop");
  const [submittingInterrupt, setSubmittingInterrupt] = useState(false);

  // Inspect handoff booking if parameter is supplied
  useEffect(() => {
    if (bookingParam && data?.bookings) {
      const found = data.bookings.find((b) => Number(b.id) === Number(bookingParam));
      if (found) {
        setHandoffBooking(found);
      }
    }
  }, [bookingParam, data?.bookings]);

  // Fetch fresh completion estimate preview when modal opens
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
    setStoppingSession(session);
    setPreviewData(null);
    fetchPreview(session);
  };

  // Derived Active and Completed lists
  const { activeSessions, completedSessions, summaryStats } = useMemo(() => {
    if (!data?.sessions) {
      return { activeSessions: [], completedSessions: [], summaryStats: { active: 0, completedToday: 0, energyToday: 0, revenueToday: 0 } };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const active = [];
    const completed = [];
    let energyToday = 0;
    let revenueToday = 0;
    let completedToday = 0;

    data.sessions.forEach((s) => {
      if (s.session_status === "ACTIVE") {
        active.push(s);
      } else {
        completed.push(s);
        const sDate = s.end_time ? s.end_time.slice(0, 10) : "";
        if (sDate === todayStr || !s.end_time) {
          completedToday += 1;
          energyToday += Number(s.energy_consumed_kwh || 0);
          revenueToday += Number(s.charging_cost || 0);
        }
      }
    });

    return {
      activeSessions: active,
      completedSessions: completed,
      summaryStats: {
        active: active.length,
        completedToday,
        energyToday,
        revenueToday,
      },
    };
  }, [data?.sessions]);

  const handleStartCharging = async () => {
    if (!handoffBooking || startingSession) return;
    setStartingSession(true);
    try {
      await evService.startCharging(handoffBooking.id);
      toast.success(`Charging started for Booking #${handoffBooking.id}.`);
      setHandoffBooking(null);
      setSearchParams({});
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not start charging session. Ensure QR is verified."));
    } finally {
      setStartingSession(false);
    }
  };

  const handleStopCharging = async (e) => {
    e.preventDefault();
    if (!stoppingSession || submittingStop) return;

    setSubmittingStop(true);
    try {
      const res = await evService.stopCharging({
        session_id: stoppingSession.id,
      });
      toast.success(res.message || "Charging session completed successfully.");
      setStoppingSession(null);
      setPreviewData(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not complete charging session."));
    } finally {
      setSubmittingStop(false);
    }
  };

  const handleInterruptCharging = async (e) => {
    e.preventDefault();
    if (!interruptingSession || submittingInterrupt) return;

    setSubmittingInterrupt(true);
    try {
      await evService.interruptCharging({
        session_id: interruptingSession.id,
        reason: interruptReason.trim() || "Operator emergency stop",
      });
      toast.success("Emergency stop executed.");
      setInterruptingSession(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not interrupt charging session."));
    } finally {
      setSubmittingInterrupt(false);
    }
  };

  if (loading) return <LoadingState label="Loading active charging sessions..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Live Station Demand"
        title="Active charging sessions"
        description="Monitor live power delivery, inspect vehicle state, and execute automatic charging session completions for your stations."
      />

      {/* Handoff Banner */}
      {handoffBooking && (
        <article className="dashboard-panel ready-panel" style={{ marginBottom: "24px" }}>
          <div>
            <p className="panel-label">QR Verified Handoff</p>
            <h2>Start Charging for Booking #{handoffBooking.id}</h2>
            <p>Station: <strong>{handoffBooking.station?.station_name}</strong> · Customer: <strong>{handoffBooking.user?.username}</strong></p>
          </div>
          <button className="primary-button" disabled={startingSession} onClick={handleStartCharging} type="button">
            <FaPlug /> {startingSession ? "Starting..." : "Start Power Delivery"}
          </button>
        </article>
      )}

      {/* Summary Cards */}
      <div className="dashboard-card-grid" style={{ marginBottom: "24px" }}>
        <MetricCard
          accent="blue"
          hint="Power delivery in progress"
          icon={<FaPlug />}
          label="Active Sessions"
          value={summaryStats.active}
        />
        <MetricCard
          accent="green"
          hint="Completed today"
          icon={<FaCalendarCheck />}
          label="Sessions Completed"
          value={summaryStats.completedToday}
        />
        <MetricCard
          hint="Delivered today"
          icon={<FaBolt />}
          label="Energy Supplied"
          value={formatEnergy(summaryStats.energyToday)}
        />
        <MetricCard
          hint="Revenue generated today"
          icon={<FaRupeeSign />}
          label="Session Revenue"
          value={formatCurrency(summaryStats.revenueToday)}
        />
      </div>

      {/* Active Sessions Grid */}
      <div className="section-heading">
        <div>
          <p className="panel-label">Live Operation</p>
          <h2>Currently Charging</h2>
        </div>
        <span>{activeSessions.length} active</span>
      </div>

      {activeSessions.length ? (
        <div className="charging-grid" style={{ marginBottom: "32px" }}>
          {activeSessions.map((session) => {
            const startSec = Math.floor(new Date(session.start_time).getTime() / 1000);
            const elapsedSec = Math.max(0, nowSec - startSec);
            const chargerObj = typeof session.charger === "object" ? session.charger : data.chargers.find((c) => Number(c.id) === Number(session.charger));
            const stationObj = chargerObj?.station;
            const vehicleObj = session.vehicle;
            const userObj = session.booking?.user;

            return (
              <article className="charging-live-card" key={session.id}>
                <div className="charging-pulse"><FaBolt /></div>
                <div className="charging-live-heading">
                  <div>
                    <p>Session #{session.id} · {stationObj?.station_name || "Station"}</p>
                    <h2>{chargerObj?.charger_name || `Charger #${session.charger}`} ({chargerObj?.connector_type})</h2>
                  </div>
                  <StatusBadge value="ACTIVE" />
                </div>

                <div className="charging-progress-visual">
                  <div className="charging-wave" />
                  <strong>{session.battery_before}%</strong>
                  <span>Starting Battery</span>
                </div>

                <div className="entity-details-grid">
                  <div>
                    <span>Driver</span>
                    <strong><FaUser /> {userObj?.username || `User #${session.booking?.user}`}</strong>
                  </div>
                  <div>
                    <span>Vehicle</span>
                    <strong><FaCar /> {vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "—"}</strong>
                  </div>
                  <div>
                    <span>Started At</span>
                    <strong>{formatTime(session.start_time)}</strong>
                  </div>
                  <div>
                    <span>Elapsed Time</span>
                    <strong><FaClock /> {formatElapsedSeconds(elapsedSec)}</strong>
                  </div>
                </div>

                <div className="card-actions" style={{ marginTop: "16px" }}>
                  <button className="primary-button" onClick={() => openStopModal(session)} type="button">
                    <FaStopCircle /> Complete Session
                  </button>
                  <button className="danger-button" onClick={() => setInterruptingSession(session)} type="button" title="Emergency Stop">
                    <FaPowerOff />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No active charging sessions"
          message="Drivers with verified booking QR codes will appear here when charging begins."
        />
      )}

      {/* Completed Session History Table */}
      <div className="section-heading">
        <div>
          <p className="panel-label">Historical Logs</p>
          <h2>Recent Completed Sessions</h2>
        </div>
        <span>{completedSessions.length} sessions</span>
      </div>

      {completedSessions.length ? (
        <article className="dashboard-panel">
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th>Driver / Vehicle</th>
                  <th>Charger</th>
                  <th>Starting %</th>
                  <th>Final %</th>
                  <th>Energy</th>
                  <th>Cost</th>
                  <th>Ended</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.slice(0, 10).map((session) => {
                  const chargerObj = typeof session.charger === "object" ? session.charger : data.chargers.find((c) => Number(c.id) === Number(session.charger));
                  const vehicleObj = session.vehicle;
                  const userObj = session.booking?.user;

                  return (
                    <tr key={session.id}>
                      <td><strong>#{session.id}</strong></td>
                      <td>
                        <strong>{userObj?.username || "Driver"}</strong>
                        <small>{vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model}` : "—"}</small>
                      </td>
                      <td>{chargerObj?.charger_name || `#${session.charger}`}</td>
                      <td>{session.battery_before}%</td>
                      <td><strong>{session.battery_after ?? "—"}%</strong></td>
                      <td>{formatEnergy(session.energy_consumed_kwh)}</td>
                      <td><strong>{formatCurrency(session.charging_cost)}</strong></td>
                      <td>{session.end_time ? formatTime(session.end_time) : "—"}</td>
                      <td><StatusBadge value={session.session_status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </article>
      ) : (
        <EmptyState
          title="No completed session history yet"
          message="Finished charging sessions will be recorded here."
        />
      )}

      {/* Automatic Completion Preview & Confirmation Modal */}
      {stoppingSession && (
        <Modal
          title={`Complete Session #${stoppingSession.id}`}
          description="Review automatic duration, energy, and cost estimations before completing power delivery."
          onClose={() => setStoppingSession(null)}
        >
          <form className="form-grid" onSubmit={handleStopCharging}>
            {loadingPreview ? (
              <LoadingState label="Calculating automatic energy & battery estimate..." />
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
                    onClick={() => fetchPreview(stoppingSession)}
                    type="button"
                  >
                    <FaRedo /> Refresh Estimate
                  </button>

                  <FormActions
                    loading={submittingStop}
                    onCancel={() => setStoppingSession(null)}
                    submitLabel={submittingStop ? "Completing..." : "Confirm & Complete Charging"}
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

      {/* Emergency Stop / Interrupt Modal */}
      {interruptingSession && (
        <Modal
          title={`Emergency Stop Session #${interruptingSession.id}`}
          description="Safely interrupt an active session due to emergency, power trip or equipment error."
          onClose={() => setInterruptingSession(null)}
        >
          <form className="form-grid" onSubmit={handleInterruptCharging}>
            <div className="location-status-banner error" style={{ gridColumn: "span 2", marginBottom: "10px" }}>
              <p><FaExclamationTriangle /> Warning: This will immediately stop power delivery and release charger #{typeof interruptingSession.charger === "object" ? interruptingSession.charger?.charger_number : interruptingSession.charger} back to AVAILABLE status.</p>
            </div>

            <Field label="Interruption reason" full>
              <input
                onChange={(e) => setInterruptReason(e.target.value)}
                placeholder="e.g. Power trip, emergency button pressed"
                required
                value={interruptReason}
              />
            </Field>

            <FormActions
              loading={submittingInterrupt}
              onCancel={() => setInterruptingSession(null)}
              submitLabel={submittingInterrupt ? "Interrupting..." : "Emergency stop session"}
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default OperatorChargingPage;
