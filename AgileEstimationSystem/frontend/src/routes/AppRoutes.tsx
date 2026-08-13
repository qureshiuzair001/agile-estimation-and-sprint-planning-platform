import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/constants/routes";

import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleRoute } from "@/routes/RoleRoute";
import { PublicRoute } from "@/routes/PublicRoute";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { USER_ROLES } from "@/constants/roles";

import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import CreateSessionPage from "@/pages/CreateSessionPage";
import JoinSessionPage from "@/pages/JoinSessionPage";
import PlanningRoomPage from "@/pages/PlanningRoomPage";
import SessionHistoryPage from "@/pages/SessionHistoryPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFoundPage from "@/pages/NotFoundPage";

/**
 * Single source of truth for the app's route tree.
 *
 * - Routes under <PublicRoute/> are only reachable when signed OUT.
 * - Routes under <ProtectedRoute/> require a valid session and are
 *   nested inside <DashboardLayout/> so they all share the navbar/sidebar.
 *
 * To add a new authenticated page: create the page component under
 * src/pages, add its path to src/constants/routes.ts, then add one
 * <Route> line below inside the ProtectedRoute block.
 */
export function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      <Route element={<PublicRoute />}>
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route element={<RoleRoute allowedRoles={[USER_ROLES.MODERATOR]} />}>
            <Route path={ROUTES.CREATE_SESSION} element={<CreateSessionPage />} />
          </Route>
          <Route path={ROUTES.JOIN_SESSION} element={<JoinSessionPage />} />
          <Route path={ROUTES.PLANNING_ROOM} element={<PlanningRoomPage />} />
          <Route path={ROUTES.SESSION_HISTORY} element={<SessionHistoryPage />} />
          <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
    </Routes>
  );
}
