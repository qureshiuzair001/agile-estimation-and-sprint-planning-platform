using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;
using AgileEstimation.Domain.Exceptions;
using AutoMapper;

namespace AgileEstimation.Infrastructure.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IMapper _mapper;

    public TicketService(
        ITicketRepository ticketRepository,
        ISessionRepository sessionRepository,
        IMapper mapper)
    {
        _ticketRepository = ticketRepository;
        _sessionRepository = sessionRepository;
        _mapper = mapper;
    }

    public async Task<TicketResponse> CreateTicketAsync(Guid requesterId, CreateTicketRequest request)
    {
        await EnsureIsModeratorAsync(request.SessionId, requesterId);

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

        return _mapper.Map<TicketResponse>(ticket);
    }

    public async Task<TicketResponse?> GetTicketAsync(Guid ticketId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId);

        return ticket == null ? null : _mapper.Map<TicketResponse>(ticket);
    }

    public async Task<List<TicketResponse>> GetTicketsAsync(Guid sessionId)
    {
        var tickets =
            await _ticketRepository.GetBySessionIdAsync(sessionId);

        return _mapper.Map<List<TicketResponse>>(tickets);
    }

    public async Task<bool> UpdateTicketAsync(
    Guid requesterId,
    Guid ticketId,
    UpdateTicketRequest request)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return false;

        await EnsureIsModeratorAsync(ticket.SessionId, requesterId);

        ticket.Update(
            request.Title,
            request.Description);

        _ticketRepository.Update(ticket);

        await _ticketRepository.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteTicketAsync(Guid requesterId, Guid ticketId)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return false;

        await EnsureIsModeratorAsync(ticket.SessionId, requesterId);

        _ticketRepository.Remove(ticket);

        await _ticketRepository.SaveChangesAsync();

        return true;
    }

    public async Task<TicketResponse?> ActivateTicketAsync(Guid requesterId, Guid ticketId)
    {
        var ticket =
            await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            return null;

        await EnsureIsModeratorAsync(ticket.SessionId, requesterId);

        ticket.Activate();

        _ticketRepository.Update(ticket);

        // Fix for "Session.Status never transitions past Waiting" (see
        // backend review, item 5): move the session into Active the first
        // time any ticket is activated. NOTE: this is a partial fix, not a
        // full redesign — Session.Status is inherently session-wide while
        // voting really happens per-ticket, so it still won't reflect
        // "which ticket is being voted on" once a session has several
        // tickets. The frontend correctly keys off Ticket.Status instead
        // for that reason; this change just stops Session.Status from
        // being permanently stuck at "Waiting".
        var session = await _sessionRepository.GetByIdAsync(ticket.SessionId);

        if (session != null && session.Status == SessionStatus.Waiting)
        {
            session.StartVoting();
            _sessionRepository.Update(session);
        }

        await _ticketRepository.SaveChangesAsync();

        return _mapper.Map<TicketResponse>(ticket);
    }

    private async Task EnsureIsModeratorAsync(Guid sessionId, Guid requesterId)
    {
        var session = await _sessionRepository.GetByIdAsync(sessionId);

        if (session == null)
            throw new ForbiddenOperationException("Session not found.");

        if (session.ModeratorId != requesterId)
            throw new ForbiddenOperationException(
                "Only the session's moderator can manage its tickets.");
    }

}
