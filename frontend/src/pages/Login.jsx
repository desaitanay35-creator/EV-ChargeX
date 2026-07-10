import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Zap, Lock, User as UserIcon } from 'lucide-react';

export default function Login({ onLogin, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setLoading(true);
    try {
      const data = await api('/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      onLogin(data.access, data.refresh);
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--color-primary), #059669)',
            padding: '12px',
            borderRadius: '14px',
            boxShadow: 'var(--shadow-neon)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={32} color="#042f1a" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center' }}>EV-ChargeX</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            AI-Powered EV Charging Network Optimizer
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="form-group">
            <label>Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="text"
                placeholder="Enter your username"
                className="form-control"
                style={{ paddingLeft: '44px' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-muted)" style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)'
              }} />
              <input
                type="password"
                placeholder="••••••••"
                className="form-control"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Don't have an account?</span>
          <Link to="/register" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign Up
          </Link>
        </div>

        {/* Demo credentials info card */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid var(--border-glass)',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <div style={{ fontWeight: 600, color: '#ffffff' }}>Demo Credentials:</div>
          <div>User: <code>Tanay</code> / Pass: <code>Tanay@123</code></div>
          <div>Operator: <code>TATA</code> / Pass: <code>Tanay@123</code></div>
        </div>
      </div>
    </div>
  );
}
