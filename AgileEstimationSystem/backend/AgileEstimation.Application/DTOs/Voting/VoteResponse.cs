namespace AgileEstimation.Application.DTOs.Voting;

public class VoteResponse
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int EstimateValue { get; set; }
}