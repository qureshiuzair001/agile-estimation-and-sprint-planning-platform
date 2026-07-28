using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Application.Interfaces;

public interface ITicketRepository
{
    Task AddAsync(Ticket ticket);

    Task<Ticket?> GetByIdAsync(Guid id);

    Task<List<Ticket>> GetBySessionIdAsync(Guid sessionId);

    void Update(Ticket ticket);

    void Remove(Ticket ticket);

    Task SaveChangesAsync();
}