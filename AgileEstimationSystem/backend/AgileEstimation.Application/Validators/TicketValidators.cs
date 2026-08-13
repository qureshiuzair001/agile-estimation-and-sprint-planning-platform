using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Domain.Constants;
using FluentValidation;

namespace AgileEstimation.Application.Validators;

public class CreateTicketRequestValidator : AbstractValidator<CreateTicketRequest>
{
    public CreateTicketRequestValidator()
    {
        RuleFor(x => x.SessionId)
            .NotEmpty().WithMessage("SessionId is required.");

        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(SessionConstants.MaxTitleLength)
            .WithMessage($"Title must be under {SessionConstants.MaxTitleLength} characters.");

        RuleFor(x => x.Description)
            .MaximumLength(SessionConstants.MaxDescriptionLength)
            .WithMessage($"Description must be under {SessionConstants.MaxDescriptionLength} characters.");
    }
}

public class UpdateTicketRequestValidator : AbstractValidator<UpdateTicketRequest>
{
    public UpdateTicketRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(SessionConstants.MaxTitleLength)
            .WithMessage($"Title must be under {SessionConstants.MaxTitleLength} characters.");

        RuleFor(x => x.Description)
            .MaximumLength(SessionConstants.MaxDescriptionLength)
            .WithMessage($"Description must be under {SessionConstants.MaxDescriptionLength} characters.");
    }
}
