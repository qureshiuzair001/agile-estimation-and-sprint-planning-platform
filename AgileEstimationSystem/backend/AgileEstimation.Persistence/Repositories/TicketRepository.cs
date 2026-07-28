using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace AgileEstimation.Persistence.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly ApplicationDbContext _context;

    public TicketRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Ticket ticket)
    {
        await _context.Tickets.AddAsync(ticket);
    }

    public async Task<Ticket?> GetByIdAsync(Guid id)
    {
        return await _context.Tickets
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<List<Ticket>> GetBySessionIdAsync(Guid sessionId)
    {
        return await _context.Tickets
            .Where(t => t.SessionId == sessionId)
            .OrderBy(t => t.Order)
            .ToListAsync();
    }

    public void Update(Ticket ticket)
    {
        _context.Tickets.Update(ticket);
    }

    public void Remove(Ticket ticket)
    {
        _context.Tickets.Remove(ticket);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}