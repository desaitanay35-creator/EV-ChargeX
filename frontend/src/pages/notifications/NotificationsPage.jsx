import { useCallback, useState } from "react";
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/ui/UI";
import useAuth from "../../hooks/useAuth";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, titleCase } from "../../utils/format";

function NotificationsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL"); // ALL | UNREAD

  const loader = useCallback(() => evService.notifications.list(), []);
  const { data, loading, error, refresh } = useResource(loader);
  const notifications = toList(data);

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    return true;
  });

  const markRead = async (notification) => {
    try {
      await evService.notifications.update(notification.id, { is_read: true });
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update the notification."));
    }
  };

  const markAllRead = async () => {
    try {
      await evService.markAllNotificationsRead();
      toast.success("All notifications marked as read.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not mark notifications read."));
    }
  };

  const remove = async (notification) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await evService.notifications.remove(notification.id);
      toast.success("Notification deleted.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete the notification."));
    }
  };

  const { role } = useAuth();
  const normalizedRole = role?.toUpperCase();

  const handleItemClick = (n) => {
    if (!n.is_read) {
      markRead(n);
    }
    const type = n.notification_type?.toUpperCase();
    if (normalizedRole === "OPERATOR") {
      if (type === "BOOKING") navigate("/operator/bookings");
      else if (type === "CHARGING") navigate("/operator/charging");
      else if (type === "SYSTEM") navigate("/operator/chargers");
      else navigate("/operator/dashboard");
    } else {
      if (type === "BOOKING") navigate("/bookings");
      else if (type === "CHARGING") navigate("/charging");
      else if (type === "PAYMENT") navigate("/payments");
      else if (type === "TRIP") navigate("/trips");
    }
  };

  if (loading) return <LoadingState label="Loading notifications..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <section>
      <PageHeader
        eyebrow="Activity center"
        title="Notifications"
        description="Stay updated with instant alerts for bookings, charging sessions, and payments."
        action={
          unreadCount > 0 ? (
            <button className="secondary-button" onClick={markAllRead} type="button">
              <FaCheckDouble /> Mark all as read
            </button>
          ) : null
        }
      />

      {/* Filter Tabs */}
      <div className="notifications-filter-bar">
        <button
          className={`filter-tab ${filter === "ALL" ? "active" : ""}`}
          onClick={() => setFilter("ALL")}
          type="button"
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-tab ${filter === "UNREAD" ? "active" : ""}`}
          onClick={() => setFilter("UNREAD")}
          type="button"
        >
          Unread ({unreadCount})
        </button>
      </div>

      {filteredNotifications.length ? (
        <div className="notification-page-list">
          {filteredNotifications.map((notification) => (
            <article
              className={`notification-page-item ${notification.is_read ? "read" : "unread-item"}`}
              key={notification.id}
              onClick={() => handleItemClick(notification)}
            >
              <span className="notification-page-icon"><FaBell /></span>
              <div>
                <div className="notification-page-heading">
                  <span className="notification-type-tag">{titleCase(notification.notification_type)}</span>
                  <small>{formatDate(notification.created_at, { hour: "numeric", minute: "2-digit" })}</small>
                </div>
                <h2>{notification.title}</h2>
                <p>{notification.message}</p>
              </div>
              <div className="notification-page-actions" onClick={(e) => e.stopPropagation()}>
                {!notification.is_read && (
                  <button className="icon-button" onClick={() => markRead(notification)} title="Mark as read" type="button">
                    <FaCheck />
                  </button>
                )}
                <button className="icon-button" onClick={() => remove(notification)} title="Delete" type="button">
                  <FaTrash />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="You're all caught up"
          message={filter === "UNREAD" ? "No unread notifications." : "New events from bookings and charging sessions will appear here."}
        />
      )}
    </section>
  );
}

export default NotificationsPage;
