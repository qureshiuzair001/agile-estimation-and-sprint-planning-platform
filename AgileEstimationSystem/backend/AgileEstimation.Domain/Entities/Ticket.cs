using AgileEstimation.Domain.Common;
using AgileEstimation.Domain.Enums;

namespace AgileEstimation.Domain.Entities;

public class Ticket : BaseEntity
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

    // Required by EF Core
    private Ticket()
    {
    }

    public Ticket(
        Guid sessionId,
        string title,
        string description,
        int order)
    {
        SessionId = sessionId;
        Title = title;
        Description = description;
        Order = order;
        Status = TicketStatus.Pending;
    }

    public void Update(string title, string description)
    {
        Title = title;
        Description = description;

        MarkUpdated();
    }

    public void Activate()
    {
        Status = TicketStatus.Voting;

        MarkUpdated();
    }

    public void CompleteEstimation(int estimate)
    {
        FinalEstimate = estimate;
        Status = TicketStatus.Estimated;

        MarkUpdated();
    }
}