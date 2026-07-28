using AgileEstimation.Domain.Common;

namespace AgileEstimation.Domain.Entities;

public class Vote : BaseEntity
{
    public Guid TicketId { get; private set; }

    public Ticket Ticket { get; private set; } = null!;

    public Guid UserId { get; private set; }

    public User User { get; private set; } = null!;

    public int EstimateValue { get; private set; }

    // Required by EF Core
    private Vote()
    {
    }

    public Vote(Guid ticketId, Guid userId, int estimateValue)
    {
        TicketId = ticketId;
        UserId = userId;
        EstimateValue = estimateValue;
    }

    public void UpdateVote(int estimateValue)
    {
        EstimateValue = estimateValue;
        MarkUpdated();
    }
}