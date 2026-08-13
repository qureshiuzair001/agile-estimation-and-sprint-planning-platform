using AgileEstimation.API.Extensions;
using AgileEstimation.API.Hubs;
using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace AgileEstimation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;
    private readonly IHubContext<PlanningPokerHub> _hubContext;

    public SessionsController(ISessionService sessionService, IHubContext<PlanningPokerHub> hubContext)
    {
        _sessionService = sessionService;
        _hubContext = hubContext;
    }

    /// <summary>
    /// Only Moderator-role accounts can create a session — this is the
    /// foundation the rest of the role model rests on: a session's
    /// ModeratorId is always its creator (see CreateSessionAsync), so
    /// gating creation here guarantees a session's moderator is always a
    /// Moderator-role account, which every other moderator-only check
    /// (reveal, reset, finalize, close) already relies on without needing
    /// its own separate role check.
    /// </summary>
    [Authorize(Roles = "Moderator")]
    [HttpPost]
    public async Task<IActionResult> CreateSession(CreateSessionRequest request)
    {
        var moderatorId = User.GetUserId();

        var result = await _sessionService.CreateSessionAsync(
            moderatorId,
            request);

        return Ok(result);
    }

    /// <summary>
    /// Now returns the full SessionResponse (including the session's id)
    /// instead of just a message — previously a joining client had no way
    /// to navigate into the room it had just joined (see backend review,
    /// the "join returns no id" gap).
    /// </summary>
    [HttpPost("join")]
    public async Task<IActionResult> JoinSession(
    JoinSessionRequest request)
    {
        var userId = User.GetUserId();

        var session = await _sessionService.JoinSessionAsync(
            userId,
            request);

        if (session == null)
        {
            return BadRequest(new
            {
                Message = "Unable to join session. Check the code and try again."
            });
        }

        return Ok(session);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var session = await _sessionService.GetSessionAsync(id, User.GetUserId());

        if (session == null)
            return NotFound();

        return Ok(session);
    }

    /// <summary>
    /// New endpoint: resolves a session's id/details from its code, so a
    /// client that only has a code (e.g. typed in by the user, or
    /// persisted across a refresh) can look up the session without
    /// already knowing its id (see backend review).
    /// </summary>
    [HttpGet("by-code/{sessionCode}")]
    public async Task<IActionResult> GetSessionByCode(string sessionCode)
    {
        var session = await _sessionService.GetSessionByCodeAsync(sessionCode, User.GetUserId());

        if (session == null)
            return NotFound();

        return Ok(session);
    }

    /// <summary>
    /// New endpoint: lists sessions the current user created or joined.
    /// Previously there was no way to list "my sessions" at all (see
    /// backend review, item 16); the frontend was tracking this in
    /// localStorage as a workaround, which only worked per-browser.
    /// </summary>
    [HttpGet("mine")]
    public async Task<IActionResult> GetMySessions()
    {
        var sessions = await _sessionService.GetSessionsForUserAsync(User.GetUserId());

        return Ok(sessions);
    }

    [HttpGet("{id:guid}/participants")]
    public async Task<IActionResult> GetParticipants(Guid id)
    {
        var participants =
            await _sessionService.GetParticipantsAsync(id);

        return Ok(participants);
    }

    [HttpPost("{id:guid}/leave")]
    public async Task<IActionResult> Leave(Guid id)
    {
        var userId = User.GetUserId();

        await _sessionService.LeaveSessionAsync(
            id,
            userId);

        return Ok(new
        {
            Message = "Left session successfully."
        });
    }

    /// <summary>
    /// Now broadcasts "SessionClosed" to the session's SignalR group after
    /// a successful close (see Part 1 review, finding 3.7 — previously
    /// only the moderator's own REST call knew the session had closed;
    /// everyone else connected to the room found out only on their next
    /// REST call or page refresh). CloseSessionAsync returns the closed
    /// session's code (or null if the close was rejected) so this
    /// controller has something to broadcast to without a second lookup.
    /// </summary>
    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var moderatorId = User.GetUserId();

        var sessionCode = await _sessionService.CloseSessionAsync(
            id,
            moderatorId);

        if (sessionCode == null)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new
            {
                Message = "Only the session's moderator can close it."
            });
        }

        await _hubContext.Clients.Group(sessionCode).SendAsync("SessionClosed", new { SessionId = id });

        return Ok(new
        {
            Message = "Session closed successfully."
        });
    }
}
