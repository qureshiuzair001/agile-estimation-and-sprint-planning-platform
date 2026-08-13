using AgileEstimation.API.Extensions;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgileEstimation.API.Controllers;

/// <summary>
/// Backs the frontend's ticket history / vote breakdown view. Votes for
/// a ticket are never deleted once cast (ResetVotesAsync is the only
/// thing that deletes them, and that's only called for an explicit
/// re-vote), so this doubles as a permanent record of how a team arrived
/// at each ticket's final estimate.
/// </summary>
[ApiController]
[Route("api/tickets")]
[Authorize]
public class VotesController : ControllerBase
{
    private readonly IVoteService _voteService;

    public VotesController(IVoteService voteService)
    {
        _voteService = voteService;
    }

    /// <summary>
    /// Applies the same audience segmentation as a live reveal (see
    /// PlanningPokerHub.RevealVotes): a Moderator sees every vote, but a
    /// Developer or Tester looking back at history only ever sees their
    /// own role's votes plus the Moderator's — never the other group's.
    /// </summary>
    [HttpGet("{ticketId:guid}/votes")]
    public async Task<IActionResult> GetVotesForTicket(Guid ticketId)
    {
        var role = User.GetRole();

        var votes = role == "Moderator"
            ? await _voteService.GetVotesForTicketAsync(ticketId)
            : await _voteService.GetVotesForTicketAudienceAsync(ticketId, role);

        return Ok(votes);
    }
}
