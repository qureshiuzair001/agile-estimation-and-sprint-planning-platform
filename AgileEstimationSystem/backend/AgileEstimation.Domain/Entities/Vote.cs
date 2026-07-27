using System;
using System.Collections.Generic;
using System.Text;

namespace AgileEstimation.Domain.Entities
{
    internal class Vote : BaseEntity
    {
        public Guid TicketId { get; private set; }

        public Ticket Ticket { get; private set; } = null!;

        public Guid UserId { get; private set; }

        public User User { get; private set; } = null!;

        public int EstimateValue { get; private set; }
    }
}
