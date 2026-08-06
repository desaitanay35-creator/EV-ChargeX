import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import "./layout.css";

function MainLayout() {
  return (
    <div className="app-layout">
      <Sidebar />

      <div className="main-section">
        <Navbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;