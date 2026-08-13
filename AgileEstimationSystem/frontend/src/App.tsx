import { useEffect } from "react";
import { AppRoutes } from "@/routes/AppRoutes";
import { useAuthStore } from "@/store/authStore";
import { useCurrentUser } from "@/hooks/useAuth";

/**
 * On first mount, the auth store has already synchronously read any
 * existing token from localStorage (see store/authStore.ts). We only
 * *know* that token is well-formed and present — not that the server
 * still accepts it — so we validate it with GET /api/auth/me here.
 *
 * `markInitialized` fires once that check settles (success or failure)
 * so ProtectedRoute never flashes a redirect to /login before we've had
 * a chance to confirm one way or the other.
 */
export default function App() {
  const hasStoredToken = useAuthStore((state) => Boolean(state.token));
  const markInitialized = useAuthStore((state) => state.markInitialized);
  const clearSession = useAuthStore((state) => state.clearSession);

  const { isSuccess, isError, isFetched } = useCurrentUser(hasStoredToken);

  useEffect(() => {
    if (!hasStoredToken) {
      markInitialized();
      return;
    }

    if (isFetched) {
      if (isError) clearSession();
      markInitialized();
    }
  }, [hasStoredToken, isFetched, isError, isSuccess, markInitialized, clearSession]);

  return <AppRoutes />;
}
