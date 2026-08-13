import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import type { UserRoleValue } from "@/constants/roles";

export interface RoleRouteProps {
  allowedRoles: UserRoleValue[];
}

/**
 * Nested inside <ProtectedRoute/>, so isAuthenticated is already
 * guaranteed by the time this renders — this only adds the extra "and
 * are they the right role" check. Used for the Moderator-only pages
 * (Create Session) — see requirement: only Moderator accounts can
 * create a session, matching the backend's [Authorize(Roles = "Moderator")]
 * on POST /api/sessions.
 *
 * This is a UX nicety, not the real security boundary — the backend
 * enforces the actual rule and returns 403 regardless of what the
 * frontend does. Redirecting here just avoids showing someone a form
 * they'd only get rejected from after filling it out.
 */
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const role = useAuthStore((state) => state.user?.role);

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
