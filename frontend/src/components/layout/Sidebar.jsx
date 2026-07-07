import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/stations', label: 'Station Finder', icon: '🗺️' },
  { to: '/vehicles', label: 'My Vehicles', icon: '🚗' },
  { to: '/route-planner', label: 'Route Planner', icon: '🧭' },
  { to: '/payments', label: 'Payments & Invoices', icon: '💳' },
  { to: '/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/reports', label: 'Reports', icon: '📈' },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  return (
    <>
      {isOpen && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-brand-icon">⚡</span>
          <span className="sidebar-brand-name">EV-ChargeX</span>
        </div>

        <div className="sidebar-perspective">
          <label htmlFor="perspective">PORTAL PERSPECTIVE</label>
          <select id="perspective" defaultValue="EV Driver">
            <option>EV Driver</option>
            <option>Station Operator</option>
            <option>Fleet Manager</option>
          </select>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{user?.initials || 'RO'}</div>
          <div>
            <div className="sidebar-user-name">{user?.name || 'Rohan Mehta'}</div>
            <span className="badge badge-success">{user?.role || 'EV Driver'}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
