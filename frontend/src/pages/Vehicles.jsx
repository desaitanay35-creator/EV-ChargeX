import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Plus, Trash2, Zap, Car, ShieldAlert } from 'lucide-react';

export default function Vehicles({ showToast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: 'Car',
    brand: '',
    model: '',
    variant: '',
    registration_number: '',
    battery_capacity: '',
    current_battery_percentage: '80.00',
    connector_type: 'CCS2',
    efficiency: '',
    manufacturing_year: new Date().getFullYear(),
    color: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api('/vehicles/');
      setVehicles(data || []);
    } catch (err) {
      showToast(err.message || 'Failed to fetch vehicles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/vehicles/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Vehicle added successfully!');
      setShowAddForm(false);
      // Reset form
      setFormData({
        vehicle_type: 'Car',
        brand: '',
        model: '',
        variant: '',
        registration_number: '',
        battery_capacity: '',
        current_battery_percentage: '80.00',
        connector_type: 'CCS2',
        efficiency: '',
        manufacturing_year: new Date().getFullYear(),
        color: ''
      });
      fetchVehicles();
    } catch (err) {
      showToast(err.message || 'Failed to add vehicle', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await api(`/vehicles/${id}/`, {
        method: 'DELETE'
      });
      showToast('Vehicle removed successfully.');
      fetchVehicles();
    } catch (err) {
      showToast(err.message || 'Failed to remove vehicle', 'error');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem' }}>Garage</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your electric vehicles</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus size={16} />
          {showAddForm ? 'Close Form' : 'Register Vehicle'}
        </button>
      </div>

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '24px', animation: 'slideDown 0.3s ease-out' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Vehicle Specifications</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select name="vehicle_type" className="form-control" value={formData.vehicle_type} onChange={handleInputChange}>
                  <option value="Car">Car</option>
                  <option value="Bike">Two Wheeler / Bike</option>
                </select>
              </div>

              <div className="form-group">
                <label>Brand / Manufacturer</label>
                <input type="text" name="brand" placeholder="e.g. Tata, Hyundai, BMW" className="form-control" value={formData.brand} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Model Name</label>
                <input type="text" name="model" placeholder="e.g. Nexon EV, Kona, iX" className="form-control" value={formData.model} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Registration Number</label>
                <input type="text" name="registration_number" placeholder="e.g. GJ-01-EV-1234" className="form-control" value={formData.registration_number} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Battery Capacity (kWh)</label>
                <input type="number" step="0.01" name="battery_capacity" placeholder="e.g. 40.5" className="form-control" value={formData.battery_capacity} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Connector Port Type</label>
                <select name="connector_type" className="form-control" value={formData.connector_type} onChange={handleInputChange}>
                  <option value="CCS2">CCS2 (DC Fast Charge)</option>
                  <option value="Type2">Type 2 (AC Charge)</option>
                  <option value="GB/T">GB/T</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label>Current Battery (%)</label>
                <input type="number" step="0.01" name="current_battery_percentage" min="0" max="100" className="form-control" value={formData.current_battery_percentage} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Efficiency (kWh/100km or Wh/km)</label>
                <input type="number" step="0.01" name="efficiency" placeholder="e.g. 15.00" className="form-control" value={formData.efficiency} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Manufacturing Year</label>
                <input type="number" name="manufacturing_year" className="form-control" value={formData.manufacturing_year} onChange={handleInputChange} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label>Variant (Optional)</label>
                <input type="text" name="variant" placeholder="e.g. Max, Prime, EV400" className="form-control" value={formData.variant} onChange={handleInputChange} />
              </div>

              <div className="form-group">
                <label>Vehicle Color (Optional)</label>
                <input type="text" name="color" placeholder="e.g. Teal Blue, White" className="form-control" value={formData.color} onChange={handleInputChange} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '44px', marginTop: '10px' }}>
              Save Vehicle to Garage
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-muted)' }}>Loading garage inventory...</div>
      ) : vehicles.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <Car size={40} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.1rem' }}>No Registered Vehicles</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Add your electric vehicle above to plan routes and book slots.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {vehicles.map(v => (
            <div key={v.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, textTransform: 'uppercase', tracking: '1px' }}>
                    {v.vehicle_type}
                  </span>
                  <h3 style={{ fontSize: '1.2rem', marginTop: '4px' }}>{v.brand} {v.model}</h3>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.variant || 'Standard'}</span>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {v.registration_number}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '0.85rem'
              }}>
                <div>Port: <strong style={{ color: 'var(--color-secondary)' }}>{v.connector_type}</strong></div>
                <div>Battery Cap: <strong>{v.battery_capacity} kWh</strong></div>
                <div>Current Batt: <strong style={{ color: 'var(--color-primary)' }}>{v.current_battery_percentage}%</strong></div>
                <div>Efficiency: <strong>{v.efficiency}</strong></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span>Year: {v.manufacturing_year}</span>
                <button 
                  onClick={() => handleDelete(v.id)} 
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-danger)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
