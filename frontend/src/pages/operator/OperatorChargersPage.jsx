import { useCallback, useMemo, useState } from "react";
import { FaBolt, FaEdit, FaPlug, FaPlus, FaTrash } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatCurrency, formatDate } from "../../utils/format";

const today = new Date().toISOString().slice(0, 10);
const emptyCharger = {
  station: "",
  charger_name: "",
  charger_number: "",
  charger_type: "DC",
  connector_type: "CCS2",
  power_output_kw: "30",
  voltage: "400",
  current: "80",
  price_per_kwh: "12",
  status: "AVAILABLE",
  installation_date: today,
  last_maintenance: "",
};

function OperatorChargersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const stationParam = searchParams.get("station");

  const loader = useCallback(async () => {
    const [chargers, stations] = await Promise.all([
      evService.chargers.list(),
      evService.stations.list(),
    ]);
    return {
      chargers: toList(chargers),
      stations: toList(stations),
    };
  }, []);

  const { data, loading, error, refresh } = useResource(loader);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [connectorFilter, setConnectorFilter] = useState("ALL");
  const [selectedStationFilter, setSelectedStationFilter] = useState(stationParam || "ALL");

  const [form, setForm] = useState(emptyCharger);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const lowered = query.toLowerCase().trim();
    return data.chargers.filter((charger) => {
      const station = data.stations.find((s) => Number(s.id) === Number(charger.station));
      const matchesStation = selectedStationFilter === "ALL" || Number(charger.station) === Number(selectedStationFilter);
      const matchesStatus = statusFilter === "ALL" || charger.status === statusFilter;
      const matchesConnector = connectorFilter === "ALL" || charger.connector_type === connectorFilter;
      const matchesSearch =
        !lowered ||
        [charger.charger_name, charger.charger_number, charger.connector_type, station?.station_name]
          .some((val) => val?.toLowerCase().includes(lowered));

      return matchesStation && matchesStatus && matchesConnector && matchesSearch;
    });
  }, [data, query, statusFilter, connectorFilter, selectedStationFilter]);

  const openForm = (charger = null) => {
    setEditingId(charger?.id || null);
    if (charger) {
      setForm(Object.fromEntries(Object.keys(emptyCharger).map((key) => [key, charger[key] ?? ""])));
    } else {
      const defaultStation = stationParam || data.stations[0]?.id || "";
      setForm({ ...emptyCharger, station: String(defaultStation) });
    }
    setModalOpen(true);
  };

  const change = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, last_maintenance: form.last_maintenance || null };
    try {
      if (editingId) {
        await evService.chargers.update(editingId, payload);
        toast.success("Charger updated successfully.");
      } else {
        await evService.chargers.create(payload);
        toast.success("Charger added to assigned station.");
      }
      setModalOpen(false);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save charger. Check inputs and station status."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (charger) => {
    if (!window.confirm(`Delete charger ${charger.charger_name}?`)) return;
    try {
      await evService.chargers.remove(charger.id);
      toast.success("Charger deleted.");
      refresh();
    } catch (requestError) {
      const msg = getApiError(requestError);
      if (msg.includes("operational history")) {
        toast.error(msg);
        try {
          await evService.chargers.update(charger.id, { status: "OUT_OF_SERVICE" });
          toast.info(`Marked charger #${charger.id} as Out of Service.`);
          refresh();
        } catch (updateErr) {
          console.error("Could not set out of service:", updateErr);
        }
      } else {
        toast.error(msg || "Could not delete charger.");
      }
    }
  };

  if (loading) return <LoadingState label="Loading charger inventory..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const hasAssignedStation = data.stations.length > 0;

  return (
    <section>
      <PageHeader
        eyebrow="Infrastructure"
        title="Chargers"
        description="Manage charger status, pricing per kWh, power output and connector configurations for your assigned stations."
        action={
          hasAssignedStation ? (
            <button className="primary-button" onClick={() => openForm()} type="button">
              <FaPlus /> Add charger
            </button>
          ) : null
        }
      />

      {!hasAssignedStation && (
        <div className="location-status-banner error" style={{ marginBottom: "20px" }}>
          <p>You need an assigned station before adding chargers. Contact an administrator to receive a station assignment.</p>
        </div>
      )}

      {/* Control Toolbar */}
      <div className="page-toolbar">
        <input
          className="toolbar-input"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search charger name, number or station"
          value={query}
        />

        {data.stations.length > 1 && (
          <select
            className="toolbar-select"
            onChange={(e) => {
              setSelectedStationFilter(e.target.value);
              setSearchParams(e.target.value === "ALL" ? {} : { station: e.target.value });
            }}
            value={selectedStationFilter}
          >
            <option value="ALL">All assigned stations</option>
            {data.stations.map((s) => (
              <option key={s.id} value={s.id}>{s.station_name}</option>
            ))}
          </select>
        )}

        <select
          className="toolbar-select"
          onChange={(e) => setConnectorFilter(e.target.value)}
          value={connectorFilter}
        >
          <option value="ALL">All connectors</option>
          <option value="CCS2">CCS2</option>
          <option value="Type2">Type2</option>
          <option value="GB/T">GB/T</option>
          <option value="CHAdeMO">CHAdeMO</option>
        </select>

        <select
          className="toolbar-select"
          onChange={(e) => setStatusFilter(e.target.value)}
          value={statusFilter}
        >
          <option value="ALL">All statuses</option>
          <option value="AVAILABLE">AVAILABLE</option>
          <option value="OCCUPIED">OCCUPIED</option>
          <option value="RESERVED">RESERVED</option>
          <option value="MAINTENANCE">MAINTENANCE</option>
          <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
        </select>

        <span className="toolbar-count">{filtered.length} chargers</span>
      </div>

      {filtered.length ? (
        <div className="entity-card-grid">
          {filtered.map((charger) => {
            const station = data.stations.find((item) => Number(item.id) === Number(charger.station));
            return (
              <article className="entity-card charger-card" key={charger.id}>
                <div className="entity-card-top">
                  <span className="entity-icon"><FaBolt /></span>
                  <StatusBadge value={charger.status} />
                </div>

                <div className="entity-card-title">
                  <p>{station?.station_name || `Station #${charger.station}`}</p>
                  <h2>{charger.charger_name}</h2>
                  <span>{charger.charger_number}</span>
                </div>

                <div className="charger-power">
                  <strong>{Number(charger.power_output_kw).toFixed(0)} kW</strong>
                  <span>{charger.charger_type} output</span>
                </div>

                <div className="entity-details-grid">
                  <div>
                    <span>Connector</span>
                    <strong><FaPlug /> {charger.connector_type}</strong>
                  </div>
                  <div>
                    <span>Price</span>
                    <strong>{formatCurrency(charger.price_per_kwh)}/kWh</strong>
                  </div>
                  <div>
                    <span>Voltage/Current</span>
                    <strong>{charger.voltage}V · {charger.current}A</strong>
                  </div>
                  <div>
                    <span>Installed</span>
                    <strong>{formatDate(charger.installation_date)}</strong>
                  </div>
                </div>

                <div className="card-actions">
                  <button className="secondary-button" onClick={() => openForm(charger)} type="button">
                    <FaEdit /> Edit
                  </button>
                  <button className="danger-button" onClick={() => remove(charger)} type="button">
                    <FaTrash />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title={hasAssignedStation ? "No chargers found" : "You need an assigned station before adding chargers."}
          message={hasAssignedStation ? "Add chargers to your station or adjust active filters." : "Contact an administrator to receive a station assignment."}
        />
      )}

      {modalOpen && (
        <Modal
          title={editingId ? "Edit charger" : "Add charger"}
          description="Charger specs and status are visible during driver reservation."
          onClose={() => setModalOpen(false)}
          wide
        >
          <form className="form-grid" onSubmit={save}>
            <Field label="Assigned station" full>
              <select
                disabled={Boolean(editingId)}
                name="station"
                onChange={change}
                required
                value={form.station}
              >
                <option value="">Select assigned station</option>
                {data.stations.map((station) => (
                  <option key={station.id} value={station.id}>
                    {station.station_name} · {station.city}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Charger name">
              <input name="charger_name" onChange={change} required value={form.charger_name} />
            </Field>

            <Field label="Charger number">
              <input name="charger_number" onChange={change} required value={form.charger_number} />
            </Field>

            <Field label="Charger type">
              <select name="charger_type" onChange={change} value={form.charger_type}>
                <option value="AC">AC</option>
                <option value="DC">DC</option>
              </select>
            </Field>

            <Field label="Connector type">
              <select name="connector_type" onChange={change} value={form.connector_type}>
                <option value="CCS2">CCS2</option>
                <option value="Type2">Type2</option>
                <option value="GB/T">GB/T</option>
                <option value="CHAdeMO">CHAdeMO</option>
              </select>
            </Field>

            <Field label="Power output (kW)">
              <input min="1" name="power_output_kw" onChange={change} required step="0.1" type="number" value={form.power_output_kw} />
            </Field>

            <Field label="Price per kWh (₹)">
              <input min="0" name="price_per_kwh" onChange={change} required step="0.01" type="number" value={form.price_per_kwh} />
            </Field>

            <Field label="Voltage (V)">
              <input min="1" name="voltage" onChange={change} required type="number" value={form.voltage} />
            </Field>

            <Field label="Current (A)">
              <input min="1" name="current" onChange={change} required type="number" value={form.current} />
            </Field>

            <Field label="Operational status">
              <select name="status" onChange={change} value={form.status}>
                <option value="AVAILABLE">AVAILABLE (Operational)</option>
                {form.status === "OCCUPIED" && <option value="OCCUPIED">OCCUPIED (Active Session in Progress)</option>}
                {form.status === "RESERVED" && <option value="RESERVED">RESERVED (Active Booking)</option>}
                <option value="MAINTENANCE">MAINTENANCE (Under Repair)</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE (Disabled)</option>
              </select>
            </Field>

            <Field label="Installation date">
              <input name="installation_date" onChange={change} required type="date" value={form.installation_date} />
            </Field>

            <Field label="Last maintenance date" full>
              <input name="last_maintenance" onChange={change} type="date" value={form.last_maintenance} />
            </Field>

            <FormActions
              loading={saving}
              onCancel={() => setModalOpen(false)}
              submitLabel={editingId ? "Update charger" : "Add charger"}
            />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default OperatorChargersPage;
