import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { getStationById } from '../services/stationService.js';
import { createBooking } from '../services/bookingService.js';
import { getVehicles } from '../services/userService.js';
import './BookingPage.css';

export default function BookingPage() {
  const { onMenuClick } = useOutletContext();
  const { id } = useParams();
  const navigate = useNavigate();

  const [station, setStation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({ vehicleId: '', date: '', startTime: '', endTime: '' });
  const [confirmation, setConfirmation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const [stationData, vehicleData] = await Promise.all([getStationById(id), getVehicles()]);
      setStation(stationData);
      setVehicles(vehicleData);
      setForm((f) => ({ ...f, vehicleId: vehicleData.find((v) => v.isDefault)?.id || vehicleData[0]?.id || '' }));
    })();
  }, [id]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await createBooking({ stationId: id, stationName: station?.name, ...form });
    setConfirmation(result);
    setIsSubmitting(false);
  };

  if (!station) {
    return (
      <>
        <Header title="Book a Slot" onMenuClick={onMenuClick} />
        <p className="dashboard-empty">Loading…</p>
      </>
    );
  }

  if (confirmation) {
    return (
      <>
        <Header title="Booking Confirmed" onMenuClick={onMenuClick} />
        <div className="card booking-confirmation">
          <span className="badge badge-success">CONFIRMED</span>
          <h2>{station.name}</h2>
          <p>{form.date} · {form.startTime} - {form.endTime}</p>
          <p className="booking-id">Booking ID: {confirmation.id}</p>
          <div className="booking-confirmation-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </button>
            <button className="btn btn-primary" onClick={() => navigate('/stations')}>
              Find Another Station
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Book a Slot" subtitle={station.name} onMenuClick={onMenuClick} />

      <form className="card booking-form" onSubmit={handleSubmit}>
        <div className="booking-summary">
          <span className="badge badge-info">{station.chargerType} · {station.powerKw} kW</span>
          <span className="badge badge-warning">₹{station.pricePerKwh}/kWh</span>
        </div>

        <label>
          Vehicle
          <select value={form.vehicleId} onChange={update('vehicleId')} required>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plate})</option>
            ))}
          </select>
        </label>

        <label>
          Date
          <input type="date" value={form.date} onChange={update('date')} required />
        </label>

        <div className="booking-form-row">
          <label>
            Start time
            <input type="time" value={form.startTime} onChange={update('startTime')} required />
          </label>
          <label>
            End time
            <input type="time" value={form.endTime} onChange={update('endTime')} required />
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Confirming…' : 'Confirm Booking'}
        </button>
      </form>
    </>
  );
}
