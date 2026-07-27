using AgileEstimation.Domain.Common;
using AgileEstimation.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Entities
{
    public class Session : BaseEntity
    {
        public string SessionCode { get; private set; } = string.Empty;

        public string Title { get; private set; } = string.Empty;

        public Guid ModeratorId { get; private set; }

        public SessionStatus Status { get; private set; }

        public User Moderator { get; private set; } = null!;

        public ICollection<SessionParticipant> Participants { get; private set; }
            = new List<SessionParticipant>();

        public ICollection<Ticket> Tickets { get; private set; }
            = new List<Ticket>();

        public void StartVoting()
        {
            if (Status != SessionStatus.Waiting)
                throw new InvalidOperationException(
                    "Only waiting sessions can start.");

            Status = SessionStatus.Active;

            MarkUpdated();
        }

        public void RevealVotes()
        {
            Status = SessionStatus.Revealed;

            MarkUpdated();
        }

        public void Close()
        {
            Status = SessionStatus.Closed;

            MarkUpdated();
        }
    }
}
