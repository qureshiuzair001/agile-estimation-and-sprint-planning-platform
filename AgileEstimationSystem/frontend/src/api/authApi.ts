import { apiClient } from "@/api/axiosClient";
import type {
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth.types";

/** POST /api/auth/register */
export async function registerUser(payload: RegisterRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/register", payload);
  return data;
}

/** POST /api/auth/login */
export async function loginUser(payload: LoginRequest): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
  return data;
}

/** GET /api/auth/me — used on app load to validate the stored token is still accepted. */
export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const { data } = await apiClient.get<CurrentUserResponse>("/api/auth/me");
  return data;
}

/**
 * POST /api/auth/logout — revokes the refresh token server-side so it
 * can't be exchanged again, even before it naturally expires. Best-effort:
 * the caller clears local session state regardless of whether this
 * succeeds (see useAuth.ts's useLogout), since staying "logged in"
 * locally after a failed revoke call would be worse than a token that
 * outlives the local session by a few days.
 */
export async function logoutUser(refreshToken: string): Promise<void> {
  await apiClient.post("/api/auth/logout", { refreshToken });
}
