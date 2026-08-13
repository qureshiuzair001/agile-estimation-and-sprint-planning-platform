namespace AgileEstimation.Application.DTOs.Ticket;

public class CreateTicketRequest
{
    public Guid SessionId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;
}
