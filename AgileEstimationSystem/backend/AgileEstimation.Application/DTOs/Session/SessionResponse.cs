namespace AgileEstimation.Application.DTOs.Session;

public class SessionResponse
{
    public Guid Id { get; set; }

    public string SessionCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public Guid ModeratorId { get; set; }

    /// <summary>
    /// Computed server-side from the requester's JWT claim, not trusted
    /// client input. Added so the frontend can correctly show/hide
    /// moderator-only controls (previously impossible — see backend
    /// review) without guessing.
    /// </summary>
    public bool IsCurrentUserModerator { get; set; }
}
