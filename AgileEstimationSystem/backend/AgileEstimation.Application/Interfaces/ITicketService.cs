using AgileEstimation.Application.DTOs.Ticket;

namespace AgileEstimation.Application.Interfaces;

public interface ITicketService
{
    Task<TicketResponse> CreateTicketAsync(CreateTicketRequest request);

    Task<List<TicketResponse>> GetTicketsAsync(Guid sessionId);

    Task<bool> UpdateTicketAsync(Guid ticketId, UpdateTicketRequest request);

    Task<bool> DeleteTicketAsync(Guid ticketId);

    Task<bool> ActivateTicketAsync(Guid ticketId);
}