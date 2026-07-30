using AgileEstimation.Domain.Common;

namespace AgileEstimation.Domain.Entities;

public class SessionParticipant : BaseEntity
{
    public Guid SessionId { get; private set; }

    public Session Session { get; private set; } = null!;

    public Guid UserId { get; private set; }

    public User User { get; private set; } = null!;

    public string? ConnectionId { get; private set; }

    public bool IsOnline { get; private set; }

    public DateTime JoinedAt { get; private set; }

    // Required by EF Core
    private SessionParticipant()
    {
    }

    public SessionParticipant(Guid sessionId, Guid userId)
    {
        SessionId = sessionId;
        UserId = userId;
        JoinedAt = DateTime.UtcNow;
        IsOnline = true;
    }

    public void Disconnect()
    {
        IsOnline = false;
        ConnectionId = null;
        MarkUpdated();
    }

    public void Connect(string connectionId)
    {
        ConnectionId = connectionId;
        IsOnline = true;

        MarkUpdated();
    }
}