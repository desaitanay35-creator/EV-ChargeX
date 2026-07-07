import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <header className="home-nav">
        <div className="home-nav-brand">
          <span className="sidebar-brand-icon">⚡</span>
          <span className="sidebar-brand-name">EV-ChargeX</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login')}
        >
          {isAuthenticated ? 'Go to Dashboard' : 'Log In'}
        </button>
      </header>

      <section className="home-hero">
        <h1>Find. Book. Charge.</h1>
        <p>
          EV-ChargeX connects you to nearby charging stations, lets you reserve a slot in advance, and
          plans multi-stop routes so range anxiety stays out of the picture.
        </p>
        <div className="home-hero-actions">
          <button className="btn btn-primary" onClick={() => navigate('/stations')}>
            Find a Charging Station
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            Create Account
          </button>
        </div>
      </section>

      <section className="home-features">
        <div className="card home-feature">
          <span className="home-feature-icon">🗺️</span>
          <h3>Live Station Map</h3>
          <p>See real-time slot availability, charger speed, and pricing on an interactive map.</p>
        </div>
        <div className="card home-feature">
          <span className="home-feature-icon">🗓️</span>
          <h3>Instant Booking</h3>
          <p>Reserve a charging slot in seconds and get a QR ticket for contactless check-in.</p>
        </div>
        <div className="card home-feature">
          <span className="home-feature-icon">🧭</span>
          <h3>Route Planning</h3>
          <p>Plan long trips with optimal charging stops based on your vehicle's battery range.</p>
        </div>
      </section>
    </div>
  );
}
