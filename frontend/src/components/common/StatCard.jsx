import React from 'react';
import './StatCard.css';

export default function StatCard({ icon, label, value, iconBg }) {
  return (
    <div className="stat-card card">
      <div className="stat-card-icon" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
      </div>
    </div>
  );
}
