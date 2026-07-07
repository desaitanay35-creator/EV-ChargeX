import React from 'react';
import { useOutletContext } from 'react-router-dom';
import Header from '../components/layout/Header.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import './NotificationsPage.css';

const TYPE_BADGE = {
  success: 'badge-success',
  info: 'badge-info',
  warning: 'badge-warning',
  danger: 'badge-danger',
};

export default function NotificationsPage() {
  const { onMenuClick } = useOutletContext();
  const { notifications, isLoading } = useUserData();

  return (
    <>
      <Header title="Notifications" subtitle="Stay updated on bookings and station activity" onMenuClick={onMenuClick} />

      {isLoading ? (
        <p className="dashboard-empty">Loading notifications…</p>
      ) : notifications.length === 0 ? (
        <p className="dashboard-empty">You're all caught up.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div className={`card notification-item ${n.read ? '' : 'notification-unread'}`} key={n.id}>
              <span className={`badge ${TYPE_BADGE[n.type] || 'badge-info'}`}>{n.type}</span>
              <div className="notification-body">
                <h3>{n.title}</h3>
                <p>{n.message}</p>
                <span className="notification-time">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
