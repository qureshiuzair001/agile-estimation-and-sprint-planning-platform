import { create } from "zustand";
import type { CurrentUserResponse } from "@/types/auth.types";

const ACCESS_TOKEN_STORAGE_KEY = "agile-estimation:access-token";
const REFRESH_TOKEN_STORAGE_KEY = "agile-estimation:refresh-token";

interface AuthState {
  /** Raw JWT string, or null if signed out. */
  token: string | null;
  /**
   * Raw refresh token, or null. Stored the same way the access token is
   * (localStorage) for consistency with the rest of this store — an
   * httpOnly cookie would be a stronger place to keep it (immune to XSS
   * reading it via JS), but that's a bigger change to the auth flow than
   * this pass makes; noted as a follow-up rather than silently mixing
   * storage strategies between the two tokens.
   */
  refreshToken: string | null;
  /** Claims-derived user info, populated after login or a successful /auth/me call. */
  user: CurrentUserResponse | null;
  /** True once the initial \"restore session from storage\" check has run. */
  isInitialized: boolean;

  isAuthenticated: () => boolean;
  setSession: (token: string, user: CurrentUserResponse, refreshToken?: string | null) => void;
  /** Updates just the token pair, e.g. after a silent refresh — leaves `user` untouched. */
  setTokens: (token: string, refreshToken: string | null) => void;
  setUser: (user: CurrentUserResponse) => void;
  clearSession: () => void;
  markInitialized: () => void;
}

/**
 * Zustand store for authentication state.
 *
 * Tokens are mirrored to localStorage so a page refresh doesn't log the
 * user out. The Axios interceptor reads `token` from this store to
 * attach the Authorization header (and `refreshToken` to attempt a
 * silent refresh on a 401 — see axiosClient.ts), and the SignalR service
 * reads `token` to authenticate the hub connection.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY),
  user: null,
  isInitialized: false,

  isAuthenticated: () => Boolean(get().token),

  setSession: (token, user, refreshToken = null) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    set({ token, user, refreshToken: refreshToken ?? get().refreshToken });
  },

  setTokens: (token, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);

    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    }

    set({ token, refreshToken: refreshToken ?? get().refreshToken });
  },

  setUser: (user) => set({ user }),

  clearSession: () => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    set({ token: null, refreshToken: null, user: null });
  },

  markInitialized: () => set({ isInitialized: true }),
}));
