using AgileEstimation.Application.DTOs.Auth;

namespace AgileEstimation.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    Task<AuthResponse> LoginAsync(LoginRequest request);

    /// <summary>
    /// Exchanges a still-valid refresh token for a new access+refresh
    /// pair, revoking the one presented (rotation-on-use) — see Part 1
    /// review, finding 3.2. Returns Success = false with no tokens if the
    /// presented token is unknown, expired, or already revoked.
    /// </summary>
    Task<AuthResponse> RefreshTokenAsync(string refreshToken);

    /// <summary>
    /// Revokes a refresh token so it can no longer be exchanged, even if
    /// it hasn't expired yet. Silently succeeds if the token is unknown
    /// or already revoked — logout should never leak whether a token was
    /// valid to a client that no longer has a valid session anyway.
    /// </summary>
    Task LogoutAsync(string refreshToken);
}