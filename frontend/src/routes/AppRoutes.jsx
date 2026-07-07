import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';

import HomePage from '../pages/HomePage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import StationsPage from '../pages/StationsPage.jsx';
import StationDetailsPage from '../pages/StationDetailsPage.jsx';
import BookingPage from '../pages/BookingPage.jsx';
import VehiclesPage from '../pages/VehiclesPage.jsx';
import RoutePlannerPage from '../pages/RoutePlannerPage.jsx';
import PaymentsPage from '../pages/PaymentsPage.jsx';
import NotificationsPage from '../pages/NotificationsPage.jsx';
import ReportsPage from '../pages/ReportsPage.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Authenticated app shell (Sidebar + Header + page content) */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stations" element={<StationsPage />} />
        <Route path="/stations/:id" element={<StationDetailsPage />} />
        <Route path="/stations/:id/book" element={<BookingPage />} />
        <Route path="/vehicles" element={<VehiclesPage />} />
        <Route path="/route-planner" element={<RoutePlannerPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
