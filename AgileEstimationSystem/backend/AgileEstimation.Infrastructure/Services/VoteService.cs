using AgileEstimation.Application.DTOs.Voting;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;


namespace AgileEstimation.Infrastructure.Services;

public class VoteService : IVoteService
{
    private readonly IVoteRepository _voteRepository;


    public VoteService(IVoteRepository voteRepository)
    {
        _voteRepository = voteRepository;
    }

    public async Task<bool> CastVoteAsync(
    Guid userId,
    CastVoteRequest request)
    {
        var existingVote =
            await _voteRepository.GetVoteAsync(
                request.TicketId,
                userId);



        if (existingVote == null)
        {
            var vote = new Vote(
                request.TicketId,
                userId,
                request.EstimateValue);

            await _voteRepository.AddAsync(vote);
        }
        else
        {
            existingVote.UpdateVote(request.EstimateValue);

            _voteRepository.Update(existingVote);
        }

        await _voteRepository.SaveChangesAsync();

        return true;
    }

    public async Task<RevealVotesResponse> RevealVotesAsync(Guid ticketId)
    {
        var votes = await _voteRepository.GetVotesByTicketAsync(ticketId);

        var response = new RevealVotesResponse
        {
            TicketId = ticketId,
            Votes = votes.Select(MapVote).ToList(),
            AverageEstimate = votes.Any()
                ? votes.Average(v => v.EstimateValue)
                : 0
        };

        return response;
    }

    public async Task ResetVotesAsync(Guid ticketId)
    {
        await _voteRepository.RemoveVotesAsync(ticketId);

        await _voteRepository.SaveChangesAsync();

    }

    private static VoteResponse MapVote(Vote vote)
    {
        return new VoteResponse
        {
            UserId = vote.UserId,
            Username = vote.User.Username,
            EstimateValue = vote.EstimateValue
        };
    }

}