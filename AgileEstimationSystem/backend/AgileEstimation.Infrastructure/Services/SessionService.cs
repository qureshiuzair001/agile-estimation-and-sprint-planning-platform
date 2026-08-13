using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;
using AutoMapper;
using System.Security.Cryptography;

namespace AgileEstimation.Infrastructure.Services;

public class SessionService : ISessionService
{
    private const int MaxSessionCodeGenerationAttempts = 20;

    private readonly ISessionRepository _sessionRepository;
    private readonly ISessionParticipantRepository _participantRepository;
    private readonly IMapper _mapper;

    public SessionService(
        ISessionRepository sessionRepository,
        ISessionParticipantRepository participantRepository,
        IMapper mapper)
    {
        _sessionRepository = sessionRepository;
        _participantRepository = participantRepository;
        _mapper = mapper;
    }

    public async Task<SessionResponse> CreateSessionAsync(
        Guid moderatorId,
        CreateSessionRequest request)
    {
        var sessionCode = await GenerateUniqueSessionCodeAsync();

        var session = new Session(
            request.Title,
            sessionCode,
            moderatorId);

        await _sessionRepository.AddAsync(session);

        await _sessionRepository.SaveChangesAsync();

        return MapSession(session, moderatorId);
    }

    public async Task<SessionResponse?> JoinSessionAsync(
    Guid userId,
    JoinSessionRequest request)
    {
        var session = await _sessionRepository
            .GetByCodeAsync(request.SessionCode);

        if (session == null)
            return null;

        if (session.Status == SessionStatus.Closed)
            return null;

        var exists = await _participantRepository
            .ExistsAsync(session.Id, userId);

        // Behavior change: previously re-joining an already-joined session
        // returned failure. That made it impossible to safely retry a
        // join (e.g. after a page refresh) — now it's idempotent: if
        // you're already a participant, joining again just succeeds.
        if (!exists)
        {
            var participant = new SessionParticipant(
                session.Id,
                userId);

            await _participantRepository.AddAsync(participant);

            await _participantRepository.SaveChangesAsync();
        }

        return MapSession(session, userId);
    }

    public async Task<SessionResponse?> GetSessionAsync(Guid sessionId, Guid currentUserId)
    {
        var session =
            await _sessionRepository.GetByIdAsync(sessionId);

        if (session == null)
            return null;

        return MapSession(session, currentUserId);
    }

    public async Task<SessionResponse?> GetSessionByCodeAsync(string sessionCode, Guid currentUserId)
    {
        var session = await _sessionRepository.GetByCodeAsync(sessionCode);

        if (session == null)
            return null;

        return MapSession(session, currentUserId);
    }

    public async Task<List<SessionResponse>> GetSessionsForUserAsync(Guid userId)
    {
        var sessions = await _sessionRepository.GetSessionsForUserAsync(userId);

        return sessions
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => MapSession(s, userId))
            .ToList();
    }

    public async Task<List<ParticipantResponse>>
    GetParticipantsAsync(Guid sessionId)
    {
        var participants =
            await _participantRepository
                .GetParticipantsAsync(sessionId);

        return MapParticipants(participants);
    }

    public async Task LeaveSessionAsync(
    Guid sessionId,
    Guid userId)
    {
        var participant =
            await _participantRepository
                .GetAsync(sessionId, userId);

        if (participant == null)
            return;

        _participantRepository.Remove(participant);

        await _participantRepository.SaveChangesAsync();
    }

    public async Task<List<ParticipantResponse>> LeaveSessionByCodeAsync(
        string sessionCode,
        Guid userId)
    {
        var session = await _sessionRepository.GetByCodeAsync(sessionCode);

        if (session == null)
            return new List<ParticipantResponse>();

        var participant = await _participantRepository.GetAsync(session.Id, userId);

        if (participant != null)
        {
            _participantRepository.Remove(participant);
            await _participantRepository.SaveChangesAsync();
        }

        return await GetParticipantsAsync(session.Id);
    }

    public async Task<string?> CloseSessionAsync(
    Guid sessionId,
    Guid moderatorId)
    {
        var session =
            await _sessionRepository.GetByIdAsync(sessionId);

        if (session == null)
            return null;

        if (session.ModeratorId != moderatorId)
            return null;

        session.Close();

        _sessionRepository.Update(session);

        await _sessionRepository.SaveChangesAsync();

        return session.SessionCode;
    }

    public async Task<bool> IsModeratorAsync(Guid sessionId, Guid userId)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);
        return session != null && session.ModeratorId == userId;
    }

    public async Task<bool> IsModeratorByCodeAsync(string sessionCode, Guid userId)
    {
        var session = await _sessionRepository.GetByCodeAsync(sessionCode);
        return session != null && session.ModeratorId == userId;
    }

    /// <summary>
    /// Previously an unbounded do/while — with a 6-character, 33-symbol
    /// alphabet (~1.3 billion combinations) a collision is practically a
    /// non-issue at any realistic scale, but an unbounded retry meant a
    /// pathological case (or a future bug that narrows the alphabet)
    /// could hang a request indefinitely instead of failing fast (see
    /// Part 1 review, finding 3.10). Now it fails loudly instead.
    /// </summary>
    private async Task<string> GenerateUniqueSessionCodeAsync()
    {
        for (var attempt = 0; attempt < MaxSessionCodeGenerationAttempts; attempt++)
        {
            var candidate = GenerateSessionCode();

            if (await _sessionRepository.GetByCodeAsync(candidate) == null)
                return candidate;
        }

        throw new InvalidOperationException(
            "Could not generate a unique session code after multiple attempts.");
    }

    private static string GenerateSessionCode()
    {
        const string chars =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        Span<byte> buffer = stackalloc byte[6];

        RandomNumberGenerator.Fill(buffer);

        char[] code = new char[6];

        for (int i = 0; i < 6; i++)
        {
            code[i] = chars[buffer[i] % chars.Length];
        }

        return new string(code);
    }

    public async Task UpdateConnectionAsync(
    Guid sessionId,
    Guid userId,
    string connectionId)
    {
        var participant =
            await _participantRepository
                .GetAsync(sessionId, userId);

        if (participant == null)
            return;

        participant.Connect(connectionId);

        _participantRepository.Update(participant);

        await _participantRepository.SaveChangesAsync();
    }

    public async Task<DisconnectResult?> HandleDisconnectAsync(
    string connectionId)
    {
        var participant =
            await _participantRepository
                .GetByConnectionIdAsync(connectionId);

        if (participant == null)
            return null;

        var sessionCode = await _sessionRepository.GetSessionCodeAsync(participant.SessionId);

        if (sessionCode == null)
            return null;

        participant.Disconnect();

        _participantRepository.Update(participant);

        await _participantRepository.SaveChangesAsync();

        return new DisconnectResult
        {
            SessionCode = sessionCode,
            Participants = await GetParticipantsAsync(participant.SessionId)
        };
    }

    private SessionResponse MapSession(Session session, Guid currentUserId)
    {
        return _mapper.Map<SessionResponse>(
            session,
            opts => opts.Items["currentUserId"] = currentUserId);
    }

    private List<ParticipantResponse> MapParticipants(
        IEnumerable<SessionParticipant> participants)
    {
        // Ordering is business logic (online-first, then alphabetical) and
        // stays here; only the per-item entity → DTO shape now goes
        // through AutoMapper (see MappingProfile).
        return participants
            .OrderByDescending(p => p.IsOnline)
            .ThenBy(p => p.User.Username)
            .Select(p => _mapper.Map<ParticipantResponse>(p))
            .ToList();
    }
}
