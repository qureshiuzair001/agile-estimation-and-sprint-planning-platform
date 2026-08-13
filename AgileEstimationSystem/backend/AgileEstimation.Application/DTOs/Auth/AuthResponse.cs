namespace AgileEstimation.Application.DTOs.Auth;

public class AuthResponse
{
    public bool Success { get; set; }

    public string Message { get; set; } = string.Empty;

    public JwtTokenResult? JwtToken { get; set; }

    /// <summary>
    /// The raw refresh token — only ever populated on Login/Refresh, and
    /// only this one time; the server never returns it again (it only
    /// ever stores its hash). See Part 3 backend notes, closing Part 1
    /// finding 3.2.
    /// </summary>
    public string? RefreshToken { get; set; }
}