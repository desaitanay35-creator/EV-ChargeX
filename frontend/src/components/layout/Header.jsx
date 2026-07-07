import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserData } from '../../context/UserDataContext.jsx';
import './Header.css';

export default function Header({ title, subtitle, onMenuClick }) {
  const navigate = useNavigate();
  const { unreadCount } = useUserData();

  return (
    <header className="page-header">
      <button className="menu-toggle" onClick={onMenuClick} aria-label="Open navigation menu">
        ☰
      </button>
      <div className="page-header-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <button
        className="notification-bell"
        onClick={() => navigate('/notifications')}
        aria-label="View notifications"
      >
        🔔
        {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
      </button>
    </header>
  );
}
