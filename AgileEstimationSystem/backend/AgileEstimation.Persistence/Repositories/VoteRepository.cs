using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace AgileEstimation.Persistence.Repositories;

public class VoteRepository : IVoteRepository
{
    private readonly ApplicationDbContext _context;

    public VoteRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Vote?> GetVoteAsync(Guid ticketId, Guid userId)
    {
        return await _context.Votes
            .FirstOrDefaultAsync(v =>
                v.TicketId == ticketId &&
                v.UserId == userId);
    }

    public async Task<List<Vote>> GetVotesByTicketAsync(Guid ticketId)
    {
        return await _context.Votes
            .Include(v => v.User)
            .Where(v => v.TicketId == ticketId)
            .ToListAsync();
    }

    public async Task AddAsync(Vote vote)
    {
        await _context.Votes.AddAsync(vote);
    }

    public void Update(Vote vote)
    {
        _context.Votes.Update(vote);
    }

    public async Task RemoveVotesAsync(Guid ticketId)
    {
        var votes = await _context.Votes
            .Where(v => v.TicketId == ticketId)
            .ToListAsync();

        _context.Votes.RemoveRange(votes);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}