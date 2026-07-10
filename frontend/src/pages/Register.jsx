import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { Zap, User as UserIcon, Mail, Phone, Lock, Home } from 'lucide-react';

export default function Register({ showToast }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api('/register/', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      showToast('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
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
      padding: '40px 20px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '600px',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header */}
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
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, textAlign: 'center' }}>Create Account</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
            Register to plan trips, predict battery usage and book EV slots
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Username</label>
              <div style={{ position: 'relative' }}>
                <UserIcon size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  name="username"
                  placeholder="tanay_desai"
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '44px' }}
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="tanay@example.com"
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '44px' }}
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '44px' }}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="9876543210"
                  className="form-control"
                  style={{ paddingLeft: '38px', height: '44px' }}
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Address</label>
            <div style={{ position: 'relative' }}>
              <Home size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '22px' }} />
              <textarea
                name="address"
                placeholder="Flat No, Building, Street Name..."
                className="form-control"
                style={{ paddingLeft: '38px', height: '80px', resize: 'none' }}
                value={formData.address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                placeholder="Ahmedabad"
                className="form-control"
                style={{ height: '44px' }}
                value={formData.city}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>State</label>
              <input
                type="text"
                name="state"
                placeholder="Gujarat"
                className="form-control"
                style={{ height: '44px' }}
                value={formData.state}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                name="pincode"
                placeholder="380009"
                className="form-control"
                style={{ height: '44px' }}
                value={formData.pincode}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '48px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', fontSize: '0.9rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>Already have an account?</span>
          <Link to="/login" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
