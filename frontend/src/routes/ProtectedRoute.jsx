import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import useAuth from "../hooks/useAuth";

function ProtectedRoute({
  allowedRoles,
}) {
  const {
    isAuthenticated,
    role,
    loading,
  } = useAuth();

  const location = useLocation();

  if (loading) {
    return (
      <div className="route-loader">
        <div className="loader-spinner"></div>
        <p>Loading EV-ChargeX...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{
          from: location,
        }}
        replace
      />
    );
  }

  if (
    allowedRoles?.length &&
    !allowedRoles.includes(
      role?.toUpperCase()
    )
  ) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;