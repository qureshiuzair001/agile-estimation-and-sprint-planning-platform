using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface IJwtService
{
    JwtTokenResult GenerateToken(User user);

    /// <summary>
    /// Generates a new opaque refresh token: the raw value to hand to the
    /// client, and a SHA-256 hash of it to persist — mirroring password
    /// hashing, the raw token is never stored (see Part 3 backend notes,
    /// closing Part 1 finding 3.2).
    /// </summary>
    RefreshTokenResult GenerateRefreshToken();

    /// <summary>
    /// Hashes a raw refresh token the same way GenerateRefreshToken does,
    /// so a token a client presents on /auth/refresh can be looked up by
    /// its hash.
    /// </summary>
    string HashRefreshToken(string rawToken);
}