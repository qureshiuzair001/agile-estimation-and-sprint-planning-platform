namespace AgileEstimation.Application.DTOs.Session;

public class SessionResponse
{
    public Guid Id { get; set; }

    public string SessionCode { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;
}