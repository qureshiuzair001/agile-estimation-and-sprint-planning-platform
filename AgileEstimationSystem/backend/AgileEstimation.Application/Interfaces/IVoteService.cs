using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.DTOs.Voting;

namespace AgileEstimation.Application.Interfaces;

public interface IVoteService
{
    /// <summary>
    /// Now takes `sessionCode` explicitly and verifies the ticket actually
    /// belongs to that session before recording the vote — previously the
    /// client-supplied TicketId and SessionCode were never cross-checked
    /// (see backend review, item 12), so a vote could silently be cast
    /// against a ticket from an unrelated session.
    /// </summary>
    Task<bool> CastVoteAsync(
        Guid userId,
        string sessionCode,
        CastVoteRequest request);

    /// <summary>
    /// Replaces the old unsegmented RevealVotesAsync. A reveal now
    /// produces a different payload per audience: Developers only ever
    /// see Developer + Moderator votes, Testers only Tester + Moderator
    /// votes — they never see each other's individual estimates, only
    /// their own group's (see PlanningPokerHub.RevealVotes, which calls
    /// this once per audience and sends each to its own SignalR group).
    /// `audienceRole` is "Developer" or "Tester"; the Moderator's votes
    /// are always included in both, since their estimate is shared
    /// context for whichever group is looking.
    /// </summary>
    Task<RevealVotesResponse> RevealVotesForAudienceAsync(
        Guid ticketId,
        string audienceRole);

    Task ResetVotesAsync(Guid ticketId);

    /// <summary>
    /// Commits the team's agreed-upon estimate onto the ticket. This is
    /// the step that was previously entirely missing: reveal only ever
    /// *displayed* the votes — nothing called <c>Ticket.CompleteEstimation</c>,
    /// so <c>FinalEstimate</c> stayed null forever and Status never
    /// reached "Estimated" (Part 1 review, finding 3.1). The
    /// moderator-only check lives at the hub layer, same pattern as
    /// RevealVotes/ResetVotes.
    /// </summary>
    Task<TicketResponse> FinalizeEstimateAsync(
        Guid ticketId,
        int finalEstimate);

    /// <summary>
    /// Unsegmented — every vote regardless of role. For the Moderator's
    /// own history view only (they already see everything live, so
    /// there's nothing to hide retroactively). Developers/Testers
    /// requesting history go through GetVotesForTicketAudienceAsync
    /// instead, which applies the same segmentation as a live reveal.
    /// </summary>
    Task<List<VoteResponse>> GetVotesForTicketAsync(Guid ticketId);

    /// <summary>
    /// Same audience segmentation as RevealVotesForAudienceAsync, but for
    /// the ticket-history view rather than a live reveal — a Developer
    /// looking back at a finalized ticket still shouldn't see what
    /// Testers voted, and vice versa.
    /// </summary>
    Task<List<VoteResponse>> GetVotesForTicketAudienceAsync(
        Guid ticketId,
        string audienceRole);
}
