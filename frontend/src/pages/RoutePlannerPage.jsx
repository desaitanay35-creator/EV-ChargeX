import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import './RoutePlannerPage.css';

export default function RoutePlannerPage() {
  const { onMenuClick } = useOutletContext();
  const [form, setForm] = useState({ source: '', destination: '' });
  const [plan, setPlan] = useState(null);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.source || !form.destination) return;
    // Simple placeholder estimate until wired to a real routing/distance API.
    const distanceKm = Math.round(40 + Math.random() * 160);
    const stopsNeeded = Math.max(0, Math.floor(distanceKm / 120));
    setPlan({
      distanceKm,
      estimatedBatteryUse: Math.min(100, Math.round(distanceKm / 3.2)),
      stopsNeeded,
    });
  };

  return (
    <>
      <Header title="Route Planner" subtitle="Plan a trip and find charging stops along the way" onMenuClick={onMenuClick} />

      <form className="card route-planner-form" onSubmit={handleSubmit}>
        <label>
          Source
          <input required value={form.source} onChange={update('source')} placeholder="e.g. Mumbai" />
        </label>
        <label>
          Destination
          <input required value={form.destination} onChange={update('destination')} placeholder="e.g. Pune" />
        </label>
        <button type="submit" className="btn btn-primary">Calculate Route</button>
      </form>

      {plan && (
        <div className="card route-planner-result">
          <h2>{form.source} → {form.destination}</h2>
          <div className="route-planner-stats">
            <div>
              <span>Distance</span>
              <strong>{plan.distanceKm} km</strong>
            </div>
            <div>
              <span>Expected battery use</span>
              <strong>{plan.estimatedBatteryUse}%</strong>
            </div>
            <div>
              <span>Suggested charging stops</span>
              <strong>{plan.stopsNeeded}</strong>
            </div>
          </div>
          {plan.stopsNeeded > 0 && (
            <p className="route-planner-note">
              We recommend charging roughly every 120 km on this route — check the Station Finder to book stops along the way.
            </p>
          )}
        </div>
      )}
    </>
  );
}
