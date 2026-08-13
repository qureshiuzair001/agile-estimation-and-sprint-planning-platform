using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.DTOs.Voting;
using AgileEstimation.Application.Interfaces;
using AgileEstimation.Domain.Entities;
using AgileEstimation.Domain.Enums;
using AgileEstimation.Domain.Exceptions;
using AutoMapper;
using FluentValidation;

namespace AgileEstimation.Infrastructure.Services;

public class VoteService : IVoteService
{
    private readonly IVoteRepository _voteRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IValidator<CastVoteRequest> _castVoteValidator;
    private readonly IMapper _mapper;

    public VoteService(
        IVoteRepository voteRepository,
        ITicketRepository ticketRepository,
        ISessionRepository sessionRepository,
        IValidator<CastVoteRequest> castVoteValidator,
        IMapper mapper)
    {
        _voteRepository = voteRepository;
        _ticketRepository = ticketRepository;
        _sessionRepository = sessionRepository;
        _castVoteValidator = castVoteValidator;
        _mapper = mapper;
    }

    public async Task<bool> CastVoteAsync(
    Guid userId,
    string sessionCode,
    CastVoteRequest request)
    {
        // MVC controllers validate FluentValidation validators
        // automatically via FluentValidationActionFilter (see the API
        // project); SignalR hub methods do NOT run that pipeline at all,
        // so CastVoteRequestValidator's rules would otherwise be silently
        // skipped (see backend review, item 10/11) even though they're
        // registered in DI. Running the same validator explicitly here
        // closes that gap — same validator, same rules, just invoked
        // manually for the one entry point MVC's filter can't reach.
        var validationResult = await _castVoteValidator.ValidateAsync(request);

        if (!validationResult.IsValid)
        {
            var message = string.Join(" ", validationResult.Errors.Select(e => e.ErrorMessage));
            throw new InvalidVoteException(message);
        }

        var session = await _sessionRepository.GetByCodeAsync(sessionCode);

        if (session == null)
            throw new InvalidVoteException("Session not found for the given session code.");

        var ticket = await _ticketRepository.GetByIdAsync(request.TicketId);

        if (ticket == null)
            throw new InvalidVoteException("Ticket not found.");

        // The consistency check the client-supplied fields never had
        // before (see backend review, item 12).
        if (ticket.SessionId != session.Id)
            throw new InvalidVoteException("This ticket does not belong to the given session.");

        var existingVote =
            await _voteRepository.GetVoteAsync(
                request.TicketId,
                userId);

        if (existingVote == null)
        {
            var vote = new Vote(
                request.TicketId,
                userId,
                request.EstimateValue);

            await _voteRepository.AddAsync(vote);
        }
        else
        {
            existingVote.UpdateVote(request.EstimateValue);

            _voteRepository.Update(existingVote);
        }

        await _voteRepository.SaveChangesAsync();

        return true;
    }

    public async Task<RevealVotesResponse> RevealVotesForAudienceAsync(Guid ticketId, string audienceRole)
    {
        var votes = await _voteRepository.GetVotesByTicketAsync(ticketId);
        var audienceVotes = FilterForAudience(votes, audienceRole);

        return BuildRevealResponse(ticketId, audienceRole, audienceVotes);
    }

    public async Task ResetVotesAsync(Guid ticketId)
    {
        await _voteRepository.RemoveVotesAsync(ticketId);

        await _voteRepository.SaveChangesAsync();

    }

    /// <summary>
    /// Completes the reveal→finalize workflow: previously nothing in the
    /// codebase ever called <c>Ticket.CompleteEstimation</c>, so a ticket's
    /// FinalEstimate stayed null and Status never reached "Estimated" no
    /// matter how many times votes were revealed (Part 1 review, finding
    /// 3.1). This is the fix — it's deliberately a plain int rather than a
    /// full DTO with its own [Range] attribute, since the caller (the hub)
    /// has no MVC validation pipeline to run it through anyway; the check
    /// below is enforced explicitly here instead, the same pattern
    /// CastVoteAsync already uses for the same reason.
    /// </summary>
    public async Task<TicketResponse> FinalizeEstimateAsync(Guid ticketId, int finalEstimate)
    {
        if (finalEstimate < 0 || finalEstimate > 100)
        {
            throw new InvalidVoteException(
                "Final estimate must be a realistic, non-negative value.");
        }

        var ticket = await _ticketRepository.GetByIdAsync(ticketId);

        if (ticket == null)
            throw new InvalidVoteException("Ticket not found.");

        ticket.CompleteEstimation(finalEstimate);

        _ticketRepository.Update(ticket);

        await _ticketRepository.SaveChangesAsync();

        return _mapper.Map<TicketResponse>(ticket);
    }

    public async Task<List<VoteResponse>> GetVotesForTicketAsync(Guid ticketId)
    {
        var votes = await _voteRepository.GetVotesByTicketAsync(ticketId);
        return _mapper.Map<List<VoteResponse>>(votes);
    }

    public async Task<List<VoteResponse>> GetVotesForTicketAudienceAsync(Guid ticketId, string audienceRole)
    {
        var votes = await _voteRepository.GetVotesByTicketAsync(ticketId);
        var audienceVotes = FilterForAudience(votes, audienceRole);

        return _mapper.Map<List<VoteResponse>>(audienceVotes);
    }

    /// <summary>
    /// The one place role-segmentation is actually decided: a Developer
    /// or Tester audience always includes the Moderator's own vote (their
    /// estimate is shared context for either group) plus votes cast by
    /// that same role — never the other non-Moderator role. Shared by
    /// both the live-reveal and history code paths so the two can't drift
    /// out of sync with each other.
    /// </summary>
    private static List<Vote> FilterForAudience(List<Vote> votes, string audienceRole)
    {
        return votes
            .Where(v => v.User.Role == UserRole.Moderator || v.User.Role.ToString() == audienceRole)
            .ToList();
    }

    private RevealVotesResponse BuildRevealResponse(Guid ticketId, string audience, List<Vote> votes)
    {
        // Previously this averaged every vote including the frontend's
        // "?" (-1) and "coffee break" (-2) sentinel values as if they
        // were real estimates, silently skewing the result (see Part 1
        // review, finding 3.9) — still excluded here for the same reason.
        var numericVotes = votes.Where(v => v.EstimateValue >= 0).ToList();

        return new RevealVotesResponse
        {
            TicketId = ticketId,
            Audience = audience,
            Votes = _mapper.Map<List<VoteResponse>>(votes),
            AverageEstimate = numericVotes.Count > 0
                ? numericVotes.Average(v => v.EstimateValue)
                : 0
        };
    }
}
