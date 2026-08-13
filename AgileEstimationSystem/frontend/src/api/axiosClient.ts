import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import type { ApiErrorResponse } from "@/types/common.types";
import type { AuthResponse } from "@/types/auth.types";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// A separate, un-intercepted instance for the refresh call itself — using
// apiClient here would recurse into this same response interceptor on
// its own 401, and would also (harmlessly, but pointlessly) attach the
// now-expired access token via the request interceptor below.
const refreshClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every outgoing request, if we have one.
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * Multiple requests can hit a 401 at roughly the same moment (e.g. three
 * queries firing on page load right as the access token expires). Without
 * this, each would independently call /auth/refresh, and since refresh
 * tokens rotate on use (see the backend's AuthService.RefreshTokenAsync),
 * only the first would succeed — the rest would revoke each other's
 * brand-new tokens. Sharing one in-flight promise means every 401 that
 * arrives while a refresh is already running waits for that same result
 * instead of starting its own.
 */
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const currentRefreshToken = useAuthStore.getState().refreshToken;

  if (!currentRefreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post<AuthResponse>("/api/auth/refresh", { refreshToken: currentRefreshToken })
      .then(({ data }) => {
        if (!data.success || !data.jwtToken) return null;

        useAuthStore.getState().setTokens(data.jwtToken.token, data.refreshToken);
        return data.jwtToken.token;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

/**
 * Centralized error handling so every page doesn't need its own
 * try/catch for the same cases: an expired access token (silently
 * refreshed once before giving up), no network, and generic server
 * errors.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      toast.error("Network error. Check your connection and try again.");
      return Promise.reject(error);
    }

    const { status, data } = error.response;
    const originalRequest = error.config as (typeof error.config & { _retried?: boolean }) | undefined;

    if (status === 401 && originalRequest && !originalRequest._retried) {
      originalRequest._retried = true;

      const newToken = await refreshAccessToken();

      if (newToken) {
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient.request(originalRequest);
      }

      const wasAuthenticated = useAuthStore.getState().isAuthenticated();
      useAuthStore.getState().clearSession();

      if (wasAuthenticated) {
        toast.error("Your session expired. Please sign in again.");
        window.location.href = ROUTES.LOGIN;
      }
    } else if (status === 403) {
      toast.error("You don't have permission to do that.");
    } else if (status >= 500) {
      toast.error("Something went wrong on our end. Please try again.");
    } else if (data?.message) {
      // Leave 400/404 toasts to the calling code where possible, since
      // those usually need field-level handling — but still surface a
      // message if the caller doesn't show one itself.
    }

    return Promise.reject(error);
  }
);

/** Pulls a human-readable message out of any Axios error shape the API returns. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return error.response?.data?.message ?? error.response?.data?.title ?? fallback;
  }

  return fallback;
}
