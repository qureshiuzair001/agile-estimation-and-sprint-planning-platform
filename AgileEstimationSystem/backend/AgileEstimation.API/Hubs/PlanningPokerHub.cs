using AgileEstimation.API.Extensions;
using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.DTOs.Voting;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace AgileEstimation.API.Hubs;

[Authorize]
public class PlanningPokerHub : Hub
{
    private readonly IVoteService _voteService;
    private readonly ISessionService _sessionService;

    public PlanningPokerHub(
        IVoteService voteService,
        ISessionService sessionService)
    {
        _voteService = voteService;
        _sessionService = sessionService;
    }

    // Reuses the same extension the REST controllers use (see
    // AgileEstimation.API.Extensions.ClaimsPrincipalExtensions) instead of
    // a fourth copy of "parse NameIdentifier into a Guid" (Part 1 review,
    // architecture finding #1).
    private Guid CurrentUserId => Context.User!.GetUserId();

    // "Moderator", "Developer", or "Tester" — see ClaimsPrincipalExtensions.GetRole().
    private string CurrentRole => Context.User!.GetRole();

    /// <summary>
    /// Every session has, in addition to its main "{code}" group (used
    /// for whole-room broadcasts like ParticipantsUpdated), one group per
    /// role: "{code}:Moderator", "{code}:Developer", "{code}:Tester".
    /// These exist purely so a reveal can be sent to exactly the right
    /// audience — see RevealVotes, which is the only place that actually
    /// needs them. Joined in JoinSession, left in LeaveSession; SignalR
    /// cleans up group membership automatically on disconnect, so
    /// OnDisconnectedAsync doesn't need to do anything extra for these.
    /// </summary>
    private static string RoleGroup(string sessionCode, string role) => $"{sessionCode}:{role}";

    /// <summary>
    /// SignalR hub methods never run through MVC's [ApiController]
    /// automatic model validation — that pipeline is REST-only. Every hub
    /// method below that takes a sessionCode/id from the client validates
    /// it explicitly for that reason (see Part 1 review, finding 3.5,
    /// which flagged this as unguarded everywhere except CastVote).
    /// </summary>
    private static void EnsureSessionCode(string sessionCode)
    {
        if (string.IsNullOrWhiteSpace(sessionCode))
            throw new HubException("A session code is required.");
    }

    private static void EnsureNotEmpty(Guid id, string paramName)
    {
        if (id == Guid.Empty)
            throw new HubException($"A valid {paramName} is required.");
    }

    public async Task JoinSession(
    Guid sessionId,
    string sessionCode)
    {
        EnsureNotEmpty(sessionId, "session id");
        EnsureSessionCode(sessionCode);

        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            sessionCode);

        // New: also join a role-specific group, so a reveal can target
        // "everyone who should see this audience's votes" without a
        // per-connection filter (see RoleGroup and RevealVotes below).
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            RoleGroup(sessionCode, CurrentRole));

        await _sessionService.UpdateConnectionAsync(
            sessionId,
            CurrentUserId,
            Context.ConnectionId);

        var participants =
            await _sessionService.GetParticipantsAsync(sessionId);

        await Clients.Group(sessionCode)
            .SendAsync(
                "ParticipantsUpdated",
                participants);
    }

    /// <summary>
    /// Previously this only removed the SignalR group membership — it
    /// never marked the participant offline in the database or notified
    /// anyone, unlike the REST /{id}/leave endpoint (see backend review,
    /// item 7). Now both paths behave the same way.
    /// </summary>
    public async Task LeaveSession(
    string sessionCode)
    {
        EnsureSessionCode(sessionCode);

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            sessionCode);

        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            RoleGroup(sessionCode, CurrentRole));

        var participants =
            await _sessionService.LeaveSessionByCodeAsync(sessionCode, CurrentUserId);

        await Clients.Group(sessionCode)
            .SendAsync("ParticipantsUpdated", participants);
    }

    public async Task CastVote(
    string sessionCode,
    CastVoteRequest request)
    {
        EnsureSessionCode(sessionCode);

        var userId = CurrentUserId;

        try
        {
            await _voteService.CastVoteAsync(userId, sessionCode, request);
        }
        catch (InvalidVoteException ex)
        {
            throw new HubException(ex.Message);
        }

        // Broadcast to the whole room, not just role groups: everyone —
        // regardless of role — is allowed to see *that* someone voted
        // (the tick mark), just not *what* they voted until reveal. Only
        // the reveal itself is audience-segmented (see RevealVotes).
        await Clients.Group(sessionCode)
            .SendAsync("VoteSubmitted", new
            {
                UserId = userId,
                TicketId = request.TicketId
            });
    }

    /// <summary>
    /// Checks the caller is the session's moderator (see backend review,
    /// item 4 — previously any connected client could reveal votes for
    /// any session), then sends two DIFFERENT payloads to two DIFFERENT
    /// audiences instead of one broadcast to everyone: Developers only
    /// ever receive the Developer+Moderator vote set, Testers only the
    /// Tester+Moderator set — they never see each other's individual
    /// estimates (the feature this session is built around). The
    /// Moderator group is included in both sends, so the Moderator's own
    /// client receives both payloads and can render both panels; everyone
    /// else only ever gets the one that matches their own role, because
    /// SignalR simply doesn't deliver a group-targeted send to a
    /// connection that isn't a member of that group.
    /// </summary>
    public async Task RevealVotes(
    string sessionCode,
    Guid ticketId)
    {
        EnsureSessionCode(sessionCode);
        EnsureNotEmpty(ticketId, "ticket id");

        if (!await _sessionService.IsModeratorByCodeAsync(sessionCode, CurrentUserId))
            throw new HubException("Only the session's moderator can reveal votes.");

        var moderatorGroup = RoleGroup(sessionCode, "Moderator");
        var developerGroup = RoleGroup(sessionCode, "Developer");
        var testerGroup = RoleGroup(sessionCode, "Tester");

        var developerResult = await _voteService.RevealVotesForAudienceAsync(ticketId, "Developer");
        var testerResult = await _voteService.RevealVotesForAudienceAsync(ticketId, "Tester");

        await Clients.Groups(new[] { developerGroup, moderatorGroup })
            .SendAsync("VotesRevealed", developerResult);

        await Clients.Groups(new[] { testerGroup, moderatorGroup })
            .SendAsync("VotesRevealed", testerResult);
    }

    public async Task ResetVotes(
    string sessionCode,
    Guid ticketId)
    {
        EnsureSessionCode(sessionCode);
        EnsureNotEmpty(ticketId, "ticket id");

        if (!await _sessionService.IsModeratorByCodeAsync(sessionCode, CurrentUserId))
            throw new HubException("Only the session's moderator can reset votes.");

        await _voteService.ResetVotesAsync(ticketId);

        // Unlike RevealVotes, this carries no vote values — just an
        // instruction to clear local state — so broadcasting it to
        // everyone regardless of role leaks nothing.
        await Clients.Group(sessionCode)
            .SendAsync("VotesReset", ticketId);
    }

    /// <summary>
    /// Commits the moderator's confirmed final estimate onto the ticket
    /// and broadcasts the update to the whole group (see Part 1 review,
    /// finding 3.1 — reveal never used to persist anything). Moderator-only,
    /// same authorization pattern as RevealVotes/ResetVotes above. The
    /// final estimate itself is never audience-segmented — once the team
    /// has agreed, everyone should see the same number.
    /// </summary>
    public async Task FinalizeEstimate(
    string sessionCode,
    Guid ticketId,
    int finalEstimate)
    {
        EnsureSessionCode(sessionCode);
        EnsureNotEmpty(ticketId, "ticket id");

        if (!await _sessionService.IsModeratorByCodeAsync(sessionCode, CurrentUserId))
            throw new HubException("Only the session's moderator can finalize the estimate.");

        TicketResponse ticket;

        try
        {
            ticket = await _voteService.FinalizeEstimateAsync(ticketId, finalEstimate);
        }
        catch (InvalidVoteException ex)
        {
            throw new HubException(ex.Message);
        }

        await Clients.Group(sessionCode)
            .SendAsync("EstimateFinalized", ticket);
    }

    /// <summary>
    /// Now actually broadcasts to the group after a disconnect — the
    /// service call previously discarded its own return value and no one
    /// was ever notified that a participant went offline (see backend
    /// review, item 6).
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var result = await _sessionService.HandleDisconnectAsync(Context.ConnectionId);

        if (result != null)
        {
            await Clients.Group(result.SessionCode)
                .SendAsync("ParticipantsUpdated", result.Participants);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
