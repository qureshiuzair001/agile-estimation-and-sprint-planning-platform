using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface ISessionRepository
{
    Task AddAsync(Session session);

    Task<Session?> GetByIdAsync(Guid id);

    Task<Session?> GetByCodeAsync(string sessionCode);

    Task<string?> GetSessionCodeAsync(Guid sessionId);

    /// <summary>
    /// Sessions where the user is either the moderator or a participant.
    /// Backs the new GET /api/sessions/mine endpoint (see backend review,
    /// item 16 — there was previously no way to list a user's sessions).
    /// </summary>
    Task<List<Session>> GetSessionsForUserAsync(Guid userId);

    void Update(Session session);

    Task SaveChangesAsync();
}