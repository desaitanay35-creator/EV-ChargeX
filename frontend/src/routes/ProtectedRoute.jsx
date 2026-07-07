import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Guards authenticated routes. Redirects to /login when there is no
 * logged-in user, preserving the attempted destination is left as a
 * straightforward extension point (not required for this demo flow).
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // avoid a login flash while checking localStorage
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}
