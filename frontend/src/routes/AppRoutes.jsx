import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import BookingsPage from "../pages/bookings/BookingsPage";
import ChargersPage from "../pages/chargers/ChargersPage";
import ChargingPage from "../pages/charging/ChargingPage";
import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import OperatorDashboardPage from "../pages/dashboard/OperatorDashboardPage";
import NotificationsPage from "../pages/notifications/NotificationsPage";
import QRValidationPage from "../pages/operator/QRValidationPage";
import PaymentsPage from "../pages/payments/PaymentsPage";
import ProfilePage from "../pages/profile/ProfilePage";
import ReportsPage from "../pages/reports/ReportsPage";
import StationsPage from "../pages/stations/StationsPage";
import TripsPage from "../pages/trips/TripsPage";
import VehiclesPage from "../pages/vehicles/VehiclesPage";
import ProtectedRoute from "./ProtectedRoute";

function UnauthorizedPage() {
  const navigate = useNavigate();
  return (
    <div className="route-loader unauthorized-page">
      <strong>403</strong>
      <h1>Access restricted</h1>
      <p>Your account role does not have permission to open this page.</p>
      <button className="primary-button" onClick={() => navigate(-1)} type="button">Go back</button>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute allowedRoles={["USER"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/payments" element={<PaymentsPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["OPERATOR"]} />}>
            <Route path="/operator/dashboard" element={<OperatorDashboardPage />} />
            <Route path="/operator/validate-qr" element={<QRValidationPage />} />
          </Route>

          <Route path="/stations" element={<StationsPage />} />
          <Route path="/chargers" element={<ChargersPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/charging" element={<ChargingPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;
