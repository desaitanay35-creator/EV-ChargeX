import { useCallback } from "react";
import { FaBell, FaCheck, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";

import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../components/ui/UI";
import useResource from "../../hooks/useResource";
import { getApiError } from "../../services/api";
import evService, { toList } from "../../services/evService";
import { formatDate, titleCase } from "../../utils/format";

function NotificationsPage() {
  const loader = useCallback(() => evService.notifications.list(), []);
  const { data, loading, error, refresh } = useResource(loader);
  const notifications = toList(data);

  const markRead = async (notification) => {
    try {
      await evService.notifications.update(notification.id, { is_read: true });
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not update the notification."));
    }
  };

  const remove = async (notification) => {
    try {
      await evService.notifications.remove(notification.id);
      toast.success("Notification deleted.");
      refresh();
    } catch (requestError) {
      toast.error(getApiError(requestError, "Could not delete the notification."));
    }
  };

  if (loading) return <LoadingState label="Loading notifications..." />;
  if (error) return <ErrorState message={getApiError(error)} onRetry={refresh} />;

  return (
    <section>
      <PageHeader eyebrow="Activity center" title="Notifications" description="Booking, charging, payment and system updates from your account." />
      {notifications.length ? (
        <div className="notification-page-list">
          {notifications.map((notification) => (
            <article className={`notification-page-item ${notification.is_read ? "read" : ""}`} key={notification.id}>
              <span className="notification-page-icon"><FaBell /></span>
              <div><div className="notification-page-heading"><span>{titleCase(notification.notification_type)}</span><small>{formatDate(notification.created_at, { hour: "numeric", minute: "2-digit" })}</small></div><h2>{notification.title}</h2><p>{notification.message}</p></div>
              <div className="notification-page-actions">{!notification.is_read && <button className="icon-button" onClick={() => markRead(notification)} title="Mark as read" type="button"><FaCheck /></button>}<button className="icon-button" onClick={() => remove(notification)} title="Delete" type="button"><FaTrash /></button></div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="You're all caught up" message="New events from bookings and charging sessions will appear here." />}
    </section>
  );
}

export default NotificationsPage;
