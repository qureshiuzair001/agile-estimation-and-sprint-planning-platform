/**
 * Every route path in the app lives here. Never hardcode a path string
 * in a component — import ROUTES and reference it, so renaming a route
 * is a one-line change instead of a find-and-replace across the app.
 */
export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  CREATE_SESSION: "/sessions/new",
  JOIN_SESSION: "/sessions/join",
  PLANNING_ROOM: "/sessions/:sessionId",
  SESSION_HISTORY: "/history",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  UNAUTHORIZED: "/unauthorized",
  NOT_FOUND: "*",
} as const;

/** Builds a concrete Planning Room URL from a session id. */
export function planningRoomPath(sessionId: string): string {
  return `/sessions/${sessionId}`;
}
