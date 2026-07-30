using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Persistence.Context;
using Microsoft.EntityFrameworkCore;

namespace AgileEstimation.Persistence.Repositories;

public class SessionParticipantRepository : ISessionParticipantRepository
{
    private readonly ApplicationDbContext _context;

    public SessionParticipantRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(SessionParticipant participant)
    {
        await _context.SessionParticipants.AddAsync(participant);
    }

    public async Task<bool> ExistsAsync(Guid sessionId, Guid userId)
    {
        return await _context.SessionParticipants
            .AnyAsync(x => x.SessionId == sessionId &&
                           x.UserId == userId);
    }

    public async Task<List<SessionParticipant>> GetParticipantsAsync(Guid sessionId)
    {
        return await _context.SessionParticipants
            .Include(x => x.User)
            .Where(x => x.SessionId == sessionId)
            .ToListAsync();
    }

    public async Task<SessionParticipant?> GetAsync(Guid sessionId, Guid userId)
    {
        return await _context.SessionParticipants
            .FirstOrDefaultAsync(x =>
                x.SessionId == sessionId &&
                x.UserId == userId);
    }

    public void Remove(SessionParticipant participant)
    {
        _context.SessionParticipants.Remove(participant);
    }

    public async Task<SessionParticipant?> GetByConnectionIdAsync(string connectionId)
    {
        return await _context.SessionParticipants
            .Include(p => p.User)
            .FirstOrDefaultAsync(p => p.ConnectionId == connectionId);
    }

    public void Update(SessionParticipant participant)
    {
        _context.SessionParticipants.Update(participant);

    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}