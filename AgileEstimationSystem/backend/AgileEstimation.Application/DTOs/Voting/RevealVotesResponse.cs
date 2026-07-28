namespace AgileEstimation.Application.DTOs.Voting;

public class RevealVotesResponse
{
    public Guid TicketId { get; set; }

    public List<VoteResponse> Votes { get; set; } = new();

    public double AverageEstimate { get; set; }
}