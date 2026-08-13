using AgileEstimation.Application.DTOs.Voting;
using FluentValidation;

namespace AgileEstimation.Application.Validators;

public class CastVoteRequestValidator : AbstractValidator<CastVoteRequest>
{
    public CastVoteRequestValidator()
    {
        RuleFor(x => x.TicketId)
            .NotEmpty().WithMessage("TicketId is required.");

        RuleFor(x => x.SessionCode)
            .NotEmpty().WithMessage("Session code is required.");

        // -2 and -1 are reserved sentinel values the frontend uses for the
        // "coffee break" and "?" (unknown) cards respectively — see the
        // frontend's src/constants/cardDeck.ts. Everything else must be a
        // realistic estimate; 100 is a generous practical ceiling.
        RuleFor(x => x.EstimateValue)
            .InclusiveBetween(-2, 100)
            .WithMessage("Estimate value is out of the allowed range.");
    }
}
