using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;
using System.Security.Cryptography;

namespace AgileEstimation.Infrastructure.Services;

public class SessionService : ISessionService
{
    private readonly ISessionRepository _sessionRepository;
    private readonly ISessionParticipantRepository _participantRepository;

    public SessionService(
        ISessionRepository sessionRepository,
        ISessionParticipantRepository participantRepository)
    {
        _sessionRepository = sessionRepository;
        _participantRepository = participantRepository;
    }

    public async Task<SessionResponse> CreateSessionAsync(
        Guid moderatorId,
        CreateSessionRequest request)
    {
        string sessionCode;

        do
        {
            sessionCode = GenerateSessionCode();
        }
        while (await _sessionRepository.GetByCodeAsync(sessionCode) != null);

        var session = new Session(
            request.Title,
            sessionCode,
            moderatorId);

        await _sessionRepository.AddAsync(session);

        await _sessionRepository.SaveChangesAsync();

        return new SessionResponse
        {
            Id = session.Id,
            SessionCode = session.SessionCode,
            Title = session.Title,
            Status = session.Status.ToString()
        };
    }

    public async Task<bool> JoinSessionAsync(
    Guid userId,
    JoinSessionRequest request)
    {
        var session = await _sessionRepository
            .GetByCodeAsync(request.SessionCode);

        if (session == null)
            return false;

        if (session.Status == SessionStatus.Closed)
            return false;

        var exists = await _participantRepository
            .ExistsAsync(session.Id, userId);

        if (exists)
            return false;

        var participant = new SessionParticipant(
            session.Id,
            userId);

        await _participantRepository.AddAsync(participant);

        await _participantRepository.SaveChangesAsync();

        return true;
    }

    public async Task<SessionResponse?> GetSessionAsync(Guid sessionId)
    {
        var session =
            await _sessionRepository.GetByIdAsync(sessionId);

        if (session == null)
            return null;

        return new SessionResponse
        {
            Id = session.Id,
            SessionCode = session.SessionCode,
            Title = session.Title,
            Status = session.Status.ToString()
        };
    }

    public async Task<List<ParticipantResponse>>
GetParticipantsAsync(Guid sessionId)
    {
        var participants =
            await _participantRepository
                .GetParticipantsAsync(sessionId);

        return participants.Select(x => new ParticipantResponse
        {
            UserId = x.UserId,
            Username = x.User.Username,
            IsOnline = x.IsOnline
        }).ToList();
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

    public async Task CloseSessionAsync(
    Guid sessionId,
    Guid moderatorId)
    {
        var session =
            await _sessionRepository.GetByIdAsync(sessionId);

        if (session == null)
            return;

        if (session.ModeratorId != moderatorId)
            return;

        session.Close();

        _sessionRepository.Update(session);

        await _sessionRepository.SaveChangesAsync();
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

}