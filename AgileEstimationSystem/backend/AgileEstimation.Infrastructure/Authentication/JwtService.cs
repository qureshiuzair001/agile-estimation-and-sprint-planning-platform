using AgileEstimation.Application.DTOs.Auth;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace AgileEstimation.Infrastructure.Authentication;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;

    public JwtService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public JwtTokenResult GenerateToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtSettings["Key"]!));

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256);

        var expiry = DateTime.UtcNow.AddMinutes(
            Convert.ToDouble(jwtSettings["ExpiryInMinutes"]));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(JwtRegisteredClaimNames.UniqueName, user.Username),
            new(ClaimTypes.Role, user.Role.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: expiry,
            signingCredentials: credentials);

        return new JwtTokenResult
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiry
        };
    }

    /// <summary>
    /// Opaque, not a JWT — a refresh token doesn't need to carry claims,
    /// it only needs to be unguessable and checkable against the
    /// database, so a random byte string is simpler and smaller than
    /// minting a second JWT (see Part 3 backend notes).
    /// </summary>
    public RefreshTokenResult GenerateRefreshToken()
    {
        var jwtSettings = _configuration.GetSection("Jwt");

        // Same manual-parse pattern as ExpiryInMinutes above, rather than
        // IConfiguration's GetValue<T>() — that extension lives in the
        // Microsoft.Extensions.Configuration.Binder package, which isn't
        // referenced by this project, and pulling in a new package for
        // one nullable-double read wasn't worth it.
        var expiryDaysSetting = jwtSettings["RefreshTokenExpiryInDays"];
        var expiryDays = string.IsNullOrWhiteSpace(expiryDaysSetting)
            ? 7
            : Convert.ToDouble(expiryDaysSetting);

        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

        return new RefreshTokenResult
        {
            RawToken = rawToken,
            TokenHash = HashRefreshToken(rawToken),
            ExpiresAt = DateTime.UtcNow.AddDays(expiryDays)
        };
    }

    public string HashRefreshToken(string rawToken)
    {
        var hashBytes = SHA256.HashData(Encoding.UTF8.GetBytes(rawToken));
        return Convert.ToHexString(hashBytes);
    }
}