import { useCallback, useEffect, useMemo, useState } from "react";
import { FaCalendarAlt, FaCar, FaClock, FaCopy, FaExclamationTriangle, FaPlus, FaQrcode, FaTrash } from "react-icons/fa";
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
const emptyBooking = { vehicle: "", trip: "", station: "", charger: "", booking_date: today, booking_start_time: "10:00", booking_end_time: "11:00", estimated_duration: "60" };

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
  const [qrImageFailed, setQrImageFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  // Selected vehicle object for form filtering
  const activeVehicle = useMemo(() => {
    if (!data?.vehicles?.length) return null;
    if (form.vehicle) {
      const v = data.vehicles.find((item) => Number(item.id) === Number(form.vehicle));
      if (v) return v;
    }
    if (form.trip && data?.trips?.length) {
      const t = data.trips.find((item) => Number(item.id) === Number(form.trip));
      if (t) {
        const v = data.vehicles.find((item) => Number(item.id) === Number(t.vehicle));
        if (v) return v;
      }
    }
    const paramVehicle = searchParams.get("vehicle");
    if (paramVehicle) {
      const v = data.vehicles.find((item) => Number(item.id) === Number(paramVehicle));
      if (v) return v;
    }
    return data.vehicles[0];
  }, [data?.vehicles, data?.trips, form.vehicle, form.trip, searchParams]);

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
    const chargerParam = searchParams.get("charger");
    const vehicleParam = searchParams.get("vehicle");
    const isNearbyMode = searchParams.get("mode") === "nearby";

    if (stationParam && data?.stations?.length && isUser && !modal) {
      const validStation = data.stations.find((s) => Number(s.id) === Number(stationParam));
      const validVehicle = vehicleParam && data?.vehicles?.length ? data.vehicles.find((v) => Number(v.id) === Number(vehicleParam)) : data.vehicles[0];
      if (validStation) {
        setForm((prev) => ({
          ...prev,
          station: String(validStation.id),
          charger: chargerParam ? String(chargerParam) : "",
          vehicle: validVehicle ? String(validVehicle.id) : "",
          trip: isNearbyMode ? "" : (data.trips[0]?.id ? String(data.trips[0].id) : ""),
        }));
        setModal("create");
      }
    }
  }, [searchParams, data?.stations, data?.vehicles, data?.trips, isUser]);

  // Auto-preselect charger if exactly 1 compatible charger is available
  useEffect(() => {
    if (modal === "create" && availableChargers.length === 1 && !form.charger) {
      setForm((prev) => ({ ...prev, charger: String(availableChargers[0].id) }));
    }
  }, [modal, availableChargers, form.charger]);

  const openCreate = () => {
    const defaultVeh = data?.vehicles[0]?.id ? String(data.vehicles[0].id) : "";
    setForm({ ...emptyBooking, vehicle: defaultVeh, trip: "", station: "", charger: "" });
    setModal("create");
  };

  const change = (event) => {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "trip" && value) {
        const matchingTrip = data?.trips?.find((t) => Number(t.id) === Number(value));
        if (matchingTrip) next.vehicle = String(matchingTrip.vehicle);
      }
      if (name === "station" || name === "trip" || name === "vehicle") next.charger = "";
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
      const payload = {
        station: Number(form.station),
        charger: Number(form.charger),
        vehicle: Number(form.vehicle || activeVehicle?.id),
        trip: form.trip ? Number(form.trip) : null,
        booking_date: form.booking_date,
        booking_start_time: form.booking_start_time,
        booking_end_time: form.booking_end_time,
        estimated_duration: Number(form.estimated_duration),
      };

      await evService.bookings.create(payload);
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
    setQrImageFailed(false);
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
        description="Reserve a compatible charger for direct charging or trip stops and present the generated QR code when you arrive."
        action={
          isUser ? (
            <button className="primary-button" disabled={!data.vehicles.length} onClick={openCreate} type="button">
              <FaPlus /> New booking
            </button>
          ) : null
        }
      />
      {isUser && !data.vehicles.length && (
        <div className="inline-alert">Add a vehicle in your profile before reserving a charger.</div>
      )}

      {data.bookings.length ? (
        <div className="booking-list">
          {data.bookings.map((booking) => {
            const station = data.stations.find((item) => Number(item.id) === Number(booking.station));
            const charger = data.chargers.find((item) => Number(item.id) === Number(booking.charger));
            
            const vehicleId = typeof booking.vehicle === "object" ? booking.vehicle?.id : booking.vehicle;
            const vehicleFromList = data.vehicles.find((item) => Number(item.id) === Number(vehicleId));
            const vehicle = typeof booking.vehicle === "object" ? booking.vehicle : (vehicleFromList || booking.trip?.vehicle || null);

            const tripId = typeof booking.trip === "object" ? booking.trip?.id : booking.trip;
            const trip = data.trips.find((item) => Number(item.id) === Number(tripId)) || (typeof booking.trip === "object" ? booking.trip : null);

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
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        Booking #{booking.id} · {trip ? `Trip: ${trip.source} ➜ ${trip.destination}` : "Charging-only booking"}
                      </p>
                      <h2>{station?.station_name || `Station #${booking.station}`}</h2>
                    </div>
                    <StatusBadge value={booking.booking_status} />
                  </div>
                  <div className="booking-info-row">
                    <span>
                      <FaClock /> {formatTime(booking.booking_start_time)} – {formatTime(booking.booking_end_time)}
                    </span>
                    <span>{charger?.charger_name || `Charger #${booking.charger}`}</span>
                    {vehicle && <span><FaCar /> {vehicle.brand} {vehicle.model} ({vehicle.registration_number})</span>}
                    <span>{booking.estimated_duration} minutes</span>
                  </div>
                </div>
                <div className="booking-card-actions">
                  <button className="secondary-button" onClick={() => showQr(booking)} type="button">
                    <FaQrcode /> QR
                  </button>
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
          message="Reserve a charger nearby or attach it to a planned road trip."
          action={
            isUser && data.vehicles.length ? (
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
          description="Select your vehicle and station. A trip is optional."
          onClose={() => setModal(null)}
        >
          <form className="form-grid" onSubmit={createBooking}>
            <Field label="Select Vehicle (Required)" full>
              <select name="vehicle" onChange={change} required value={form.vehicle || activeVehicle?.id || ""}>
                <option value="">Select vehicle</option>
                {data.vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.registration_number}) · Connector: {v.connector_type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Attach Road Trip (Optional)" full>
              <select name="trip" onChange={change} value={form.trip || ""}>
                <option value="">No trip — charging only</option>
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

      {modal === "qr" && selectedBooking && (() => {
        const isTripBooking = Boolean(selectedBooking.trip);

        const vehicleId = typeof selectedBooking.vehicle === "object" ? selectedBooking.vehicle?.id : selectedBooking.vehicle;
        const vehicleFromList = data?.vehicles?.find((v) => Number(v.id) === Number(vehicleId));
        const vehicle = typeof selectedBooking.vehicle === "object" ? selectedBooking.vehicle : (vehicleFromList || selectedBooking.trip?.vehicle || null);

        const tripId = typeof selectedBooking.trip === "object" ? selectedBooking.trip?.id : selectedBooking.trip;
        const trip = data?.trips?.find((t) => Number(t.id) === Number(tripId)) || (typeof selectedBooking.trip === "object" ? selectedBooking.trip : null);

        const stationId = typeof selectedBooking.station === "object" ? selectedBooking.station?.id : selectedBooking.station;
        const station = data?.stations?.find((s) => Number(s.id) === Number(stationId)) || (typeof selectedBooking.station === "object" ? selectedBooking.station : null);

        const chargerId = typeof selectedBooking.charger === "object" ? selectedBooking.charger?.id : selectedBooking.charger;
        const charger = data?.chargers?.find((c) => Number(c.id) === Number(chargerId)) || (typeof selectedBooking.charger === "object" ? selectedBooking.charger : null);

        let qrImageUrl = selectedBooking.qr_image_url || selectedBooking.qr_image || null;
        if (qrImageUrl && !qrImageUrl.startsWith("http") && !qrImageUrl.startsWith("/")) {
          qrImageUrl = `/media/${qrImageUrl}`;
        }

        const qrCode = selectedBooking.qr_code;

        return (
          <Modal
            title={`Booking #${selectedBooking.id} Verification QR`}
            description="Present this verification code or QR image to the station operator before charging."
            onClose={() => { setModal(null); setSelectedBooking(null); }}
          >
            <div className="qr-display" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="compatibility-badge info">
                  {isTripBooking ? "Trip-based booking" : "Charging-only booking"}
                </span>
                <StatusBadge value={selectedBooking.booking_status} />
              </div>

              {/* QR Image Container */}
              <div className="qr-surface" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "200px", padding: "16px", background: "#ffffff", borderRadius: "8px" }}>
                {qrImageUrl && !qrImageFailed ? (
                  <img
                    src={qrImageUrl}
                    alt={`QR Code for Booking #${selectedBooking.id}`}
                    style={{ maxWidth: "220px", height: "auto", borderRadius: "4px" }}
                    onError={() => setQrImageFailed(true)}
                  />
                ) : (
                  <div style={{ textAlign: "center", padding: "16px", color: "var(--text-muted)" }}>
                    <FaExclamationTriangle style={{ fontSize: "2rem", color: "#f59e0b", marginBottom: "8px" }} />
                    <p style={{ margin: 0, fontSize: "0.9rem" }}>QR image is not available for this booking.</p>
                  </div>
                )}
              </div>

              {/* Verification Code Card */}
              <div className="verification-code-card" style={{ textAlign: "center", padding: "12px", background: "var(--surface-hover)", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "block" }}>Verification Code</span>
                {qrCode ? (
                  <>
                    <strong style={{ fontSize: "1.3rem", letterSpacing: "1px", color: "var(--text-primary)", display: "block", margin: "6px 0" }}>
                      {qrCode}
                    </strong>
                    <button
                      className="secondary-button btn-sm"
                      onClick={() => {
                        navigator.clipboard.writeText(qrCode);
                        toast.success("Verification code copied to clipboard!");
                      }}
                      type="button"
                      style={{ marginTop: "6px" }}
                    >
                      <FaCopy /> Copy Code
                    </button>
                  </>
                ) : (
                  <p style={{ color: "var(--danger, #ef4444)", fontSize: "0.9rem", margin: "6px 0" }}>
                    Booking verification code is unavailable.
                  </p>
                )}
              </div>

              {/* Details Summary Grid */}
              <div className="form-grid" style={{ gap: "10px", fontSize: "0.9rem" }}>
                {isTripBooking && trip && (
                  <Field label="Associated Trip" full>
                    <input readOnly value={`${trip.source} ➜ ${trip.destination}`} />
                  </Field>
                )}
                <Field label="Station">
                  <input readOnly value={station?.station_name || `Station #${selectedBooking.station}`} />
                </Field>
                <Field label="Charger">
                  <input readOnly value={charger ? `${charger.charger_name} (${charger.connector_type || ""})` : `Charger #${selectedBooking.charger}`} />
                </Field>
                <Field label="Vehicle" full>
                  <input readOnly value={vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.registration_number})` : "N/A"} />
                </Field>
                <Field label="Date & Time" full>
                  <input readOnly value={`${formatDate(selectedBooking.booking_date)} · ${formatTime(selectedBooking.booking_start_time)} – ${formatTime(selectedBooking.booking_end_time)} (${selectedBooking.estimated_duration} mins)`} />
                </Field>
              </div>

              {/* Status Banner Policy */}
              <div>
                {selectedBooking.is_qr_used ? (
                  <div className="location-status-banner success">
                    <p>✓ This QR code has already been verified at the station.</p>
                  </div>
                ) : selectedBooking.booking_status === "COMPLETED" ? (
                  <div className="location-status-banner info">
                    <p>This booking is completed and historical session has ended.</p>
                  </div>
                ) : selectedBooking.booking_status === "CANCELLED" ? (
                  <div className="location-status-banner error">
                    <p>This booking was cancelled.</p>
                  </div>
                ) : (
                  <div className="location-status-banner info">
                    <p>Show this verification code or QR image to the station operator before charging.</p>
                  </div>
                )}
              </div>
            </div>
          </Modal>
        );
      })()}
    </section>
  );
}

export default BookingsPage;
