import { useCallback, useMemo, useState } from "react";
import { FaCalendarAlt, FaCar, FaClock, FaEye, FaPlug, FaQrcode, FaRoad, FaUser } from "react-icons/fa";
import { useNavigate, useSearchParams } from "react-router-dom";

import { EmptyState, ErrorState, Field, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, formatTime } from "../../utils/format";

function OperatorBookingsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stationParam = searchParams.get("station");

  const loader = useCallback(async () => {
    const [bookings, stations, chargers] = await Promise.all([
      evService.bookings.list(),
      evService.stations.list(),
      evService.chargers.list(),
    ]);
    return {
      bookings: toList(bookings),
      stations: toList(stations),
      chargers: toList(chargers),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("TODAY_UPCOMING"); // TODAY_UPCOMING | TODAY | UPCOMING | PAST | ALL
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stationFilter, setStationFilter] = useState(stationParam || "ALL");
  const [chargerFilter, setChargerFilter] = useState("ALL");
  const [qrFilter, setQrFilter] = useState("ALL"); // ALL | VERIFIED | NOT_VERIFIED

  const [selectedBooking, setSelectedBooking] = useState(null);

  const todayStr = new Date().toISOString().slice(0, 10);

  const filteredBookings = useMemo(() => {
    if (!data?.bookings) return [];
    const lowered = query.toLowerCase().trim();

    return data.bookings
      .filter((booking) => {
        const bDate = booking.booking_date;

        // Date Filter logic
        if (dateFilter === "TODAY_UPCOMING") {
          if (bDate < todayStr && booking.booking_status !== "CONFIRMED") return false;
        } else if (dateFilter === "TODAY") {
          if (bDate !== todayStr) return false;
        } else if (dateFilter === "UPCOMING") {
          if (bDate < todayStr) return false;
        } else if (dateFilter === "PAST") {
          if (bDate >= todayStr) return false;
        }

        // Station Filter
        const sId = typeof booking.station === "object" ? booking.station?.id : booking.station;
        if (stationFilter !== "ALL" && Number(sId) !== Number(stationFilter)) return false;

        // Charger Filter
        const cId = typeof booking.charger === "object" ? booking.charger?.id : booking.charger;
        if (chargerFilter !== "ALL" && Number(cId) !== Number(chargerFilter)) return false;

        // Status Filter
        if (statusFilter !== "ALL" && booking.booking_status !== statusFilter) return false;

        // QR Filter
        if (qrFilter === "VERIFIED" && !booking.is_qr_used) return false;
        if (qrFilter === "NOT_VERIFIED" && booking.is_qr_used) return false;

        // Text Search
        if (lowered) {
          const bIdStr = String(booking.id);
          const uName = typeof booking.user === "object" ? booking.user?.username : "";
          const vReg = typeof booking.vehicle === "object" ? booking.vehicle?.registration_number : "";
          const sName = typeof booking.station === "object" ? booking.station?.station_name : "";

          const matches = [bIdStr, uName, vReg, sName].some((val) => val?.toLowerCase().includes(lowered));
          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Chronological order: Date then Start Time
        if (a.booking_date !== b.booking_date) {
          return a.booking_date.localeCompare(b.booking_date);
        }
        return (a.booking_start_time || "").localeCompare(b.booking_start_time || "");
      });
  }, [data?.bookings, query, dateFilter, statusFilter, stationFilter, chargerFilter, qrFilter, todayStr]);

  if (loading) return <LoadingState label="Loading booking queue..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const hasAssignedStations = data.stations.length > 0;

  return (
    <section>
      <PageHeader
        eyebrow="Station Reservations"
        title="Booking queue"
        description="Inspect upcoming driver reservations, verify QR check-ins, and track charging readiness for your stations."
      />

      {!hasAssignedStations && (
        <div className="location-status-banner error" style={{ marginBottom: "20px" }}>
          <p>No station is assigned to your operator account. Contact an administrator to receive a station assignment.</p>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="page-toolbar">
        <input
          className="toolbar-input"
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Booking ID, customer, vehicle or station"
          value={query}
        />

        <select
          className="toolbar-select"
          onChange={(e) => setDateFilter(e.target.value)}
          value={dateFilter}
        >
          <option value="TODAY_UPCOMING">Today & Upcoming</option>
          <option value="TODAY">Today only</option>
          <option value="UPCOMING">Upcoming only</option>
          <option value="PAST">Past bookings</option>
          <option value="ALL">All dates</option>
        </select>

        {data.stations.length > 1 && (
          <select
            className="toolbar-select"
            onChange={(e) => setStationFilter(e.target.value)}
            value={stationFilter}
          >
            <option value="ALL">All stations</option>
            {data.stations.map((s) => (
              <option key={s.id} value={s.id}>{s.station_name}</option>
            ))}
          </select>
        )}

        <select
          className="toolbar-select"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">All statuses</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          className="toolbar-select"
          onChange={(e) => setQrFilter(e.target.value)}
          value={qrFilter}
        >
          <option value="ALL">All QR states</option>
          <option value="VERIFIED">QR Verified</option>
          <option value="NOT_VERIFIED">QR Pending Check-in</option>
        </select>

        <span className="toolbar-count">{filteredBookings.length} bookings</span>
      </div>

      {filteredBookings.length ? (
        <div className="entity-card-grid">
          {filteredBookings.map((booking) => {
            const stationObj = typeof booking.station === "object" ? booking.station : data.stations.find((s) => Number(s.id) === Number(booking.station));
            const chargerObj = typeof booking.charger === "object" ? booking.charger : data.chargers.find((c) => Number(c.id) === Number(booking.charger));
            const userObj = typeof booking.user === "object" ? booking.user : null;
            const vehicleObj = booking.vehicle || null;

            return (
              <article className="entity-card booking-card" key={booking.id}>
                <div className="entity-card-top">
                  <span className="entity-icon"><FaCalendarAlt /></span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <StatusBadge value={booking.booking_status} />
                    {booking.is_qr_used ? (
                      <span className="compatibility-badge compatible" title="QR Code verified at station">
                        <FaQrcode /> QR Verified
                      </span>
                    ) : (
                      <span className="compatibility-badge unknown" title="Awaiting QR check-in">
                        <FaQrcode /> Check-in pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="entity-card-title">
                  <p>{stationObj?.station_name || "Station"}</p>
                  <h2>Booking #{booking.id}</h2>
                  <span>
                    <FaClock /> {formatDate(booking.booking_date)} · {formatTime(booking.booking_start_time)} – {formatTime(booking.booking_end_time)}
                  </span>
                </div>

                <div className="entity-details-grid">
                  <div>
                    <span>Driver</span>
                    <strong><FaUser /> {userObj?.username || `User #${booking.user}`}</strong>
                  </div>
                  <div>
                    <span>Charger</span>
                    <strong><FaPlug /> {chargerObj?.charger_name || `Charger #${booking.charger}`} ({chargerObj?.connector_type})</strong>
                  </div>
                  <div>
                    <span>Vehicle</span>
                    <strong><FaCar /> {vehicleObj ? `${vehicleObj.brand} ${vehicleObj.model} (${vehicleObj.registration_number})` : "—"}</strong>
                  </div>
                  <div>
                    <span>Duration</span>
                    <strong>{booking.estimated_duration || 60} mins</strong>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="secondary-button" onClick={() => setSelectedBooking(booking)} type="button">
                    <FaEye /> Inspect
                  </button>

                  {!booking.is_qr_used && booking.booking_status === "CONFIRMED" && (
                    <button
                      className="primary-button"
                      onClick={() => navigate(`/operator/validate-qr?booking=${booking.id}`)}
                      type="button"
                    >
                      <FaQrcode /> Validate QR
                    </button>
                  )}

                  {booking.is_qr_used && booking.booking_status === "CONFIRMED" && (
                    <button
                      className="primary-button"
                      onClick={() => navigate(`/operator/charging?booking=${booking.id}`)}
                      type="button"
                    >
                      <FaPlug /> Start charging
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={hasAssignedStations ? "No bookings found" : "No station assigned"}
          message={hasAssignedStations ? "No reservations match your selected date, station or status filters." : "Contact an administrator to receive a station assignment."}
        />
      )}

      {selectedBooking && (
        <Modal
          title={`Booking #${selectedBooking.id} details`}
          description="Detailed reservation breakdown for station check-in."
          onClose={() => setSelectedBooking(null)}
        >
          <div className="form-grid">
            <div className="dashboard-panel" style={{ gridColumn: "span 2" }}>
              <p className="panel-label">Reservation status</p>
              <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "6px" }}>
                <StatusBadge value={selectedBooking.booking_status} />
                {selectedBooking.is_qr_used ? (
                  <span className="compatibility-badge compatible">QR Verified</span>
                ) : (
                  <span className="compatibility-badge unknown">Check-in Pending</span>
                )}
              </div>
            </div>

            <Field label="Station">
              <input readOnly value={typeof selectedBooking.station === "object" ? selectedBooking.station?.station_name : `Station #${selectedBooking.station}`} />
            </Field>

            <Field label="Charger">
              <input readOnly value={typeof selectedBooking.charger === "object" ? `${selectedBooking.charger?.charger_name} (${selectedBooking.charger?.connector_type})` : `Charger #${selectedBooking.charger}`} />
            </Field>

            <Field label="Driver">
              <input readOnly value={typeof selectedBooking.user === "object" ? selectedBooking.user?.username : `User #${selectedBooking.user}`} />
            </Field>

            <Field label="Vehicle">
              <input readOnly value={selectedBooking.vehicle ? `${selectedBooking.vehicle.brand} ${selectedBooking.vehicle.model} (${selectedBooking.vehicle.registration_number})` : "N/A"} />
            </Field>

            <Field label="Date & Time" full>
              <input readOnly value={`${formatDate(selectedBooking.booking_date)} at ${formatTime(selectedBooking.booking_start_time)} to ${formatTime(selectedBooking.booking_end_time)}`} />
            </Field>

            <Field label="Booking QR Code" full>
              <input readOnly value={selectedBooking.qr_code || "N/A"} />
            </Field>

            {selectedBooking.trip && (
              <Field label="Associated Trip" full>
                <input readOnly value={`${selectedBooking.trip.source || "Origin"} → ${selectedBooking.trip.destination || "Destination"}`} />
              </Field>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

export default OperatorBookingsPage;
