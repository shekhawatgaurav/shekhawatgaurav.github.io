import { Navigate, Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import Loader from "../common/Loader";

function ProtectedRoute() {
  const { loading, isAuthenticated, authError } = useAuth();

  if (loading) {
    return <Loader text="Checking admin access..." />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          authError: authError || "Please login to continue.",
        }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;