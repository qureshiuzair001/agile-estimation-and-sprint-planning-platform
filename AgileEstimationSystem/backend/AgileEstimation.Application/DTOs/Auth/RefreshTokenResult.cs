namespace AgileEstimation.Application.DTOs.Auth;

/// <summary>
/// Never serialized to a client as-is — RawToken is what gets sent back
/// in an AuthResponse; TokenHash is what gets persisted. Keeping both on
/// one object (rather than two separate service calls) guarantees the
/// hash the caller stores always matches the token it hands out.
/// </summary>
public class RefreshTokenResult
{
    public string RawToken { get; set; } = string.Empty;

    public string TokenHash { get; set; } = string.Empty;

    public DateTime ExpiresAt { get; set; }
}
