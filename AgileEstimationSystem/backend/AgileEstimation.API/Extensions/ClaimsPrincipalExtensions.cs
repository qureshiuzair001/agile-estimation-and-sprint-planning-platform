using System.Security.Claims;

namespace AgileEstimation.API.Extensions;

/// <summary>
/// Previously "parse the NameIdentifier claim into a Guid" was
/// copy-pasted as a private method in AuthController, SessionsController,
/// and TicketsController, and reimplemented a fourth time as a property
/// in PlanningPokerHub (see Part 1 review, architecture finding #1). This
/// extension works on both — <see cref="ControllerBase.User"/> and
/// <see cref="Microsoft.AspNetCore.SignalR.HubCallerContext.User"/> are
/// both a <see cref="ClaimsPrincipal"/> — so it replaces all four.
/// </summary>
public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userId) || !Guid.TryParse(userId, out var parsed))
            throw new UnauthorizedAccessException("User Id not found in token.");

        return parsed;
    }

    /// <summary>
    /// Returns the account role ("Moderator", "Developer", or "Tester")
    /// from the JWT's role claim. Backs role-segmented vote visibility —
    /// see PlanningPokerHub's role-specific SignalR groups and
    /// VotesController's audience filtering.
    /// </summary>
    public static string GetRole(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }
}
