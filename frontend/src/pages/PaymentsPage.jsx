import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import './PaymentsPage.css';

export default function PaymentsPage() {
  const { onMenuClick } = useOutletContext();
  const { dashboard } = useUserData();
  const bookings = dashboard?.bookings || [];

  return (
    <>
      <Header title="Payments & Invoices" subtitle="Review charges and download receipts" onMenuClick={onMenuClick} />

      {bookings.length === 0 ? (
        <p className="dashboard-empty">No invoices yet.</p>
      ) : (
        <div className="card payments-table">
          <div className="payments-row payments-row-head">
            <span>Station</span>
            <span>Date</span>
            <span>Status</span>
            <span>Action</span>
          </div>
          {bookings.map((b) => (
            <div className="payments-row" key={b.id}>
              <span>{b.stationName}</span>
              <span>{b.date}</span>
              <span className="badge badge-info">{b.status}</span>
              <button className="btn btn-secondary">Download</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
