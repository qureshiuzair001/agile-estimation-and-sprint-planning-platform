using AgileEstimation.Application.DTOs.Session;
using AgileEstimation.Domain.Constants;
using FluentValidation;

namespace AgileEstimation.Application.Validators;

public class CreateSessionRequestValidator : AbstractValidator<CreateSessionRequest>
{
    public CreateSessionRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(SessionConstants.MaxTitleLength)
            .WithMessage($"Title must be under {SessionConstants.MaxTitleLength} characters.");
    }
}

public class JoinSessionRequestValidator : AbstractValidator<JoinSessionRequest>
{
    public JoinSessionRequestValidator()
    {
        RuleFor(x => x.SessionCode)
            .NotEmpty().WithMessage("Session code is required.")
            .Length(SessionConstants.SessionCodeLength)
            .WithMessage($"Session codes are exactly {SessionConstants.SessionCodeLength} characters.");
    }
}
