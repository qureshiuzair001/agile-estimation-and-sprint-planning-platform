using AgileEstimation.Domain.Common;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Entities
{
    public class SessionParticipant : BaseEntity
    {
        public Guid SessionId { get; private set; }

        public Session Session { get; private set; } = null!;

        public Guid UserId { get; private set; }

        public User User { get; private set; } = null!;

        public string? ConnectionId { get; private set; }

        public bool IsOnline { get; private set; }

        public DateTime JoinedAt { get; private set; } = DateTime.UtcNow;
    }
}
