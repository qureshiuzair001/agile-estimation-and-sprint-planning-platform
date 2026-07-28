namespace AgileEstimation.Application.DTOs.Session;

public class ParticipantResponse
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public bool IsOnline { get; set; }
}