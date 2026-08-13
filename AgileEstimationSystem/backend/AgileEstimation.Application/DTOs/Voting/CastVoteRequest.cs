namespace AgileEstimation.Application.DTOs.Voting;

public class CastVoteRequest
{
    public Guid TicketId { get; set; }

    public string SessionCode { get; set; } = string.Empty;

    public int EstimateValue { get; set; }
}
