import { useCallback, useState } from "react";
import { FaBatteryThreeQuarters, FaCar, FaEdit, FaPlug, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import {
  EmptyState,
  ErrorState,
  Field,
  FormActions,
  LoadingState,
  Modal,
  PageHeader,
  StatusBadge,
} from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";

const currentYear = new Date().getFullYear();
const emptyVehicle = {
  vehicle_type: "Car",
  brand: "",
  model: "",
  variant: "",
  registration_number: "",
  battery_capacity: "",
  current_battery_percentage: "80",
  connector_type: "CCS2",
  efficiency: "15",
  manufacturing_year: currentYear.toString(),
  color: "",
};

function VehiclesPage() {
  const loader = useCallback(() => evService.vehicles.list(), []);
  const { data, loading, error, refresh } = useResource(loader);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyVehicle);
  const [saving, setSaving] = useState(false);

  const vehicles = toList(data);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyVehicle);
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setEditingId(vehicle.id);
    setForm(
      Object.fromEntries(Object.keys(emptyVehicle).map((key) => [key, vehicle[key] ?? ""]))
    );
    setModalOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await evService.vehicles.update(editingId, form);
        toast.success("Vehicle updated.");
      } else {
        await evService.vehicles.create(form);
        toast.success("Vehicle added to your garage.");
      }
      setModalOpen(false);
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not save the vehicle."));
    } finally {
      setSaving(false);
    }
  };

  const removeVehicle = async (vehicle) => {
    if (!window.confirm(`Remove ${vehicle.brand} ${vehicle.model} from your garage?`)) return;

    try {
      await evService.vehicles.remove(vehicle.id);
      toast.success("Vehicle removed.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not remove the vehicle."));
    }
  };

  if (loading) return <LoadingState label="Loading your EV garage..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader
        eyebrow="My garage"
        title="Electric vehicles"
        description="Vehicle battery, connector and efficiency data power the trip and charging predictions."
        action={<button className="primary-button" onClick={openCreate} type="button"><FaPlus /> Add vehicle</button>}
      />

      {vehicles.length ? (
        <div className="entity-card-grid">
          {vehicles.map((vehicle) => {
            const battery = Number(vehicle.current_battery_percentage || 0);
            return (
              <article className="entity-card vehicle-card" key={vehicle.id}>
                <div className="entity-card-top">
                  <span className="entity-icon"><FaCar /></span>
                  <StatusBadge value={battery > 25 ? "Healthy" : "Low"} />
                </div>
                <div className="entity-card-title">
                  <p>{vehicle.vehicle_type} · {vehicle.manufacturing_year}</p>
                  <h2>{vehicle.brand} {vehicle.model}</h2>
                  <span>{vehicle.registration_number}</span>
                </div>
                <div className="battery-meter-row">
                  <div><FaBatteryThreeQuarters /><strong>{battery.toFixed(0)}%</strong></div>
                  <div className="battery-progress compact"><div className="battery-progress-value" style={{ width: `${Math.min(100, battery)}%` }} /></div>
                </div>
                <div className="entity-details-grid">
                  <div><span>Capacity</span><strong>{vehicle.battery_capacity} kWh</strong></div>
                  <div><span>Connector</span><strong><FaPlug /> {vehicle.connector_type}</strong></div>
                  <div><span>Efficiency</span><strong>{vehicle.efficiency}</strong></div>
                  <div><span>Variant</span><strong>{vehicle.variant || "Standard"}</strong></div>
                </div>
                <div className="card-actions">
                  <button className="secondary-button" onClick={() => openEdit(vehicle)} type="button"><FaEdit /> Edit</button>
                  <button className="danger-button" onClick={() => removeVehicle(vehicle)} type="button" aria-label="Delete vehicle"><FaTrash /></button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Your garage is empty" message="Add an electric vehicle to begin planning trips and booking compatible chargers." action={<button className="primary-button" onClick={openCreate} type="button">Add your first EV</button>} />
      )}

      {modalOpen && (
        <Modal title={editingId ? "Edit vehicle" : "Add electric vehicle"} description="Use the values from your vehicle specifications." onClose={() => setModalOpen(false)} wide>
          <form className="form-grid" onSubmit={handleSubmit}>
            <Field label="Vehicle type"><select name="vehicle_type" onChange={handleChange} value={form.vehicle_type}><option>Car</option><option>Bike</option></select></Field>
            <Field label="Brand"><input name="brand" onChange={handleChange} required value={form.brand} /></Field>
            <Field label="Model"><input name="model" onChange={handleChange} required value={form.model} /></Field>
            <Field label="Variant"><input name="variant" onChange={handleChange} value={form.variant} /></Field>
            <Field label="Registration number"><input name="registration_number" onChange={handleChange} placeholder="GJ01AB1234" required value={form.registration_number} /></Field>
            <Field label="Manufacturing year"><input max={currentYear + 1} min="2000" name="manufacturing_year" onChange={handleChange} required type="number" value={form.manufacturing_year} /></Field>
            <Field label="Battery capacity (kWh)"><input min="1" name="battery_capacity" onChange={handleChange} required step="0.01" type="number" value={form.battery_capacity} /></Field>
            <Field label="Current battery (%)"><input max="100" min="0" name="current_battery_percentage" onChange={handleChange} required step="0.01" type="number" value={form.current_battery_percentage} /></Field>
            <Field label="Connector type"><select name="connector_type" onChange={handleChange} value={form.connector_type}><option>CCS2</option><option>Type2</option><option>GB/T</option><option>CHAdeMO</option></select></Field>
            <Field label="Efficiency" hint="Use your vehicle's kWh/100km or Wh/km rating."><input min="0.01" name="efficiency" onChange={handleChange} required step="0.01" type="number" value={form.efficiency} /></Field>
            <Field full label="Colour"><input name="color" onChange={handleChange} value={form.color} /></Field>
            <FormActions loading={saving} onCancel={() => setModalOpen(false)} submitLabel={editingId ? "Update vehicle" : "Add vehicle"} />
          </form>
        </Modal>
      )}
    </section>
  );
}

export default VehiclesPage;
