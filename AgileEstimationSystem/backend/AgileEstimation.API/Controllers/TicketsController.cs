using AgileEstimation.API.Extensions;
using AgileEstimation.API.Hubs;
using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AgileEstimation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;
    private readonly ISessionService _sessionService;
    private readonly IHubContext<PlanningPokerHub> _hubContext;

    public TicketsController(
        ITicketService ticketService,
        ISessionService sessionService,
        IHubContext<PlanningPokerHub> hubContext)
    {
        _ticketService = ticketService;
        _sessionService = sessionService;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Create/Update/Delete/Activate all check the caller is the
    /// session's moderator (see backend review, item 4 — previously any
    /// authenticated user could manage any session's tickets). A rejected
    /// check throws ForbiddenOperationException; previously that was
    /// caught here action-by-action and mapped to 403 in each method —
    /// now GlobalExceptionMiddleware does that mapping once, globally, so
    /// these actions no longer need their own try/catch (see Part 3
    /// backend notes).
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(CreateTicketRequest request)
    {
        var ticket = await _ticketService.CreateTicketAsync(User.GetUserId(), request);
        return Ok(ticket);
    }

    [HttpGet("{ticketId:guid}")]
    public async Task<IActionResult> GetTicket(Guid ticketId)
    {
        var ticket = await _ticketService.GetTicketAsync(ticketId);

        if (ticket == null)
            return NotFound();

        return Ok(ticket);
    }

    [HttpGet("session/{sessionId:guid}")]
    public async Task<IActionResult> GetTickets(Guid sessionId)
    {
        var tickets = await _ticketService.GetTicketsAsync(sessionId);

        return Ok(tickets);
    }

    [HttpPut("{ticketId:guid}")]
    public async Task<IActionResult> Update(
    Guid ticketId,
    UpdateTicketRequest request)
    {
        var success = await _ticketService.UpdateTicketAsync(User.GetUserId(), ticketId, request);

        if (!success)
            return NotFound();

        return Ok(new { Message = "Ticket updated successfully." });
    }

    [HttpDelete("{ticketId:guid}")]
    public async Task<IActionResult> Delete(Guid ticketId)
    {
        var success = await _ticketService.DeleteTicketAsync(User.GetUserId(), ticketId);

        if (!success)
            return NotFound();

        return Ok(new { Message = "Ticket deleted successfully." });
    }

    /// <summary>
    /// Broadcasts "TicketActivated" to the session's SignalR group after
    /// a successful activation — previously this was REST-only and other
    /// connected clients had no real-time way to learn a new ticket
    /// became active (see backend review, item 9).
    /// </summary>
    [HttpPut("{ticketId:guid}/activate")]
    public async Task<IActionResult> Activate(Guid ticketId)
    {
        var ticket = await _ticketService.ActivateTicketAsync(User.GetUserId(), ticketId);

        if (ticket == null)
            return NotFound();

        var sessionCode = await ResolveSessionCodeAsync(ticket.SessionId);

        if (sessionCode != null)
        {
            await _hubContext.Clients.Group(sessionCode)
                .SendAsync("TicketActivated", ticket);
        }

        return Ok(new { Message = "Ticket activated successfully." });
    }

    private async Task<string?> ResolveSessionCodeAsync(Guid sessionId)
    {
        // GetSessionAsync needs a "current user" for its IsCurrentUserModerator
        // computation, which we don't need here — the caller id is irrelevant
        // for reading the session code, so the acting user's id is reused.
        var session = await _sessionService.GetSessionAsync(sessionId, User.GetUserId());
        return session?.SessionCode;
    }
}
