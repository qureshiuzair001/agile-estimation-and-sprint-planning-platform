using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace AgileEstimation.Persistence.Repositories;

public class SessionRepository : ISessionRepository
{
    private readonly ApplicationDbContext _context;

    public SessionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Session session)
    {
        await _context.Sessions.AddAsync(session);
    }

    public async Task<Session?> GetByIdAsync(Guid id)
    {
        return await _context.Sessions
            .Include(s => s.Participants)
            .Include(s => s.Tickets)
            .FirstOrDefaultAsync(s => s.Id == id);
    }

    public async Task<Session?> GetByCodeAsync(string sessionCode)
    {
        return await _context.Sessions
            .FirstOrDefaultAsync(s => s.SessionCode == sessionCode);
    }

    public async Task<string?> GetSessionCodeAsync(Guid sessionId)
    {
        return await _context.Sessions
            .Where(s => s.Id == sessionId)
            .Select(s => s.SessionCode)
            .FirstOrDefaultAsync();
    }

    public async Task<List<Session>> GetSessionsForUserAsync(Guid userId)
    {
        return await _context.Sessions
            .Where(s => s.ModeratorId == userId ||
                        s.Participants.Any(p => p.UserId == userId))
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();
    }

    public void Update(Session session)
    {
        _context.Sessions.Update(session);
       
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}