import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Zap, Clock, Battery, AlertTriangle, ShieldCheck, CreditCard } from 'lucide-react';

export default function ChargingSessionPage({ showToast }) {
  const [activeSession, setActiveSession] = useState(null);
  const [historySessions, setHistorySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Simulation states
  const [simulatedSoC, setSimulatedSoC] = useState(0);
  const [simulatedEnergy, setSimulatedEnergy] = useState(0);
  const [simulatedCost, setSimulatedCost] = useState(0);
  const [chargerRate, setChargerRate] = useState(15.0); // Rs/kWh
  const [powerKw, setPowerKw] = useState(50.0); // Charger speed
  
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const data = await api('/charging/sessions/');
      const sessions = data || [];
      const active = sessions.find(s => s.session_status === 'ACTIVE');
      setActiveSession(active);
      setHistorySessions(sessions.filter(s => s.session_status !== 'ACTIVE'));

      if (active) {
        // Initialize simulation variables
        setSimulatedSoC(parseFloat(active.battery_before));
        setSimulatedEnergy(0);
        setSimulatedCost(0);
        
        // Fetch charger price per kwh to compute cost
        try {
          const chargerDetail = await api(`/charging/chargers/${active.charger}/`);
          setChargerRate(parseFloat(chargerDetail.price_per_kwh));
          setPowerKw(parseFloat(chargerDetail.power_output_kw));
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      showToast('Error loading charging sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Simulator interval
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      setSimulatedSoC(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Simulated SoC increase based on charger power output
        const increment = powerKw > 100 ? 0.8 : powerKw > 40 ? 0.4 : 0.15;
        const nextSoC = Math.min(100, prev + increment);
        
        // Energy Consumed: increment in SoC translated back to kWh
        // (diff SoC / 100) * 60 kWh vehicle capacity (default range capacity)
        const batteryCapacity = 60; // default
        const energyAccumulated = ((nextSoC - parseFloat(activeSession.battery_before)) / 100) * batteryCapacity;
        setSimulatedEnergy(parseFloat(energyAccumulated.toFixed(2)));
        setSimulatedCost(parseFloat((energyAccumulated * chargerRate).toFixed(2)));

        return parseFloat(nextSoC.toFixed(2));
      });
    }, 1000); // Ticks every 1 second for live demo experience

    return () => clearInterval(interval);
  }, [activeSession, powerKw, chargerRate]);

  const handleStopCharging = async () => {
    if (!activeSession) return;
    try {
      // Prompt final SoC or use current simulated value
      const finalSoC = simulatedSoC;
      
      // Update session status in DB
      await api(`/charging/sessions/${activeSession.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          battery_after: finalSoC.toFixed(2),
          session_status: 'COMPLETED',
          end_time: new Date().toISOString()
        })
      });

      // Update vehicle current battery percentage
      await api(`/vehicles/${activeSession.vehicle}/`, {
        method: 'PATCH',
        body: JSON.stringify({
          current_battery_percentage: finalSoC.toFixed(2)
        })
      });

      showToast('Charging session completed!');
      navigate('/payments');
    } catch (err) {
      showToast(err.message || 'Failed to terminate session', 'error');
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-muted)' }}>Retrieving charging telemetry...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.25rem' }}>Charging Sessions</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monitor active charging telemetry and history log</p>
      </div>

      {activeSession ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px' }}>
          {/* Active Sim UI */}
          <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing active bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '4px',
              background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))',
              boxShadow: '0 0 10px var(--color-primary)'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="status-badge status-occupied">Active Session #{activeSession.id}</span>
                <h3 style={{ fontSize: '1.4rem', marginTop: '6px' }}>Drawing Electric Power</h3>
              </div>
              <Zap size={24} className="glow-active" color="var(--color-primary)" />
            </div>

            {/* Battery charging graphic */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '20px 0' }}>
              <div style={{
                width: '100%',
                maxWidth: '280px',
                height: '100px',
                border: '3px solid var(--border-glass-hover)',
                borderRadius: '16px',
                padding: '6px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <div style={{
                  background: 'linear-gradient(90deg, var(--color-primary), #059669)',
                  height: '100%',
                  width: `${simulatedSoC}%`,
                  borderRadius: '10px',
                  boxShadow: 'var(--shadow-neon)',
                  transition: 'width 0.5s ease-out'
                }}></div>
                {/* Battery tip */}
                <div style={{
                  position: 'absolute',
                  right: '-12px',
                  width: '10px',
                  height: '36px',
                  background: 'var(--border-glass-hover)',
                  borderTopRightRadius: '6px',
                  borderBottomRightRadius: '6px'
                }}></div>
              </div>
              <div className="digital-text" style={{ fontSize: '2rem', color: '#ffffff' }}>{simulatedSoC}%</div>
            </div>

            {/* Telemetry metrics row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Energy Consumed</span>
                <strong className="digital-text" style={{ fontSize: '1.4rem', color: '#ffffff' }}>
                  {simulatedEnergy} <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>kWh</span>
                </strong>
              </div>

              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Accrued Cost</span>
                <strong className="digital-text" style={{ fontSize: '1.4rem', color: 'var(--color-primary)' }}>
                  ₹{simulatedCost.toFixed(2)}
                </strong>
              </div>
            </div>

            <button className="btn btn-danger" style={{ width: '100%', height: '48px' }} onClick={handleStopCharging}>
              Stop Charging & Generate Invoice
            </button>
          </div>

          {/* Technical Specs Sidebar */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Station Charger Telemetry</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Charger Point ID</span>
                <strong>#{activeSession.charger}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Charger Rate</span>
                <strong>₹{chargerRate}/kWh</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Charging Speed</span>
                <strong style={{ color: 'var(--color-secondary)' }}>{powerKw} kW DC</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Battery at Start</span>
                <strong>{activeSession.battery_before}%</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Start Timestamp</span>
                <span>{new Date(activeSession.start_time).toLocaleTimeString()}</span>
              </div>
            </div>
            
            <div style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.75rem',
              color: '#34d399',
              lineHeight: 1.4
            }}>
              <ShieldCheck size={16} />
              <span>Charger cooling active. Ground loop resistance normal. Secure link verified.</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* No Active session prompt */}
          <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}>
            <Zap size={40} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.1rem' }}>No Active Charging Sessions</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '340px' }}>
              Check-in to a reserved slot in your <strong>Reservations</strong> to initialize physical charger drawing.
            </p>
          </div>

          {/* Charging history log */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>Charging Session History</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Session</th>
                    <th style={{ padding: '12px' }}>EV Vehicle</th>
                    <th style={{ padding: '12px' }}>Battery SoC Delta</th>
                    <th style={{ padding: '12px' }}>Energy Drawn</th>
                    <th style={{ padding: '12px' }}>Total Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {historySessions.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No completed charging sessions recorded.
                      </td>
                    </tr>
                  ) : (
                    historySessions.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>#{s.id}</td>
                        <td style={{ padding: '12px' }}>EV ID: {s.vehicle}</td>
                        <td style={{ padding: '12px' }}>{s.battery_before}% ➜ {s.battery_after}%</td>
                        <td style={{ padding: '12px' }}>{s.energy_consumed_kwh} kWh</td>
                        <td style={{ padding: '12px', color: 'var(--color-primary)', fontWeight: 600 }}>₹{s.charging_cost}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
