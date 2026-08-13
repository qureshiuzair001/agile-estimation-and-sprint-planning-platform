using AgileEstimation.Domain.Common;

namespace AgileEstimation.Domain.Entities;

/// <summary>
/// Backs the refresh-token flow that was entirely missing before (Part 1
/// review, finding 3.2 — access tokens expired after 60 minutes with no
/// way to silently renew, forcing a hard logout mid-session).
///
/// Only a SHA-256 hash of the actual token is ever persisted, the same
/// principle as password hashing — a leaked database row is useless to
/// an attacker without the raw token, which never touches storage (see
/// JwtService.HashRefreshToken). Rotation-on-use is enforced by the
/// service layer: each refresh both issues a new token and revokes the
/// one just used, storing a hash of its replacement for audit purposes
/// rather than leaving the old row looking merely "expired."
/// </summary>
public class RefreshToken : BaseEntity
{
    public Guid UserId { get; private set; }

    public User User { get; private set; } = null!;

    public string TokenHash { get; private set; } = string.Empty;

    public DateTime ExpiresAt { get; private set; }

    public DateTime? RevokedAt { get; private set; }

    public string? ReplacedByTokenHash { get; private set; }

    public bool IsActive => RevokedAt is null && DateTime.UtcNow < ExpiresAt;

    // Required by EF Core
    private RefreshToken()
    {
    }

    public RefreshToken(Guid userId, string tokenHash, DateTime expiresAt)
    {
        UserId = userId;
        TokenHash = tokenHash;
        ExpiresAt = expiresAt;
    }

    public void Revoke(string? replacedByTokenHash = null)
    {
        RevokedAt = DateTime.UtcNow;
        ReplacedByTokenHash = replacedByTokenHash;
        MarkUpdated();
    }
}
