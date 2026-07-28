using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace AgileEstimation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SessionsController : ControllerBase
{
    private readonly ISessionService _sessionService;

    public SessionsController(ISessionService sessionService)
    {
        _sessionService = sessionService;
    }

    private Guid GetCurrentUserId()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId))
            throw new UnauthorizedAccessException("User Id not found in token.");

        return Guid.Parse(userId);
    }

    [HttpPost]
    public async Task<IActionResult> CreateSession(CreateSessionRequest request)
    {
        var moderatorId = GetCurrentUserId();

        var result = await _sessionService.CreateSessionAsync(
            moderatorId,
            request);

        return Ok(result);
    }

    [HttpPost("join")]
    public async Task<IActionResult> JoinSession(
    JoinSessionRequest request)
    {
        var userId = GetCurrentUserId();

        var success = await _sessionService.JoinSessionAsync(
            userId,
            request);

        if (!success)
        {
            return BadRequest(new
            {
                Message = "Unable to join session."
            });
        }

        return Ok(new
        {
            Message = "Joined successfully."
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSession(Guid id)
    {
        var session = await _sessionService.GetSessionAsync(id);

        if (session == null)
            return NotFound();

        return Ok(session);
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
        var userId = GetCurrentUserId();

        await _sessionService.LeaveSessionAsync(
            id,
            userId);

        return Ok(new
        {
            Message = "Left session successfully."
        });
    }

    [HttpPost("{id:guid}/close")]
    public async Task<IActionResult> Close(Guid id)
    {
        var moderatorId = GetCurrentUserId();

        await _sessionService.CloseSessionAsync(
            id,
            moderatorId);

        return Ok(new
        {
            Message = "Session closed successfully."
        });
    }

}