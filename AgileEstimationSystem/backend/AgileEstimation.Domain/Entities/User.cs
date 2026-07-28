using AgileEstimation.Domain.Common;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;

public class User : BaseEntity
{
    public string Username { get; private set; } = string.Empty;

    public string Email { get; private set; } = string.Empty;

    public string PasswordHash { get; private set; } = string.Empty;

    public UserRole Role { get; private set; }

    public bool IsActive { get; private set; } = true;

    public ICollection<Session> CreatedSessions { get; private set; } = new List<Session>();

    public ICollection<SessionParticipant> JoinedSessions { get; private set; } = new List<SessionParticipant>();

    public ICollection<Vote> Votes { get; private set; } = new List<Vote>();

    // Required by EF Core
    private User()
    {
    }

    public User(
        string username,
        string email,
        string passwordHash,
        UserRole role)
    {
        Username = username;
        Email = email;
        PasswordHash = passwordHash;
        Role = role;
    }

    public void Deactivate()
    {
        IsActive = false;
        MarkUpdated();
    }

    public void Activate()
    {
        IsActive = true;
        MarkUpdated();
    }
}