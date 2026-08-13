import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { getCurrentUser, loginUser, logoutUser, registerUser } from "@/api/authApi";
import { getApiErrorMessage } from "@/api/axiosClient";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import type { LoginRequest, RegisterRequest } from "@/types/auth.types";

export function useLogin() {
  const setSession = useAuthStore((state) => state.setSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginUser(payload),
    onSuccess: async (data) => {
      if (!data.success || !data.jwtToken) {
        toast.error(data.message || "Invalid email or password.");
        return;
      }

      // The login response doesn't include user details (see AuthResponse),
      // so we fetch /auth/me right after to populate the auth store —
      // we need the token in the store first for the request to authenticate.
      useAuthStore.getState().setSession(
        data.jwtToken.token,
        { id: "", username: "", email: "", role: "Developer" },
        data.refreshToken
      );

      const user = await getCurrentUser();
      setSession(data.jwtToken.token, user, data.refreshToken);

      await queryClient.invalidateQueries();
      toast.success("Signed in successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Invalid email or password."));
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerUser(payload),
    onSuccess: (data) => {
      if (!data.success) {
        toast.error(data.message);
        return;
      }
      toast.success("Account created. You can now sign in.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create your account."));
    },
  });
}

/**
 * Revokes the refresh token server-side (see backend's /auth/logout —
 * previously this endpoint didn't exist at all, so "sign out" only ever
 * cleared local state and left the refresh token valid for its full
 * lifetime). Clears local session either way: staying "logged in"
 * locally after a failed revoke call would be worse than a token that
 * outlives the local session by a few days.
 */
export function useLogout() {
  const navigate = useNavigate();
  const clearSession = useAuthStore((state) => state.clearSession);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        await logoutUser(refreshToken).catch(() => undefined);
      }
    },
    onSettled: () => {
      clearSession();
      queryClient.clear();
      navigate(ROUTES.LOGIN, { replace: true });
    },
  });
}

/** Validates the token stored in localStorage is still accepted by the server, on app load. */
export function useCurrentUser(enabled: boolean) {
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const user = await getCurrentUser();
      setUser(user);
      return user;
    },
    enabled,
    retry: false,
    staleTime: Infinity,
    meta: { onError: () => clearSession() },
  });
}
