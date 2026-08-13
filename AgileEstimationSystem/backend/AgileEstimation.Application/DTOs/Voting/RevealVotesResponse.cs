namespace AgileEstimation.Application.DTOs.Voting;

public class RevealVotesResponse
{
    public Guid TicketId { get; set; }

    /// <summary>
    /// Which audience this payload was built for — "Developer" or
    /// "Tester". A reveal now produces two separate payloads (see
    /// VoteService.RevealVotesForAudienceAsync): Developers only ever
    /// receive the "Developer" one (their own votes + the Moderator's),
    /// Testers only the "Tester" one, and the Moderator receives both —
    /// this field is what lets a client tell the two apart when it gets
    /// (or, for the Moderator, always gets) more than one.
    /// </summary>
    public string Audience { get; set; } = string.Empty;

    public List<VoteResponse> Votes { get; set; } = new();

    public double AverageEstimate { get; set; }
}
