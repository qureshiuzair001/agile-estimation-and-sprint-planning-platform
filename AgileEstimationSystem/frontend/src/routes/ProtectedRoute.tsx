import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Loader } from "@/components/ui/Loader";
import { ROUTES } from "@/constants/routes";

/**
 * Wraps routes that require a signed-in user. Renders <Outlet/> when
 * authenticated, otherwise redirects to /login and remembers where the
 * user was trying to go so they can be sent back after signing in.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());
  const isInitialized = useAuthStore((state) => state.isInitialized);

  if (!isInitialized) {
    return <Loader fullScreen label="Restoring your session…" />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
