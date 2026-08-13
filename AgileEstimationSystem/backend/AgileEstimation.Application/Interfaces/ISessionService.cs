using AgileEstimation.Application.DTOs.Session;

namespace AgileEstimation.Application.Interfaces;

public interface ISessionService
{
    Task<SessionResponse> CreateSessionAsync(
        Guid moderatorId,
        CreateSessionRequest request);

    /// <summary>
    /// Changed from Task&lt;bool&gt; to Task&lt;SessionResponse?&gt; so a joining
    /// client immediately gets the session's id — previously POST /join
    /// only returned a message, leaving the frontend with no way to
    /// navigate into the room it had just joined (see backend review).
    /// </summary>
    Task<SessionResponse?> JoinSessionAsync(
        Guid userId,
        JoinSessionRequest request);

    Task<SessionResponse?> GetSessionAsync(Guid sessionId, Guid currentUserId);

    /// <summary>
    /// Added so a client can resolve a session's id from just its code —
    /// e.g. to reload a room after a page refresh. See backend review,
    /// the "no way to resolve code -> id" gap.
    /// </summary>
    Task<SessionResponse?> GetSessionByCodeAsync(string sessionCode, Guid currentUserId);

    /// <summary>
    /// Added to back GET /api/sessions/mine (see backend review, item 16).
    /// </summary>
    Task<List<SessionResponse>> GetSessionsForUserAsync(Guid userId);

    Task<List<ParticipantResponse>> GetParticipantsAsync(Guid sessionId);

    Task UpdateConnectionAsync(
        Guid sessionId,
        Guid userId,
        string connectionId);

    Task LeaveSessionAsync(
        Guid sessionId,
        Guid userId);

    /// <summary>
    /// Used by the hub's LeaveSession method, which only has the session
    /// code available (not the id). Previously the hub's LeaveSession did
    /// nothing but remove the SignalR group membership — it never updated
    /// the participant record or notified the rest of the group, unlike
    /// the REST leave endpoint. This makes both paths behave the same way.
    /// </summary>
    Task<List<ParticipantResponse>> LeaveSessionByCodeAsync(
        string sessionCode,
        Guid userId);

    /// <summary>
    /// Returns the session's code on success so the caller can broadcast
    /// "SessionClosed" to it, or null if the session doesn't exist or the
    /// caller isn't its moderator (see Part 1 review, finding 3.7 —
    /// closing a session previously never notified anyone else connected
    /// to it in real time).
    /// </summary>
    Task<string?> CloseSessionAsync(
        Guid sessionId,
        Guid moderatorId);

    /// <summary>
    /// Returns null if the session/user isn't found; otherwise whether the
    /// given user is that session's moderator. Backs authorization checks
    /// in TicketService and the hub's RevealVotes/ResetVotes methods.
    /// </summary>
    Task<bool> IsModeratorAsync(Guid sessionId, Guid userId);

    Task<bool> IsModeratorByCodeAsync(string sessionCode, Guid userId);

    /// <summary>
    /// Now returns the session code alongside the refreshed participant
    /// list (or null if the connection wasn't tied to any participant),
    /// so the hub can broadcast ParticipantsUpdated to the correct group.
    /// Previously this information was silently discarded and disconnects
    /// were never broadcast at all (see backend review).
    /// </summary>
    Task<DisconnectResult?> HandleDisconnectAsync(string connectionId);
}
