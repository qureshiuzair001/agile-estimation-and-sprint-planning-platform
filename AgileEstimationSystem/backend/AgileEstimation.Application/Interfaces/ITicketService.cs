using AgileEstimation.Application.DTOs.Ticket;

namespace AgileEstimation.Application.Interfaces;

public interface ITicketService
{
    /// <summary>
    /// All four methods below now take a `requesterId` and will throw
    /// AgileEstimation.Domain.Exceptions.ForbiddenOperationException if the
    /// requester isn't the session's moderator. Previously there was no
    /// ownership check at all — any authenticated user could manage any
    /// session's tickets (see backend review, item 4).
    /// </summary>
    Task<TicketResponse> CreateTicketAsync(Guid requesterId, CreateTicketRequest request);

    Task<TicketResponse?> GetTicketAsync(Guid ticketId);

    Task<List<TicketResponse>> GetTicketsAsync(Guid sessionId);

    Task<bool> UpdateTicketAsync(Guid requesterId, Guid ticketId, UpdateTicketRequest request);

    Task<bool> DeleteTicketAsync(Guid requesterId, Guid ticketId);

    /// <summary>
    /// Returns the activated ticket (so the caller has its SessionId to
    /// resolve a session code for broadcasting), or null if not found.
    /// </summary>
    Task<TicketResponse?> ActivateTicketAsync(Guid requesterId, Guid ticketId);
}
