using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;

namespace AgileEstimation.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;

    public TicketService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<TicketResponse> CreateTicketAsync(CreateTicketRequest request)
    {
        var existingTickets =
            await _ticketRepository.GetBySessionIdAsync(request.SessionId);

        var order = existingTickets.Count + 1;

        var ticket = new Ticket(
            request.SessionId,
            request.Title,
            request.Description,
            order);

        await _ticketRepository.AddAsync(ticket);

        await _ticketRepository.SaveChangesAsync();

        return new TicketResponse
        {
            Id = ticket.Id,
            SessionId = ticket.SessionId,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status.ToString(),
            Order = ticket.Order,
            FinalEstimate = ticket.FinalEstimate
        };
    }

    public async Task<List<TicketResponse>> GetTicketsAsync(Guid sessionId)
    {
        var tickets =
            await _ticketRepository.GetBySessionIdAsync(sessionId);

        return tickets.Select(ticket => new TicketResponse
        {
            Id = ticket.Id,
            SessionId = ticket.SessionId,
            Title = ticket.Title,
            Description = ticket.Description,
            Status = ticket.Status.ToString(),
            Order = ticket.Order,
            FinalEstimate = ticket.FinalEstimate
        }).ToList();
    }

    public async Task<bool> UpdateTicketAsync(
    Guid ticketId,
    UpdateTicketRequest request)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return false;

        ticket.Update(
            request.Title,
            request.Description);

        _ticketRepository.Update(ticket);

        await _ticketRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteTicketAsync(Guid ticketId)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return false;

        _ticketRepository.Remove(ticket);

        await _ticketRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ActivateTicketAsync(Guid ticketId)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return false;

        ticket.Activate();

        _ticketRepository.Update(ticket);

        await _ticketRepository.SaveChangesAsync();

        return true;
    }

}