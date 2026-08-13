using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace AgileEstimation.API.Filters;

/// <summary>
/// Runs any registered FluentValidation IValidator&lt;T&gt; against matching
/// action arguments before the action executes, short-circuiting with a
/// 400 ValidationProblemDetails on failure — this is what makes the
/// FluentValidation package (referenced in every .csproj since the
/// project's tech-stack doc calls for it, but never actually wired up
/// until now — see Part 1 review, finding 3.4) actually run.
///
/// This is a plain <see cref="IAsyncActionFilter"/> rather than the
/// official FluentValidation.AspNetCore auto-validation integration,
/// deliberately: that package's exact extension-method surface has
/// changed across FluentValidation's major versions, and without a live
/// `dotnet build` available in the environment I wrote this in, I can't
/// verify which variant matches the FluentValidation 12.x already
/// referenced in this solution. This filter only depends on the stable,
/// long-standing `IValidator&lt;T&gt;` / `AddValidatorsFromAssemblyContaining`
/// APIs from the core FluentValidation package, so it can't silently stop
/// compiling on a minor package upgrade. If you'd prefer the official
/// auto-validation package instead, swap this filter for it — the
/// validators themselves don't change either way.
/// </summary>
public class FluentValidationActionFilter : IAsyncActionFilter
{
    private readonly IServiceProvider _serviceProvider;

    public FluentValidationActionFilter(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values)
        {
            if (argument is null)
                continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(argument.GetType());

            if (_serviceProvider.GetService(validatorType) is not IValidator validator)
                continue;

            var validationContext = new ValidationContext<object>(argument);
            var result = await validator.ValidateAsync(validationContext);

            if (!result.IsValid)
            {
                var problemDetails = new ValidationProblemDetails(result.ToDictionary())
                {
                    Status = StatusCodes.Status400BadRequest,
                    Title = "One or more validation errors occurred."
                };

                // ValidationProblemDetails.Errors already carries the
                // field-by-field detail (for a Part 2 frontend form to
                // render inline later); this "message" extension is a
                // stopgap so the existing toast-based error handling
                // (see axiosClient.ts's getApiErrorMessage, which checks
                // data.message before data.title) shows something more
                // specific than the generic title in the meantime.
                problemDetails.Extensions["message"] =
                    string.Join(" ", result.Errors.Select(e => e.ErrorMessage));

                context.Result = new BadRequestObjectResult(problemDetails);
                return;
            }
        }

        await next();
    }
}
