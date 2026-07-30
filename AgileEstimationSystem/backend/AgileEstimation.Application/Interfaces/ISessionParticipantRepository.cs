using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface ISessionParticipantRepository
{
    Task AddAsync(SessionParticipant participant);

    Task<bool> ExistsAsync(
        Guid sessionId,
        Guid userId);

    Task<List<SessionParticipant>> GetParticipantsAsync(
        Guid sessionId);

    Task<SessionParticipant?> GetAsync(
        Guid sessionId,
        Guid userId);

    Task<SessionParticipant?> GetByConnectionIdAsync(
        string connectionId);

    void Update(SessionParticipant participant);

    void Remove(SessionParticipant participant);

    Task SaveChangesAsync();
}