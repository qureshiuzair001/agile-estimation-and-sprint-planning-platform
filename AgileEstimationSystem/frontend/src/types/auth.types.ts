import type { UserRoleValue } from "@/constants/roles";

/** Mirrors RegisterRequest */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRoleValue;
}

/** Mirrors LoginRequest */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Mirrors JwtTokenResult */
export interface JwtTokenResult {
  token: string;
  expiresAt: string; // ISO date string
}

/** Mirrors AuthResponse */
export interface AuthResponse {
  success: boolean;
  message: string;
  jwtToken: JwtTokenResult | null;
  /** Only populated on Login/Refresh — the raw refresh token, returned exactly once. */
  refreshToken: string | null;
}

/** Mirrors RefreshTokenRequest — sent to both /auth/refresh and /auth/logout. */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Shape returned by GET /api/auth/me.
 * Note: the backend returns this as an anonymous object, not a named DTO —
 * these fields are read directly from JWT claims on the server.
 */
export interface CurrentUserResponse {
  id: string;
  username: string;
  email: string;
  role: UserRoleValue;
}

/** Decoded JWT payload shape, used by the auth store to read claims client-side. */
export interface DecodedAccessToken {
  sub: string;
  email: string;
  unique_name: string;
  role: UserRoleValue;
  jti: string;
  exp: number;
  iss: string;
  aud: string;
}
