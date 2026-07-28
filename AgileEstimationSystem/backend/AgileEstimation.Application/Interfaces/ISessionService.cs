using AgileEstimation.Application.DTOs.Session;

namespace AgileEstimation.Application.Interfaces;

public interface ISessionService
{
    Task<SessionResponse> CreateSessionAsync(
        Guid moderatorId,
        CreateSessionRequest request);

    Task<bool> JoinSessionAsync(
        Guid userId,
        JoinSessionRequest request);

    Task<SessionResponse?> GetSessionAsync(Guid sessionId);

    Task<List<ParticipantResponse>> GetParticipantsAsync(Guid sessionId);

    Task LeaveSessionAsync(Guid sessionId, Guid userId);

    Task CloseSessionAsync(Guid sessionId, Guid moderatorId);
}