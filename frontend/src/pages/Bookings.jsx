import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Calendar, Clock, MapPin, QrCode, Power, XCircle, Zap } from 'lucide-react';

export default function Bookings({ showToast }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQrBooking, setActiveQrBooking] = useState(null);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await api('/bookings/');
      setBookings(data || []);
    } catch (err) {
      showToast('Error fetching bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      // Modify status to CANCELLED or delete. Let's delete or patch.
      // In models, Booking has booking_status. Since BookingDetailView supports UPDATE, let's patch it:
      await api(`/bookings/${id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ booking_status: 'CANCELLED' })
      });
      showToast('Booking cancelled successfully.');
      fetchBookings();
    } catch (err) {
      showToast(err.message || 'Cancellation failed', 'error');
    }
  };

  const handleStartCharging = async (booking) => {
    try {
      // Fetch details of trip to get vehicle
      const tripDetail = await api(`/trips/${booking.trip}/`);
      const vehicleDetail = await api(`/vehicles/${tripDetail.vehicle}/`);

      const session = await api('/charging/sessions/', {
        method: 'POST',
        body: JSON.stringify({
          booking: booking.id,
          charger: booking.charger,
          vehicle: tripDetail.vehicle,
          start_time: new Date().toISOString(),
          battery_before: vehicleDetail.current_battery_percentage,
          session_status: 'ACTIVE'
        })
      });

      // Update Booking status to COMPLETED
      await api(`/bookings/${booking.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ booking_status: 'COMPLETED' })
      });

      showToast('Charging session initialized!');
      navigate('/charging');
    } catch (err) {
      showToast(err.message || 'Failed to start charging session', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Retrieving bookings registry...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem' }}>Reservations</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your reserved time-slots and verify check-ins</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
          <Calendar size={40} color="var(--text-muted)" />
          <h3 style={{ fontSize: '1.1rem' }}>No Active Bookings</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Book a charger from the Route Planner tab to schedule a session.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Slot Reservation #{b.id}
                  </span>
                  <h3 style={{ fontSize: '1.1rem', marginTop: '4px' }}>Station ID: {b.station}</h3>
                </div>
                <span className={`status-badge status-${b.booking_status.toLowerCase()}`}>
                  {b.booking_status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={14} color="var(--color-primary)" />
                  <span>Date: <strong>{b.booking_date}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="var(--color-primary)" />
                  <span>Time window: <strong>{b.booking_start_time} - {b.booking_end_time}</strong> ({b.estimated_duration} mins)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={14} color="var(--color-primary)" />
                  <span>Charger Reference ID: <strong>{b.charger}</strong></span>
                </div>
              </div>

              {b.booking_status === 'PENDING' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }} onClick={() => setActiveQrBooking(b)}>
                    <QrCode size={14} />
                    Check-in QR
                  </button>
                  <button className="btn btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }} onClick={() => handleCancel(b.id)}>
                    <XCircle size={14} />
                    Cancel
                  </button>
                </div>
              )}

              {b.booking_status === 'CONFIRMED' && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button className="btn btn-primary" style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '6px', fontSize: '0.85rem' }} onClick={() => handleStartCharging(b)}>
                    <Power size={14} />
                    Initialize Charging
                  </button>
                  <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }} onClick={() => setActiveQrBooking(b)}>
                    <QrCode size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Code check-in overlay */}
      {activeQrBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '360px', padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Booking Check-in Token</h3>
            
            {/* Generate actual QR code utilizing qrserver API */}
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${activeQrBooking.qr_code || `EV-BKG-${activeQrBooking.id}`}`} 
                alt="Booking Check-in QR" 
                style={{ width: '180px', height: '180px' }}
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <strong style={{ fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>{activeQrBooking.qr_code || `EV-BKG-${activeQrBooking.id}`}</strong>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Scan this QR at the station terminal to confirm slot check-in.
              </p>
            </div>

            <button className="btn btn-outline" style={{ width: '100%', height: '40px' }} onClick={() => setActiveQrBooking(null)}>
              Close Token
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
