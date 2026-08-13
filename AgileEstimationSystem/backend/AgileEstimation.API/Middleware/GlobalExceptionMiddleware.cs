using AgileEstimation.Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace AgileEstimation.API.Middleware;

/// <summary>
/// Central place for turning an unhandled exception into a consistent
/// ProblemDetails response instead of leaking a stack trace
/// (Development) or a bare, uninformative 500 (Production) — see Part 1
/// review, finding 3.3. Registered first in the pipeline (see
/// Program.cs) so it wraps everything downstream, including
/// authentication/authorization.
///
/// Only exceptions from the REST pipeline pass through here — SignalR
/// hub methods have their own, separate error-surfacing mechanism
/// (HubException, already used throughout PlanningPokerHub) since
/// middleware doesn't wrap hub invocations the same way.
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            await HandleExceptionAsync(context, exception);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title) = MapException(exception);

        var logLevel = statusCode >= 500 ? LogLevel.Error : LogLevel.Warning;

        _logger.Log(
            logLevel,
            exception,
            "Unhandled exception on {Method} {Path} → {StatusCode} (TraceId: {TraceId})",
            context.Request.Method,
            context.Request.Path,
            statusCode,
            context.TraceIdentifier);

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Instance = context.Request.Path,
        };

        problemDetails.Extensions["traceId"] = context.TraceIdentifier;

        // Stack traces are genuinely useful locally and genuinely an
        // information-disclosure risk in Production — this is the one
        // place in the app that distinguishes the two.
        if (_environment.IsDevelopment())
        {
            problemDetails.Detail = exception.ToString();
        }

        context.Response.ContentType = "application/problem+json";
        context.Response.StatusCode = statusCode;

        await context.Response.WriteAsync(JsonSerializer.Serialize(problemDetails));
    }

    private static (int StatusCode, string Title) MapException(Exception exception) => exception switch
    {
        ForbiddenOperationException => (StatusCodes.Status403Forbidden, "You don't have permission to do that."),
        InvalidVoteException => (StatusCodes.Status400BadRequest, exception.Message),
        UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Authentication is required."),
        KeyNotFoundException => (StatusCodes.Status404NotFound, "The requested resource was not found."),
        _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred. Please try again.")
    };
}

public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandling(this IApplicationBuilder app)
        => app.UseMiddleware<GlobalExceptionMiddleware>();
}
