using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface ISessionRepository
{
    Task AddAsync(Session session);

    Task<Session?> GetByIdAsync(Guid id);

    Task<Session?> GetByCodeAsync(string sessionCode);

    Task<string?> GetSessionCodeAsync(Guid sessionId);

    void Update(Session session);

    Task SaveChangesAsync();
}