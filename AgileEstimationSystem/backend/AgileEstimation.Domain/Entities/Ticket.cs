using AgileEstimation.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Entities
{
    internal class Ticket : BaseEntity
    {
        public Guid SessionId { get; private set; }

        public Session Session { get; private set; } = null!;

        public string Title { get; private set; } = string.Empty;

        public string Description { get; private set; } = string.Empty;

        public int? FinalEstimate { get; private set; }

        public TicketStatus Status { get; private set; }

        public int Order { get; private set; }

        public ICollection<Vote> Votes { get; private set; }
            = new List<Vote>();
    }
}
