using AgileEstimation.Application.DTOs.Voting;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

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

    public async Task JoinSession(
    Guid sessionId,
    string sessionCode)
    {
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            sessionCode);

        var userId = Guid.Parse(
            Context.User!
                .FindFirst(ClaimTypes.NameIdentifier)!
                .Value);

        await _sessionService.UpdateConnectionAsync(
            sessionId,
            userId,
            Context.ConnectionId);

        var participants =
            await _sessionService.GetParticipantsAsync(sessionId);

        await Clients.Group(sessionCode)
            .SendAsync(
                "ParticipantsUpdated",
                participants);
    }

    public async Task LeaveSession(
    string sessionCode)
    {
        await Groups.RemoveFromGroupAsync(
            Context.ConnectionId,
            sessionCode);
    }


    public async Task CastVote(
    string sessionCode,
    CastVoteRequest request)
    {
        var userId = Guid.Parse(
            Context.User!
                .FindFirst(ClaimTypes.NameIdentifier)!
                .Value);

        await _voteService.CastVoteAsync(userId, request);

        await Clients.Group(sessionCode)
            .SendAsync("VoteSubmitted", new
            {
                UserId = userId,
                TicketId = request.TicketId
            });
    }

    public async Task RevealVotes(
    string sessionCode,
    Guid ticketId)
    {
        var result = await _voteService.RevealVotesAsync(ticketId);

        await Clients.Group(sessionCode)
            .SendAsync("VotesRevealed", result);
    }

    public async Task ResetVotes(
    string sessionCode,
    Guid ticketId)
    {
        await _voteService.ResetVotesAsync(ticketId);

        await Clients.Group(sessionCode)
            .SendAsync("VotesReset", ticketId);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await _sessionService.HandleDisconnectAsync(Context.ConnectionId);

        await base.OnDisconnectedAsync(exception);
    }
}