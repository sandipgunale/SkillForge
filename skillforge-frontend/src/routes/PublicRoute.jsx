import { Navigate, Outlet } from "react-router-dom";

import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/store/authStore";

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  // The auth pages render immediately — the silent session bootstrap (up to
  // ~5s when the backend is unreachable) runs in the background and the
  // redirect to the dashboard happens only if a session is actually restored.
  // Blocking the Outlet on `bootstrapping` left a blank page (no card) for the
  // whole window when the refresh endpoint was slow or down.
  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
}