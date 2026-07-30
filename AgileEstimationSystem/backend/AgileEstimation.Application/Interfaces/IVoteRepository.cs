using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface IVoteRepository
{
    Task<Vote?> GetVoteAsync(
        Guid ticketId,
        Guid userId);

    Task<List<Vote>> GetVotesByTicketAsync(
        Guid ticketId);

    Task AddAsync(Vote vote);

    void Update(Vote vote);

    Task RemoveVotesAsync(Guid ticketId);

    Task SaveChangesAsync();
}