namespace AgileEstimation.Application.DTOs.Ticket;

public class TicketResponse
{
    public Guid Id { get; set; }

    public Guid SessionId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string Status { get; set; } = string.Empty;

    public int Order { get; set; }

    public int? FinalEstimate { get; set; }
}