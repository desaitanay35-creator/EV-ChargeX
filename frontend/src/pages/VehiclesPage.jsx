import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { getVehicles, addVehicle } from '../services/userService.js';
import './VehiclesPage.css';

const EMPTY_FORM = { make: '', model: '', year: '', batteryKwh: '', connector: 'CCS2', plate: '' };

export default function VehiclesPage() {
  const { onMenuClick } = useOutletContext();
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setVehicles(await getVehicles());
      setIsLoading(false);
    })();
  }, []);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newVehicle = await addVehicle(form);
    setVehicles((prev) => [...prev, newVehicle]);
    setForm(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <>
      <Header title="My Vehicles" subtitle="Manage the vehicles linked to your account" onMenuClick={onMenuClick} />

      <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)} style={{ marginBottom: 'var(--space-5)' }}>
        {showForm ? 'Cancel' : '+ Add Vehicle'}
      </button>

      {showForm && (
        <form className="card vehicle-form" onSubmit={handleSubmit}>
          <div className="vehicle-form-row">
            <label>Make <input required value={form.make} onChange={update('make')} placeholder="Tata" /></label>
            <label>Model <input required value={form.model} onChange={update('model')} placeholder="Nexon EV" /></label>
          </div>
          <div className="vehicle-form-row">
            <label>Year <input type="number" required value={form.year} onChange={update('year')} placeholder="2024" /></label>
            <label>Battery (kWh) <input type="number" required value={form.batteryKwh} onChange={update('batteryKwh')} placeholder="40.5" /></label>
          </div>
          <div className="vehicle-form-row">
            <label>
              Connector
              <select value={form.connector} onChange={update('connector')}>
                <option>CCS2</option>
                <option>Type 2</option>
                <option>CHAdeMO</option>
              </select>
            </label>
            <label>Plate number <input required value={form.plate} onChange={update('plate')} placeholder="MH12 AB 1234" /></label>
          </div>
          <button type="submit" className="btn btn-primary">Save Vehicle</button>
        </form>
      )}

      {isLoading ? (
        <p className="dashboard-empty">Loading vehicles…</p>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((v) => (
            <div className="card vehicle-card" key={v.id}>
              <div className="vehicle-card-top">
                <h3>{v.make} {v.model}</h3>
                {v.isDefault && <span className="badge badge-success">Default</span>}
              </div>
              <p className="vehicle-plate">{v.plate}</p>
              <div className="vehicle-meta">
                <span>{v.year}</span>
                <span>{v.batteryKwh} kWh</span>
                <span>{v.connector}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
