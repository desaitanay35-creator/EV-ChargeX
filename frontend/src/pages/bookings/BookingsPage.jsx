import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCar, FaClock, FaCopy, FaPlus, FaQrcode, FaTrash } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { isConnectorCompatible } from "../../utils/connectorCompatibility";
import { formatDate, formatTime } from "../../utils/format";

const today = new Date().toISOString().slice(0, 10);
const emptyBooking = { trip: "", station: "", charger: "", booking_date: today, booking_start_time: "10:00", booking_end_time: "11:00", estimated_duration: "60" };

function BookingsPage() {
  const { role } = useAuth();
  const isUser = role?.toUpperCase() === "USER";
  const [searchParams] = useSearchParams();

  const loader = useCallback(async () => {
    const [bookings, trips, stations, chargers, vehicles] = await Promise.all([
      evService.bookings.list(),
      evService.trips.list(),
      evService.stations.list(),
      evService.chargers.list(),
      evService.vehicles.list(),
    ]);
    return {
      bookings: toList(bookings),
      trips: toList(trips),
      stations: toList(stations),
      chargers: toList(chargers),
      vehicles: toList(vehicles),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBooking);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [saving, setSaving] = useState(false);

  // Selected trip object
  const selectedTrip = useMemo(() => {
    if (!data?.trips?.length) return null;
    return data.trips.find((t) => Number(t.id) === Number(form.trip)) || data.trips[0];
  }, [data?.trips, form.trip]);

  // Vehicle associated with selected trip or query param vehicle
  const activeVehicle = useMemo(() => {
    if (!data?.vehicles?.length) return null;
    if (selectedTrip) {
      const v = data.vehicles.find((item) => Number(item.id) === Number(selectedTrip.vehicle));
      if (v) return v;
    }
    const paramVehicle = searchParams.get("vehicle");
    if (paramVehicle) {
      const v = data.vehicles.find((item) => Number(item.id) === Number(paramVehicle));
      if (v) return v;
    }
    return data.vehicles[0];
  }, [data?.vehicles, selectedTrip, searchParams]);

  // Compatible available chargers filtered by selected station AND vehicle connector compatibility
  const availableChargers = useMemo(() => {
    if (!data || !form.station) return [];
    return data.chargers.filter((charger) => {
      if (charger.status !== "AVAILABLE") return false;
      if (Number(charger.station) !== Number(form.station)) return false;
      if (activeVehicle && activeVehicle.connector_type) {
        return isConnectorCompatible(activeVehicle.connector_type, charger.connector_type);
      }
      return true;
    });
  }, [data, form.station, activeVehicle]);

  // Handle URL params pre-selection on load
  useEffect(() => {
    const stationParam = searchParams.get("station");
    if (stationParam && data?.stations?.length && isUser && !modal) {
      const validStation = data.stations.find((s) => Number(s.id) === Number(stationParam));
      if (validStation) {
        setForm((prev) => ({
          ...prev,
          station: String(validStation.id),
          trip: data.trips[0]?.id || "",
          charger: "",
        }));
        setModal("create");
      }
    }
  }, [searchParams, data?.stations, data?.trips, isUser]);

  // Auto-preselect charger if exactly 1 compatible charger is available
  useEffect(() => {
    if (modal === "create" && availableChargers.length === 1 && !form.charger) {
      setForm((prev) => ({ ...prev, charger: String(availableChargers[0].id) }));
    }
  }, [modal, availableChargers, form.charger]);

  const openCreate = () => {
    setForm({ ...emptyBooking, trip: data.trips[0]?.id || "", station: "", charger: "" });
    setModal("create");
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "station" || name === "trip") next.charger = "";
      if (["booking_start_time", "booking_end_time"].includes(name)) {
        const start = name === "booking_start_time" ? value : current.booking_start_time;
        const end = name === "booking_end_time" ? value : current.booking_end_time;
        if (start && end) {
          const [startHour, startMinute] = start.split(":").map(Number);
          const [endHour, endMinute] = end.split(":").map(Number);
          const duration = endHour * 60 + endMinute - (startHour * 60 + startMinute);
          if (duration > 0) next.estimated_duration = duration.toString();
        }
      }
      return next;
    });
  };

  const createBooking = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await evService.bookings.create(form);
      toast.success("Charger reserved. Your QR is ready.");
      setModal(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not create this booking."));
    } finally {
      setSaving(false);
    }
  };

  const showQr = (booking) => {
    setSelectedBooking(booking);
    setModal("qr");
  };

  const remove = async (booking) => {
    if (!window.confirm(`Delete booking #${booking.id}?`)) return;
    try {
      await evService.bookings.remove(booking.id);
      toast.success("Booking removed.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete this booking."));
    }
  };

  if (loading) return <LoadingState label="Loading reservations..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="Reservations"
        title="Charging bookings"
        description="Reserve a compatible charger and present the generated QR code when you arrive."
        action={
          isUser ? (
            <button className="primary-button" disabled={!data.trips.length} onClick={openCreate} type="button">
              <FaPlus /> New booking
            </button>
          ) : null
        }
      />
      {isUser && !data.trips.length && (
        <div className="inline-alert">Plan a trip before reserving a charger.</div>
      )}

      {data.bookings.length ? (
        <div className="booking-list">
          {data.bookings.map((booking) => {
            const station = data.stations.find((item) => Number(item.id) === Number(booking.station));
            const charger = data.chargers.find((item) => Number(item.id) === Number(booking.charger));
            return (
              <article className="booking-card" key={booking.id}>
                <div className="booking-date-block">
                  <FaCalendarAlt />
                  <strong>{new Date(`${booking.booking_date}T00:00:00`).getDate()}</strong>
                  <span>{formatDate(booking.booking_date, { month: "short" })}</span>
                </div>
                <div className="booking-card-main">
                  <div className="booking-card-heading">
                    <div>
                      <p>Booking #{booking.id}</p>
                      <h2>{station?.station_name || `Station #${booking.station}`}</h2>
                    </div>
                    <StatusBadge value={booking.booking_status} />
                  </div>
                  <div className="booking-info-row">
                    <span>
                      <FaClock /> {formatTime(booking.booking_start_time)} – {formatTime(booking.booking_end_time)}
                    </span>
                    <span>{charger?.charger_name || `Charger #${booking.charger}`}</span>
                    <span>{booking.estimated_duration} minutes</span>
                  </div>
                </div>
                <div className="booking-card-actions">
                  {booking.qr_code && (
                    <button className="secondary-button" onClick={() => showQr(booking)} type="button">
                      <FaQrcode /> QR
                    </button>
                  )}
                  {isUser && !["COMPLETED", "CANCELLED"].includes(booking.booking_status) && (
                    <button className="danger-button" onClick={() => remove(booking)} type="button">
                      <FaTrash />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No bookings yet"
          message="Plan a trip, choose an available station and reserve a charging slot."
          action={
            isUser && data.trips.length ? (
              <button className="primary-button" onClick={openCreate} type="button">
                Book a charger
              </button>
            ) : null
          }
        />
      )}

      {modal === "create" && (
        <Modal
          title="Reserve a charger"
          description="The selected charger is reserved immediately after confirmation."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={createBooking}>
            <Field label="Trip" full>
              <select name="trip" onChange={change} required value={form.trip}>
                <option value="">Select trip</option>
                {data.trips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.source} → {trip.destination}
                  </option>
                ))}
              </select>
            </Field>

            {activeVehicle && (
              <div className="inline-summary field-full">
                <FaCar />
                <span>
                  Vehicle connector: <strong>{activeVehicle.connector_type}</strong> ({activeVehicle.brand} {activeVehicle.model})
                </span>
              </div>
            )}

            <Field label="Station" full>
              <select name="station" onChange={change} required value={form.station}>
                <option value="">Select station</option>
                {data.stations
                  .filter((station) => station.status === "OPEN")
                  .map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.station_name} · {station.city}
                    </option>
                  ))}
              </select>
            </Field>

            <Field label="Compatible available charger" full>
              <select name="charger" onChange={change} required value={form.charger}>
                <option value="">
                  {availableChargers.length
                    ? "Select compatible charger"
                    : form.station
                    ? "No available compatible chargers at this station"
                    : "Select a station first"}
                </option>
                {availableChargers.map((charger) => (
                  <option key={charger.id} value={charger.id}>
                    {charger.charger_name} · {charger.connector_type} · {charger.power_output_kw} kW · ₹{charger.price_per_kwh}/kWh
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Date">
              <input min={today} name="booking_date" onChange={change} required type="date" value={form.booking_date} />
            </Field>

            <Field label="Duration (minutes)">
              <input min="15" name="estimated_duration" onChange={change} required type="number" value={form.estimated_duration} />
            </Field>

            <Field label="Start time">
              <input name="booking_start_time" onChange={change} required type="time" value={form.booking_start_time} />
            </Field>

            <Field label="End time">
              <input name="booking_end_time" onChange={change} required type="time" value={form.booking_end_time} />
            </Field>

            <FormActions loading={saving} onCancel={() => setModal(null)} submitLabel="Confirm booking" />
          </form>
        </Modal>
      )}

      {modal === "qr" && selectedBooking && (
        <Modal
          title={`Booking #${selectedBooking.id} Verification QR`}
          description="Show this verification code or QR to the station operator before charging."
          onClose={() => setModal(null)}
        >
          <div className="qr-display">
            <div className="qr-surface">
              <QRCodeSVG bgColor="#ffffff" fgColor="#08101c" level="H" size={220} value={selectedBooking.qr_code || `EV-BKG-${selectedBooking.id}`} />
            </div>

            <div className="verification-code-card" style={{ marginTop: "16px", textAlign: "center" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Verification Code</span>
              <strong style={{ fontSize: "1.3rem", letterSpacing: "1px", color: "var(--text-primary)", display: "block", margin: "6px 0" }}>
                {selectedBooking.qr_code}
              </strong>
              <button
                className="secondary-button btn-sm"
                onClick={() => {
                  if (selectedBooking.qr_code) {
                    navigator.clipboard.writeText(selectedBooking.qr_code);
                    toast.success("Verification code copied to clipboard!");
                  }
                }}
                type="button"
                style={{ marginTop: "6px" }}
              >
                <FaCopy /> Copy Code
              </button>
            </div>

            <div style={{ marginTop: "16px" }}>
              {selectedBooking.is_qr_used ? (
                <div className="location-status-banner success">
                  <p>✓ This QR code has already been verified at the station.</p>
                </div>
              ) : selectedBooking.booking_status === "COMPLETED" ? (
                <div className="location-status-banner info">
                  <p>This booking is completed.</p>
                </div>
              ) : selectedBooking.booking_status === "CANCELLED" ? (
                <div className="location-status-banner error">
                  <p>This booking is cancelled.</p>
                </div>
              ) : (
                <div className="location-status-banner info">
                  <p>Show this QR code or verification code to the station operator before charging.</p>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}

export default BookingsPage;
