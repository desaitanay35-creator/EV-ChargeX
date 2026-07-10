import React, { useState, useEffect } from 'react';
import { api, auth } from '../utils/api';
import { 
  Zap, Car, Calendar, CreditCard, Shield, Settings,
  AlertTriangle, Power, ToggleLeft, ToggleRight, CheckCircle2 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, Cell
} from 'recharts';

export default function Dashboard({ showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [operatorChargers, setOperatorChargers] = useState([]);
  const [operatorBookings, setOperatorBookings] = useState([]);
  const user = auth.getUser();
  const isOperator = user.role === 'OPERATOR';

  const fetchUserStats = async () => {
    try {
      const data = await api('/reports/dashboard/');
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOperatorData = async () => {
    try {
      const chargersData = await api('/charging/chargers/');
      setOperatorChargers(chargersData || []);
      
      const bookingsData = await api('/bookings/');
      setOperatorBookings(bookingsData || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (isOperator) {
      await fetchOperatorData();
    } else {
      await fetchUserStats();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleChargerStatus = async (chargerId, currentStatus) => {
    const nextStatus = currentStatus === 'AVAILABLE' ? 'MAINTENANCE' : 'AVAILABLE';
    try {
      await api(`/charging/chargers/${chargerId}/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      showToast(`Charger set to ${nextStatus}`);
      fetchOperatorData();
    } catch (err) {
      showToast(err.message || 'Failed to update charger status', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Loading telemetry data...</div>;
  }

  // Simulated chart data for beautiful UI visual representation
  const mockChartData = [
    { name: 'Mon', energy: 12, cost: 240 },
    { name: 'Tue', energy: 19, cost: 380 },
    { name: 'Wed', energy: 15, cost: 300 },
    { name: 'Thu', energy: 28, cost: 560 },
    { name: 'Fri', energy: 22, cost: 440 },
    { name: 'Sat', energy: 35, cost: 700 },
    { name: 'Sun', energy: 25, cost: 500 },
  ];

  if (isOperator) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        {/* Operator metrics panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Managed Chargers</span>
              <Zap size={18} color="var(--color-primary)" />
            </div>
            <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
              {operatorChargers.length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active across your stations</div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Active Bookings</span>
              <Calendar size={18} color="var(--color-secondary)" />
            </div>
            <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
              {operatorBookings.filter(b => b.booking_status === 'CONFIRMED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confirmed slots reserved today</div>
          </div>

          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Occupied Chargers</span>
              <Shield size={18} color="var(--color-warning)" />
            </div>
            <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
              {operatorChargers.filter(c => c.status === 'OCCUPIED').length}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently drawing electric power</div>
          </div>
        </div>

        {/* Chargers Management Status Grid */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={20} color="var(--color-primary)" />
            Station Charger Operations Control
          </h2>
          {operatorChargers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No chargers currently registered to your operator account.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {operatorChargers.map(charger => (
                <div key={charger.id} className="glass-card" style={{
                  borderLeft: `4px solid ${
                    charger.status === 'AVAILABLE' ? 'var(--color-primary)' :
                    charger.status === 'OCCUPIED' ? 'var(--color-secondary)' : 'var(--color-danger)'
                  }`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{charger.charger_name}</span>
                    <span className={`status-badge status-${charger.status.toLowerCase().replace(/_/g, '')}`}>
                      {charger.status}
                    </span>
                  </div>
                  
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>Power: <strong>{charger.power_output_kw} kW</strong></div>
                    <div>Type: <strong>{charger.charger_type}</strong></div>
                    <div>Connector: <strong>{charger.connector_type}</strong></div>
                    <div>Rate: <strong>₹{charger.price_per_kwh}/kWh</strong></div>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--border-glass)',
                    paddingTop: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status Control:</span>
                    <button
                      onClick={() => handleToggleChargerStatus(charger.id, charger.status)}
                      disabled={charger.status === 'OCCUPIED'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: charger.status === 'OCCUPIED' ? 'not-allowed' : 'pointer',
                        color: charger.status === 'AVAILABLE' ? 'var(--color-primary)' : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {charger.status === 'AVAILABLE' ? (
                        <>
                          <ToggleLeft size={24} color="var(--color-primary)" />
                          Active
                        </>
                      ) : charger.status === 'MAINTENANCE' ? (
                        <>
                          <ToggleRight size={24} color="var(--color-danger)" />
                          Maintenance
                        </>
                      ) : (
                        <>
                          <Power size={16} />
                          Charging...
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Booking Schedule */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '20px' }}>Slot Bookings Logs</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>Booking ID</th>
                  <th style={{ padding: '12px' }}>Date</th>
                  <th style={{ padding: '12px' }}>Time Window</th>
                  <th style={{ padding: '12px' }}>Duration</th>
                  <th style={{ padding: '12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {operatorBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No slot bookings found for your stations.
                    </td>
                  </tr>
                ) : (
                  operatorBookings.map(booking => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>#{booking.id}</td>
                      <td style={{ padding: '12px' }}>{booking.booking_date}</td>
                      <td style={{ padding: '12px' }}>{booking.booking_start_time} - {booking.booking_end_time}</td>
                      <td style={{ padding: '12px' }}>{booking.estimated_duration} mins</td>
                      <td style={{ padding: '12px' }}>
                        <span className={`status-badge status-${booking.booking_status.toLowerCase()}`}>
                          {booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Else render Normal USER Dashboard View
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* User metrics cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Trips Conducted</span>
            <Car size={18} color="var(--color-primary)" />
          </div>
          <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
            {stats?.total_trips || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Optimized routes planned</div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Reserved Slots</span>
            <Calendar size={18} color="var(--color-secondary)" />
          </div>
          <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
            {stats?.total_bookings || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total charging bookings</div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Energy Consumed</span>
            <Zap size={18} color="var(--color-warning)" />
          </div>
          <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
            {parseFloat(stats?.energy_consumed_kwh || 0).toFixed(1)} <span style={{ fontSize: '1rem', fontFamily: 'var(--font-sans)' }}>kWh</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Clean electricity drawn</div>
        </div>

        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total Spent</span>
            <CreditCard size={18} color="var(--color-danger)" />
          </div>
          <div className="digital-text" style={{ fontSize: '1.8rem', color: '#ffffff' }}>
            ₹{parseFloat(stats?.total_spent || 0).toFixed(0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Charging & booking costs</div>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
        {/* Charging Energy Trend */}
        <div className="glass-panel" style={{ padding: '24px', height: '360px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '20px', fontWeight: 600 }}>Energy Draw Analysis (kWh)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-dark-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }} />
              <Area type="monotone" dataKey="energy" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorEnergy)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Cost Analysis Bar Chart */}
        <div className="glass-panel" style={{ padding: '24px', height: '360px' }}>
          <h3 style={{ fontSize: '1.05rem', marginBottom: '20px', fontWeight: 600 }}>Spending Analytics (₹)</h3>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
              <YAxis stroke="var(--text-muted)" fontSize={11} />
              <Tooltip contentStyle={{ background: 'var(--bg-dark-secondary)', border: '1px solid var(--border-glass)', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                {mockChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 5 ? 'var(--color-secondary)' : 'var(--color-primary-glow)'} stroke={index === 5 ? 'var(--color-secondary)' : 'var(--color-primary)'} strokeWidth={1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
