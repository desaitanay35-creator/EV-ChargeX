import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import StatCard from '../components/common/StatCard.jsx';
import { getReports } from '../services/userService.js';
import './ReportsPage.css';

export default function ReportsPage() {
  const { onMenuClick } = useOutletContext();
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => setReport(await getReports()))();
  }, []);

  if (!report) {
    return (
      <>
        <Header title="Reports" onMenuClick={onMenuClick} />
        <p className="dashboard-empty">Loading reports…</p>
      </>
    );
  }

  const maxAmount = Math.max(...report.monthlySpend.map((m) => m.amount));

  return (
    <>
      <Header title="Reports" subtitle="Spending, energy usage, and CO2 savings over time" onMenuClick={onMenuClick} />

      <section className="dashboard-stats">
        <StatCard icon="⚡" iconBg="#eaf1fe" label="Total Energy" value={`${report.totalEnergyKwh} kWh`} />
        <StatCard icon="💳" iconBg="#fdf1d8" label="Total Spend" value={`₹${report.totalSpend}`} />
        <StatCard icon="🌳" iconBg="#f2e9fb" label="CO2 Saved" value={`${report.totalCo2SavedKg} kg`} />
      </section>

      <div className="card reports-chart-card">
        <h2>Monthly Spend</h2>
        <div className="reports-chart">
          {report.monthlySpend.map((m) => (
            <div className="reports-bar-wrapper" key={m.month}>
              <div
                className="reports-bar"
                style={{ height: `${(m.amount / maxAmount) * 100}%` }}
                title={`₹${m.amount}`}
              />
              <span className="reports-bar-label">{m.month}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
