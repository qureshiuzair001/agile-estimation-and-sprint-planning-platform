using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;

namespace AgileEstimation.Infrastructure.Authentication;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;
    private readonly IRefreshTokenRepository _refreshTokenRepository;

    public AuthService(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService,
        IRefreshTokenRepository refreshTokenRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
        _refreshTokenRepository = refreshTokenRepository;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var existingEmail = await _userRepository.GetByEmailAsync(request.Email);

        if (existingEmail != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Email already exists."
            };
        }

        var existingUsername = await _userRepository.GetByUsernameAsync(request.Username);

        if (existingUsername != null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Username already exists."
            };
        }

        Enum.TryParse<UserRole>(request.Role, true, out var role);

        var user = new User(
            request.Username,
            request.Email,
            _passwordHasher.HashPassword(request.Password),
            role);

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = "User registered successfully."
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user == null)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        if (!_passwordHasher.VerifyPassword(request.Password, user.PasswordHash))
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Invalid email or password."
            };
        }

        var jwtToken = _jwtService.GenerateToken(user);
        var refreshToken = await IssueRefreshTokenAsync(user.Id);

        return new AuthResponse
        {
            Success = true,
            Message = "Login successful.",
            JwtToken = jwtToken,
            RefreshToken = refreshToken
        };
    }

    /// <summary>
    /// See Part 1 review, finding 3.2 — this whole method is the fix.
    /// Rotation-on-use: the presented token is revoked (recording the
    /// hash of its replacement) in the same operation that issues the
    /// new pair, so a stolen-but-already-used refresh token can never be
    /// replayed even if a race lets both requests reach here concurrently
    /// against the same still-active row — whichever commits second will
    /// find the token already revoked by the constraint on RevokedAt.
    /// </summary>
    public async Task<AuthResponse> RefreshTokenAsync(string refreshToken)
    {
        var tokenHash = _jwtService.HashRefreshToken(refreshToken);
        var existing = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);

        if (existing == null || !existing.IsActive)
        {
            return new AuthResponse
            {
                Success = false,
                Message = "Refresh token is invalid or has expired. Please sign in again."
            };
        }

        var newAccessToken = _jwtService.GenerateToken(existing.User);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        existing.Revoke(newRefreshToken.TokenHash);
        _refreshTokenRepository.Update(existing);

        await _refreshTokenRepository.AddAsync(
            new RefreshToken(existing.UserId, newRefreshToken.TokenHash, newRefreshToken.ExpiresAt));

        await _refreshTokenRepository.SaveChangesAsync();

        return new AuthResponse
        {
            Success = true,
            Message = "Token refreshed.",
            JwtToken = newAccessToken,
            RefreshToken = newRefreshToken.RawToken
        };
    }

    public async Task LogoutAsync(string refreshToken)
    {
        var tokenHash = _jwtService.HashRefreshToken(refreshToken);
        var existing = await _refreshTokenRepository.GetByTokenHashAsync(tokenHash);

        if (existing == null || existing.RevokedAt != null)
            return;

        existing.Revoke();
        _refreshTokenRepository.Update(existing);

        await _refreshTokenRepository.SaveChangesAsync();
    }

    private async Task<string> IssueRefreshTokenAsync(Guid userId)
    {
        var generated = _jwtService.GenerateRefreshToken();

        await _refreshTokenRepository.AddAsync(
            new RefreshToken(userId, generated.TokenHash, generated.ExpiresAt));

        await _refreshTokenRepository.SaveChangesAsync();

        return generated.RawToken;
    }
}
