using AgileEstimation.Application.DTOs.Voting;

namespace AgileEstimation.Application.Interfaces;

public interface IVoteService
{
    Task<bool> CastVoteAsync(
        Guid userId,
        CastVoteRequest request);

    Task<RevealVotesResponse> RevealVotesAsync(
        Guid ticketId);

    Task ResetVotesAsync(Guid ticketId);
}