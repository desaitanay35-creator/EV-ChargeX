import {
  FaBolt,
  FaCalendarAlt,
  FaCar,
  FaChartBar,
  FaChargingStation,
  FaCreditCard,
  FaMapMarkedAlt,
  FaPlug,
  FaQrcode,
  FaRoad,
  FaSignOutAlt,
  FaUser,
} from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

const userItems = [
  ["Dashboard", "/dashboard", <FaChartBar />],
  ["Vehicles", "/vehicles", <FaCar />],
  ["Stations", "/stations", <FaMapMarkedAlt />],
  ["Trips", "/trips", <FaRoad />],
  ["Bookings", "/bookings", <FaCalendarAlt />],
  ["Charging", "/charging", <FaChargingStation />],
  ["Payments", "/payments", <FaCreditCard />],
  ["Reports", "/reports", <FaBolt />],
  ["Profile", "/profile", <FaUser />],
];

const operatorItems = [
  ["Dashboard", "/operator/dashboard", <FaChartBar />],
  ["Stations", "/stations", <FaMapMarkedAlt />],
  ["Chargers", "/chargers", <FaPlug />],
  ["Bookings", "/bookings", <FaCalendarAlt />],
  ["Validate QR", "/operator/validate-qr", <FaQrcode />],
  ["Charging", "/charging", <FaChargingStation />],
  ["Reports", "/reports", <FaBolt />],
  ["Profile", "/profile", <FaUser />],
];

const adminItems = [
  ["Dashboard", "/admin/dashboard", <FaChartBar />],
  ["Stations", "/stations", <FaMapMarkedAlt />],
  ["Chargers", "/chargers", <FaPlug />],
  ["Bookings", "/bookings", <FaCalendarAlt />],
  ["Charging", "/charging", <FaChargingStation />],
  ["Reports", "/reports", <FaBolt />],
  ["Profile", "/profile", <FaUser />],
];

function Sidebar() {
  const navigate = useNavigate();
  const { logout, role } = useAuth();
  const normalizedRole = role?.toUpperCase();
  const menuItems = normalizedRole === "ADMIN" ? adminItems : normalizedRole === "OPERATOR" ? operatorItems : userItems;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><FaBolt /></div>
        <div><h2>EV-ChargeX</h2><span>Smart Charging</span></div>
      </div>

      <nav className="sidebar-menu">
        <p className="sidebar-section-label">Workspace</p>
        {menuItems.map(([name, path, icon]) => (
          <NavLink key={path} to={path} className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <span className="sidebar-link-icon">{icon}</span><span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-role"><span>{normalizedRole || "USER"}</span><small>Signed in</small></div>
      <button className="logout-button" onClick={handleLogout} type="button"><FaSignOutAlt /><span>Logout</span></button>
    </aside>
  );
}

export default Sidebar;
