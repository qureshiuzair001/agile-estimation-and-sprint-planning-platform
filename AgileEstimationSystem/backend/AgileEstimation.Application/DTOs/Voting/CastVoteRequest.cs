namespace AgileEstimation.Application.DTOs.Voting;

public class CastVoteRequest
{
    public Guid TicketId { get; set; }

    public int EstimateValue { get; set; }
}