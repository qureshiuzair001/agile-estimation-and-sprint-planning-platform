namespace AgileEstimation.Application.DTOs.Session;

public class ParticipantResponse
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public bool IsOnline { get; set; }

    /// <summary>
    /// The participant's account role ("Moderator", "Developer",
    /// "Tester") — new field so the frontend roster can show a role
    /// badge without a second lookup.
    /// </summary>
    public string Role { get; set; } = string.Empty;
}
