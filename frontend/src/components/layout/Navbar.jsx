import { useState } from "react";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [query, setQuery] = useState("");
  const displayName = user?.username || user?.email?.split("@")[0] || "EV-ChargeX User";

  const search = (event) => {
    event.preventDefault();
    if (query.trim()) navigate(`/stations?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="navbar">
      <form className="navbar-search" onSubmit={search}>
        <FaSearch />
        <input onChange={(event) => setQuery(event.target.value)} placeholder="Search charging stations..." type="search" value={query} />
      </form>

      <div className="navbar-actions">
        <button className="navbar-icon-button" onClick={() => navigate("/notifications")} type="button" aria-label="Notifications"><FaBell /><span className="notification-dot" /></button>
        <button className="navbar-user" onClick={() => navigate("/profile")} type="button">
          <FaUserCircle className="navbar-avatar" />
          <span className="navbar-user-info"><strong>{displayName}</strong><span>{role || "USER"}</span></span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
