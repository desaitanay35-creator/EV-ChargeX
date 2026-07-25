import { useCallback, useEffect, useRef, useState } from "react";
import { FaBell, FaCheckDouble, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import evService, { toList } from "../../services/evService";
import { formatDate, titleCase } from "../../utils/format";

function Navbar() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [query, setQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "EV Driver";

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await evService.notifications.list();
      setNotifications(toList(res));
    } catch (err) {
      console.error("Failed to load navbar notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationClick = async (n) => {
    setDropdownOpen(false);
    if (!n.is_read) {
      try {
        await evService.notifications.update(n.id, { is_read: true });
        setNotifications((prev) =>
          prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
        );
      } catch (err) {
        console.error("Could not mark notification read:", err);
      }
    }

    const normalizedRole = role?.toUpperCase();
    const targetType = n.notification_type?.toUpperCase();

    if (normalizedRole === "OPERATOR") {
      if (targetType === "BOOKING") navigate("/operator/bookings");
      else if (targetType === "CHARGING") navigate("/operator/charging");
      else if (targetType === "SYSTEM") navigate("/operator/chargers");
      else navigate("/operator/dashboard");
    } else {
      if (targetType === "BOOKING") navigate("/bookings");
      else if (targetType === "CHARGING") navigate("/charging");
      else if (targetType === "PAYMENT") navigate("/payments");
      else if (targetType === "TRIP") navigate("/trips");
      else navigate("/notifications");
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await evService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (err) {
      console.error("Could not mark all notifications read:", err);
    }
  };

  const search = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/stations?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="navbar">
      <form className="navbar-search" onSubmit={search}>
        <FaSearch />
        <input
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search charging stations..."
          type="search"
          value={query}
        />
      </form>

      <div className="navbar-actions">
        {/* Notification Bell with Dropdown */}
        <div className="navbar-bell-container" ref={dropdownRef}>
          <button
            className="navbar-icon-button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            type="button"
            aria-label={`Notifications (${unreadCount} unread)`}
          >
            <FaBell />
            {unreadCount > 0 && <span className="notification-dot">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          {dropdownOpen && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div>
                  <strong>Notifications</strong>
                  {unreadCount > 0 && <span className="unread-badge">{unreadCount} unread</span>}
                </div>
                {unreadCount > 0 && (
                  <button
                    className="mark-all-read-btn"
                    onClick={handleMarkAllRead}
                    type="button"
                    title="Mark all as read"
                  >
                    <FaCheckDouble /> Read all
                  </button>
                )}
              </div>

              <div className="notification-dropdown-list">
                {loading ? (
                  <div className="dropdown-empty-state">Loading notifications...</div>
                ) : notifications.length ? (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      className={`notification-dropdown-item ${!n.is_read ? "unread" : ""}`}
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                    >
                      <span className="dropdown-item-type">{titleCase(n.notification_type)}</span>
                      <strong className="dropdown-item-title">{n.title}</strong>
                      <p className="dropdown-item-msg">{n.message}</p>
                      <small className="dropdown-item-time">{formatDate(n.created_at, { hour: "numeric", minute: "2-digit" })}</small>
                    </div>
                  ))
                ) : (
                  <div className="dropdown-empty-state">You're all caught up!</div>
                )}
              </div>

              <div className="notification-dropdown-footer">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/notifications");
                  }}
                  type="button"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        <button className="navbar-user" onClick={() => navigate("/profile")} type="button">
          <FaUserCircle className="navbar-avatar" />
          <span className="navbar-user-info">
            <strong>{displayName}</strong>
            <span>{role || "USER"}</span>
          </span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
