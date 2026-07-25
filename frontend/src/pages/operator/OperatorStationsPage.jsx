import { useCallback, useState } from "react";
import { FaClock, FaEdit, FaEnvelope, FaMapMarkerAlt, FaPhone, FaPlug, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatTime } from "../../utils/format";

const emptyEditForm = {
  opening_time: "06:00",
  closing_time: "23:00",
  contact_number: "",
  email: "",
  amenities: "",
  status: "OPEN",
};

function OperatorStationsPage() {
  const navigate = useNavigate();

  const loader = useCallback(async () => {
    const [stations, chargers, bookings, sessions] = await Promise.all([
      evService.stations.list(),
      evService.chargers.list(),
      evService.bookings.list(),
      evService.sessions.list(),
    ]);
    return {
      stations: toList(stations),
      chargers: toList(chargers),
      bookings: toList(bookings),
      sessions: toList(sessions),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);
  const [editingStation, setEditingStation] = useState(null);
  const [form, setForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);

  const openEdit = (station) => {
    setEditingStation(station);
    setForm({
      opening_time: station.opening_time || "06:00",
      closing_time: station.closing_time || "23:00",
      contact_number: station.contact_number || "",
      email: station.email || "",
      amenities: station.amenities || "",
      status: station.status || "OPEN",
    });
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    if (!editingStation || saving) return;
    setSaving(true);
    try {
      await evService.stations.update(editingStation.id, form);
      toast.success("Station operational details updated.");
      setEditingStation(null);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update station details."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading assigned stations..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const stations = data.stations;

  return (
    <section>
      <PageHeader
        eyebrow="Station Management"
        title="Assigned stations"
        description="Monitor status, operating hours, charger infrastructure and operational details for your stations."
      />

      {stations.length ? (
        <div className="entity-card-grid">
          {stations.map((station) => {
            const stationChargers = data.chargers.filter(
              (c) => Number(c.station) === Number(station.id)
            );
            const availableCount = stationChargers.filter((c) => c.status === "AVAILABLE").length;
            const occupiedCount = stationChargers.filter((c) => c.status === "OCCUPIED").length;
            const reservedCount = stationChargers.filter((c) => c.status === "RESERVED").length;
            const maintenanceCount = stationChargers.filter((c) => c.status === "MAINTENANCE" || c.status === "OUT_OF_SERVICE").length;

            return (
              <article className="entity-card station-card" key={station.id}>
                <div className="entity-card-top">
                  <span className="entity-icon"><FaPlug /></span>
                  <StatusBadge value={station.status} />
                </div>
                <div className="entity-card-title">
                  <p><FaMapMarkerAlt /> {station.city}, {station.state}</p>
                  <h2>{station.station_name}</h2>
                  <span>{station.address}</span>
                </div>

                <div className="station-availability">
                  <strong>{availableCount} / {stationChargers.length}</strong>
                  <span>Chargers available now</span>
                </div>

                <div className="entity-details-grid">
                  <div>
                    <span>Hours</span>
                    <strong><FaClock /> {formatTime(station.opening_time)} – {formatTime(station.closing_time)}</strong>
                  </div>
                  <div>
                    <span>Rating</span>
                    <strong><FaStar style={{ color: "#fcd34d" }} /> {station.rating || "0.0"}</strong>
                  </div>
                  <div>
                    <span>Contact</span>
                    <strong><FaPhone /> {station.contact_number || "—"}</strong>
                  </div>
                  <div>
                    <span>Email</span>
                    <strong><FaEnvelope /> {station.email || "—"}</strong>
                  </div>
                </div>

                <div className="card-actions">
                  <button
                    className="secondary-button"
                    onClick={() => openEdit(station)}
                    type="button"
                  >
                    <FaEdit /> Edit details
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => navigate(`/operator/chargers?station=${station.id}`)}
                    type="button"
                  >
                    Manage chargers ({stationChargers.length})
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No station is currently assigned to your account."
          message="Contact an administrator to receive a station assignment."
        />
      )}

      {editingStation && (
        <Modal
          title={`Edit ${editingStation.station_name}`}
          description="Update operational hours, status and contact info for this station."
          onClose={() => setEditingStation(null)}
        >
          <form className="form-grid" onSubmit={save}>
            <Field label="Station status">
              <select name="status" onChange={change} value={form.status}>
                <option value="OPEN">Open</option>
                <option value="CLOSED">Closed</option>
                <option value="MAINTENANCE">Maintenance</option>
              </select>
            </Field>

            <Field label="Contact number">
              <input name="contact_number" onChange={change} value={form.contact_number} />
            </Field>

            <Field label="Opening time">
              <input name="opening_time" onChange={change} type="time" value={form.opening_time} />
            </Field>

            <Field label="Closing time">
              <input name="closing_time" onChange={change} type="time" value={form.closing_time} />
            </Field>

            <Field label="Contact email" full>
              <input name="email" onChange={change} type="email" value={form.email} />
            </Field>

            <Field label="Amenities (comma separated)" full>
              <input name="amenities" onChange={change} placeholder="WiFi, Restroom, Cafe, Parking" value={form.amenities} />
            </Field>

            <FormActions
              loading={saving}
              onCancel={() => setEditingStation(null)}
              submitLabel={saving ? "Saving..." : "Update station"}
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default OperatorStationsPage;
