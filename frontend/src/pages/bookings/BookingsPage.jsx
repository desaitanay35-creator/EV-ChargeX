import { useCallback, useMemo, useState } from "react";
import { FaCalendarAlt, FaClock, FaPlus, FaQrcode, FaTrash } from "react-icons/fa";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, formatTime } from "../../utils/format";

const today = new Date().toISOString().slice(0, 10);
const emptyBooking = { trip: "", station: "", charger: "", booking_date: today, booking_start_time: "10:00", booking_end_time: "11:00", estimated_duration: "60" };

function BookingsPage() {
  const { role } = useAuth();
  const isUser = role?.toUpperCase() === "USER";
  const loader = useCallback(async () => {
    const [bookings, trips, stations, chargers] = await Promise.all([evService.bookings.list(), evService.trips.list(), evService.stations.list(), evService.chargers.list()]);
    return { bookings: toList(bookings), trips: toList(trips), stations: toList(stations), chargers: toList(chargers) };
  }, []);
  const { data, loading, error, refresh } = useResource(loader);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyBooking);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [saving, setSaving] = useState(false);

  const availableChargers = useMemo(() => {
    if (!data) return [];
    return data.chargers.filter((charger) => charger.status === "AVAILABLE" && (!form.station || Number(charger.station) === Number(form.station)));
  }, [data, form.station]);

  const openCreate = () => {
    setForm({ ...emptyBooking, trip: data.trips[0]?.id || "", station: "", charger: "" });
    setModal("create");
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "station") next.charger = "";
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
      <PageHeader eyebrow="Reservations" title="Charging bookings" description="Reserve a compatible charger and present the generated QR code when you arrive." action={isUser ? <button className="primary-button" disabled={!data.trips.length} onClick={openCreate} type="button"><FaPlus /> New booking</button> : null} />
      {isUser && !data.trips.length && <div className="inline-alert">Plan a trip before reserving a charger.</div>}

      {data.bookings.length ? (
        <div className="booking-list">
          {data.bookings.map((booking) => {
            const station = data.stations.find((item) => Number(item.id) === Number(booking.station));
            const charger = data.chargers.find((item) => Number(item.id) === Number(booking.charger));
            return (
              <article className="booking-card" key={booking.id}>
                <div className="booking-date-block"><FaCalendarAlt /><strong>{new Date(`${booking.booking_date}T00:00:00`).getDate()}</strong><span>{formatDate(booking.booking_date, { month: "short" })}</span></div>
                <div className="booking-card-main">
                  <div className="booking-card-heading"><div><p>Booking #{booking.id}</p><h2>{station?.station_name || `Station #${booking.station}`}</h2></div><StatusBadge value={booking.booking_status} /></div>
                  <div className="booking-info-row"><span><FaClock /> {formatTime(booking.booking_start_time)} – {formatTime(booking.booking_end_time)}</span><span>{charger?.charger_name || `Charger #${booking.charger}`}</span><span>{booking.estimated_duration} minutes</span></div>
                </div>
                <div className="booking-card-actions">
                  {booking.qr_code && <button className="secondary-button" onClick={() => showQr(booking)} type="button"><FaQrcode /> QR</button>}
                  {isUser && !["COMPLETED", "CANCELLED"].includes(booking.booking_status) && <button className="danger-button" onClick={() => remove(booking)} type="button"><FaTrash /></button>}
                </div>
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No bookings yet" message="Plan a trip, choose an available station and reserve a charging slot." action={isUser && data.trips.length ? <button className="primary-button" onClick={openCreate} type="button">Book a charger</button> : null} />}

      {modal === "create" && (
        <Modal title="Reserve a charger" description="The selected charger is reserved immediately after confirmation." onClose={() => setModal(null)}>
          <form className="form-grid" onSubmit={createBooking}>
            <Field label="Trip" full><select name="trip" onChange={change} required value={form.trip}><option value="">Select trip</option>{data.trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.source} → {trip.destination}</option>)}</select></Field>
            <Field label="Station" full><select name="station" onChange={change} required value={form.station}><option value="">Select station</option>{data.stations.filter((station) => station.status === "OPEN").map((station) => <option key={station.id} value={station.id}>{station.station_name} · {station.city}</option>)}</select></Field>
            <Field label="Available charger" full><select name="charger" onChange={change} required value={form.charger}><option value="">Select charger</option>{availableChargers.map((charger) => <option key={charger.id} value={charger.id}>{charger.charger_name} · {charger.connector_type} · {charger.power_output_kw} kW</option>)}</select></Field>
            <Field label="Date"><input min={today} name="booking_date" onChange={change} required type="date" value={form.booking_date} /></Field>
            <Field label="Duration"><input min="15" name="estimated_duration" onChange={change} required type="number" value={form.estimated_duration} /></Field>
            <Field label="Start time"><input name="booking_start_time" onChange={change} required type="time" value={form.booking_start_time} /></Field>
            <Field label="End time"><input name="booking_end_time" onChange={change} required type="time" value={form.booking_end_time} /></Field>
            <FormActions loading={saving} onCancel={() => setModal(null)} submitLabel="Confirm booking" />
          </form>
        </Modal>
      )}

      {modal === "qr" && selectedBooking && (
        <Modal title={`Booking #${selectedBooking.id} QR`} description="Show this code to the station operator before charging." onClose={() => setModal(null)}>
          <div className="qr-display">
            <div className="qr-surface"><QRCodeSVG bgColor="#ffffff" fgColor="#08101c" level="H" size={220} value={selectedBooking.qr_code} /></div>
            <code>{selectedBooking.qr_code}</code>
            <StatusBadge value={selectedBooking.is_qr_used ? "Verified" : selectedBooking.booking_status} />
          </div>
        </Modal>
      )}
    </section>
  );
}

export default BookingsPage;
