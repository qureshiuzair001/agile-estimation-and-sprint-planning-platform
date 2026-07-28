using AgileEstimation.Application.DTOs.Ticket;
using AgileEstimation.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgileEstimation.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTicketRequest request)
    {
        var ticket = await _ticketService.CreateTicketAsync(request);

        return Ok(ticket);
    }

    [HttpGet("session/{sessionId:guid}")]
    public async Task<IActionResult> GetTickets(Guid sessionId)
    {
        var tickets = await _ticketService.GetTicketsAsync(sessionId);

        return Ok(tickets);
    }

    [HttpPut("{ticketId:guid}")]
    public async Task<IActionResult> Update(
    Guid ticketId,
    UpdateTicketRequest request)
    {
        var success =
            await _ticketService.UpdateTicketAsync(
                ticketId,
                request);

        if (!success)
            return NotFound();

        return Ok(new
        {
            Message = "Ticket updated successfully."
        });
    }

    [HttpDelete("{ticketId:guid}")]
    public async Task<IActionResult> Delete(Guid ticketId)
    {
        var success =
            await _ticketService.DeleteTicketAsync(ticketId);

        if (!success)
            return NotFound();

        return Ok(new
        {
            Message = "Ticket deleted successfully."
        });
    }

    [HttpPut("{ticketId:guid}/activate")]
    public async Task<IActionResult> Activate(Guid ticketId)
    {
        var success =
            await _ticketService.ActivateTicketAsync(ticketId);

        if (!success)
            return NotFound();

        return Ok(new
        {
            Message = "Ticket activated successfully."
        });
    }

}