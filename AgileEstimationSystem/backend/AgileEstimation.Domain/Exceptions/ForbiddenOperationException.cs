using System;

namespace AgileEstimation.Domain.Exceptions
{
    /// <summary>
    /// Thrown when an authenticated user attempts an action that requires a
    /// specific relationship to the resource (e.g. being the session's
    /// moderator) which they don't have. Distinct from "not authenticated"
    /// (401) — this is always a 403 case.
    /// </summary>
    public sealed class ForbiddenOperationException : Exception
    {
        public ForbiddenOperationException(string message)
        : base(message)
        {
        }
    }
}
