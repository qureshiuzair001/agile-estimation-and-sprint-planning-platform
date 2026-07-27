using AgileEstimation.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Entities
{
    internal class User
    {
        public string Username { get; private set; } = string.Empty;
        
        public string Email { get; private set; } = string.Empty;
        
        public string PasswordHash { get; private set; } = string.Empty;

        public UserRole Role { get; private set; }

        public bool IsActive { get; private set; } = true;

        public ICollection<Session> CreatedSessions { get; private set; }
            = new List<Session>();

        public ICollection<SessionParticipant> JoinedSessions { get; private set; }
            = new List<SessionParticipant>();

        public ICollection<Vote> Votes { get; private set; }
            = new List<Vote>();
    }


}
}
