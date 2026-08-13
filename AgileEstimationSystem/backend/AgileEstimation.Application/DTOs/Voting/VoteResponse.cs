namespace AgileEstimation.Application.DTOs.Voting;

public class VoteResponse
{
    public Guid UserId { get; set; }

    public string Username { get; set; } = string.Empty;

    public int EstimateValue { get; set; }

    /// <summary>
    /// The voter's account role ("Moderator", "Developer", "Tester").
    /// New field backing the frontend's Developer/Tester panel split —
    /// see RevealVotesResponse.Audience for how this is used server-side.
    /// </summary>
    public string Role { get; set; } = string.Empty;
}
