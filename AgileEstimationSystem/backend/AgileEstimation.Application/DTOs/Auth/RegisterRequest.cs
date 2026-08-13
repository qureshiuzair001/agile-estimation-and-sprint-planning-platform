namespace AgileEstimation.Application.DTOs.Auth;

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;

    /// <summary>
    /// One of Moderator, Developer, or Tester (see UserRole). This is a
    /// real permission boundary now, not just a label: only Moderator
    /// accounts can create sessions (see SessionsController.CreateSession's
    /// [Authorize(Roles = "Moderator")]), and only a session's moderator —
    /// always a Moderator-role account, since only they can create one —
    /// can reveal votes, reset a round, or finalize an estimate. See
    /// Part 1 review, finding 3.8 for the remaining caveat: this is still
    /// client-trusted self-declared input at registration, same as before.
    /// Validated against the real UserRole enum by RegisterRequestValidator
    /// (see AgileEstimation.Application.Validators) rather than a
    /// hand-written regex, so the two can't drift.
    /// </summary>
    public string Role { get; set; } = "Developer";
}
