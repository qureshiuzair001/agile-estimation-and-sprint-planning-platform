using System.Collections.Generic;

namespace AgileEstimation.Application.DTOs.Session;

/// <summary>
/// Previously, OnDisconnectedAsync had no way to know which SignalR group
/// (keyed by SessionCode) to notify after a participant went offline —
/// it only had the raw connection id. This DTO carries the session code
/// back out so the hub can broadcast ParticipantsUpdated correctly.
/// </summary>
public class DisconnectResult
{
    public string SessionCode { get; set; } = string.Empty;

    public List<ParticipantResponse> Participants { get; set; } = new();
}
