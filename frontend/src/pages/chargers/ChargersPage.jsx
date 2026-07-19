import { useCallback, useMemo, useState } from "react";
import { FaBolt, FaEdit, FaPlug, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, Field, FormActions, LoadingState, Modal, PageHeader, StatusBadge } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
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

function ChargersPage() {
  const { role } = useAuth();
  const canManage = ["ADMIN", "OPERATOR"].includes(role?.toUpperCase());
  const loader = useCallback(async () => {
    const [chargers, stations] = await Promise.all([evService.chargers.list(), evService.stations.list()]);
    return { chargers: toList(chargers), stations: toList(stations) };
  }, []);
  const { data, loading, error, refresh } = useResource(loader);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");
  const [form, setForm] = useState(emptyCharger);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    const lowered = query.toLowerCase();
    return data.chargers.filter((charger) => {
      const station = data.stations.find((item) => Number(item.id) === Number(charger.station));
      return (status === "ALL" || charger.status === status) &&
        (!lowered || [charger.charger_name, charger.charger_number, charger.connector_type, station?.station_name].some((value) => value?.toLowerCase().includes(lowered)));
    });
  }, [data, query, status]);

  const openForm = (charger = null) => {
    setEditingId(charger?.id || null);
    setForm(charger ? Object.fromEntries(Object.keys(emptyCharger).map((key) => [key, charger[key] ?? ""])) : { ...emptyCharger, station: data.stations[0]?.id || "" });
    setModalOpen(true);
  };

  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = { ...form, last_maintenance: form.last_maintenance || null };
    try {
      if (editingId) await evService.chargers.update(editingId, payload);
      else await evService.chargers.create(payload);
      toast.success(editingId ? "Charger updated." : "Charger added.");
      setModalOpen(false);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save the charger."));
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
      toast.error(getApiError(requestError, "Could not delete the charger."));
    }
  };

  if (loading) return <LoadingState label="Loading charger inventory..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader eyebrow="Infrastructure" title="Chargers" description="Monitor connector compatibility, pricing and live charger state." action={canManage ? <button className="primary-button" onClick={() => openForm()} type="button"><FaPlus /> Add charger</button> : null} />
      <div className="page-toolbar">
        <input className="toolbar-input" onChange={(event) => setQuery(event.target.value)} placeholder="Search chargers or stations" value={query} />
        <select className="toolbar-select" onChange={(event) => setStatus(event.target.value)} value={status}><option value="ALL">All statuses</option><option>AVAILABLE</option><option>OCCUPIED</option><option>RESERVED</option><option>MAINTENANCE</option><option>OUT_OF_SERVICE</option></select>
        <span className="toolbar-count">{filtered.length} chargers</span>
      </div>
      {filtered.length ? (
        <div className="entity-card-grid">
          {filtered.map((charger) => {
            const station = data.stations.find((item) => Number(item.id) === Number(charger.station));
            return (
              <article className="entity-card charger-card" key={charger.id}>
                <div className="entity-card-top"><span className="entity-icon"><FaBolt /></span><StatusBadge value={charger.status} /></div>
                <div className="entity-card-title"><p>{station?.station_name || `Station #${charger.station}`}</p><h2>{charger.charger_name}</h2><span>{charger.charger_number}</span></div>
                <div className="charger-power"><strong>{Number(charger.power_output_kw).toFixed(0)}</strong><span>kW output</span></div>
                <div className="entity-details-grid">
                  <div><span>Connector</span><strong><FaPlug /> {charger.connector_type}</strong></div>
                  <div><span>Type</span><strong>{charger.charger_type}</strong></div>
                  <div><span>Price</span><strong>{formatCurrency(charger.price_per_kwh)}/kWh</strong></div>
                  <div><span>Installed</span><strong>{formatDate(charger.installation_date)}</strong></div>
                </div>
                {canManage && <div className="card-actions"><button className="secondary-button" onClick={() => openForm(charger)} type="button"><FaEdit /> Edit</button><button className="danger-button" onClick={() => remove(charger)} type="button"><FaTrash /></button></div>}
              </article>
            );
          })}
        </div>
      ) : <EmptyState title="No chargers found" message="Add infrastructure or change the active filters." />}

      {modalOpen && (
        <Modal title={editingId ? "Edit charger" : "Add charger"} description="Connector and pricing data is shown during booking." onClose={() => setModalOpen(false)} wide>
          <form className="form-grid" onSubmit={save}>
            <Field label="Station" full><select name="station" onChange={change} required value={form.station}><option value="">Select station</option>{data.stations.map((station) => <option key={station.id} value={station.id}>{station.station_name}</option>)}</select></Field>
            <Field label="Charger name"><input name="charger_name" onChange={change} required value={form.charger_name} /></Field>
            <Field label="Charger number"><input name="charger_number" onChange={change} required value={form.charger_number} /></Field>
            <Field label="Charger type"><select name="charger_type" onChange={change} value={form.charger_type}><option>AC</option><option>DC</option></select></Field>
            <Field label="Connector"><select name="connector_type" onChange={change} value={form.connector_type}><option>CCS2</option><option>Type2</option><option>GB/T</option><option>CHAdeMO</option></select></Field>
            <Field label="Power output (kW)"><input min="1" name="power_output_kw" onChange={change} required step="0.01" type="number" value={form.power_output_kw} /></Field>
            <Field label="Price per kWh"><input min="0" name="price_per_kwh" onChange={change} required step="0.01" type="number" value={form.price_per_kwh} /></Field>
            <Field label="Voltage"><input min="1" name="voltage" onChange={change} required type="number" value={form.voltage} /></Field>
            <Field label="Current (A)"><input min="1" name="current" onChange={change} required type="number" value={form.current} /></Field>
            <Field label="Status"><select name="status" onChange={change} value={form.status}><option>AVAILABLE</option><option>OCCUPIED</option><option>RESERVED</option><option>MAINTENANCE</option><option>OUT_OF_SERVICE</option></select></Field>
            <Field label="Installation date"><input name="installation_date" onChange={change} required type="date" value={form.installation_date} /></Field>
            <Field label="Last maintenance" full><input name="last_maintenance" onChange={change} type="date" value={form.last_maintenance} /></Field>
            <FormActions loading={saving} onCancel={() => setModalOpen(false)} submitLabel={editingId ? "Update charger" : "Add charger"} />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default ChargersPage;
