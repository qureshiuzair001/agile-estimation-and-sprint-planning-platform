import * as signalR from "@microsoft/signalr";
import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import type { ParticipantResponse } from "@/types/session.types";
import type { TicketResponse } from "@/types/ticket.types";
import type {
  CastVoteRequest,
  RevealVotesResponse,
  VoteSubmittedEvent,
} from "@/types/voting.types";

/**
 * Every server -> client event name the hub sends, in one place, so a
 * typo in an event name is a compile error instead of a silent no-op.
 * These strings must match PlanningPokerHub's `Clients.Group(...).SendAsync(...)` calls exactly.
 */
const HUB_EVENTS = {
  PARTICIPANTS_UPDATED: "ParticipantsUpdated",
  VOTE_SUBMITTED: "VoteSubmitted",
  VOTES_REVEALED: "VotesRevealed",
  VOTES_RESET: "VotesReset",
  // Added once the backend patch made ticket activation broadcast over
  // SignalR instead of being REST-only (see backend review, item 9).
  TICKET_ACTIVATED: "TicketActivated",
  // Fired once the moderator confirms a final estimate for the active
  // ticket (see PlanningPokerHub.FinalizeEstimate). Carries the updated
  // TicketResponse — Status is now "Estimated" and FinalEstimate is set.
  ESTIMATE_FINALIZED: "EstimateFinalized",
  // Fired when the moderator closes the session (see Part 3 backend
  // patch — previously other connected clients never found out a session
  // had closed until their next REST call or page refresh).
  SESSION_CLOSED: "SessionClosed",
} as const;

let connection: signalR.HubConnection | null = null;

/**
 * Builds (once) and returns the shared hub connection. The access token
 * is read fresh on every negotiate/reconnect via accessTokenFactory,
 * rather than baked in at build time, so a token obtained after the
 * connection object is created is still picked up correctly.
 */
function getConnection(): signalR.HubConnection {
  if (connection) return connection;

  connection = new signalR.HubConnectionBuilder()
    .withUrl(env.signalrHubUrl, {
      accessTokenFactory: () => useAuthStore.getState().token ?? "",
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 20000])
    .configureLogging(signalR.LogLevel.Warning)
    .build();

  return connection;
}

export interface PlanningPokerHandlers {
  onParticipantsUpdated: (participants: ParticipantResponse[]) => void;
  onVoteSubmitted: (event: VoteSubmittedEvent) => void;
  onVotesRevealed: (result: RevealVotesResponse) => void;
  onVotesReset: (ticketId: string) => void;
  onTicketActivated: (ticket: TicketResponse) => void;
  onEstimateFinalized: (ticket: TicketResponse) => void;
  onSessionClosed: () => void;
  onConnectionStateChange: (state: signalR.HubConnectionState) => void;
}

/**
 * Starts the hub connection (if not already started) and wires up all
 * event handlers. Returns a cleanup function that removes only the
 * handlers it added — safe to call from a component's useEffect cleanup
 * without tearing down a connection other components still depend on.
 */
export async function connectToPlanningPokerHub(
  handlers: PlanningPokerHandlers
): Promise<() => void> {
  const hub = getConnection();

  hub.on(HUB_EVENTS.PARTICIPANTS_UPDATED, handlers.onParticipantsUpdated);
  hub.on(HUB_EVENTS.VOTE_SUBMITTED, handlers.onVoteSubmitted);
  hub.on(HUB_EVENTS.VOTES_REVEALED, handlers.onVotesRevealed);
  hub.on(HUB_EVENTS.VOTES_RESET, handlers.onVotesReset);
  hub.on(HUB_EVENTS.TICKET_ACTIVATED, handlers.onTicketActivated);
  hub.on(HUB_EVENTS.ESTIMATE_FINALIZED, handlers.onEstimateFinalized);
  hub.on(HUB_EVENTS.SESSION_CLOSED, handlers.onSessionClosed);

  hub.onreconnecting(() => handlers.onConnectionStateChange(signalR.HubConnectionState.Reconnecting));
  hub.onreconnected(() => handlers.onConnectionStateChange(signalR.HubConnectionState.Connected));
  hub.onclose(() => handlers.onConnectionStateChange(signalR.HubConnectionState.Disconnected));

  if (hub.state === signalR.HubConnectionState.Disconnected) {
    handlers.onConnectionStateChange(signalR.HubConnectionState.Connecting);
    await hub.start();
    handlers.onConnectionStateChange(signalR.HubConnectionState.Connected);
  }

  return () => {
    hub.off(HUB_EVENTS.PARTICIPANTS_UPDATED, handlers.onParticipantsUpdated);
    hub.off(HUB_EVENTS.VOTE_SUBMITTED, handlers.onVoteSubmitted);
    hub.off(HUB_EVENTS.VOTES_REVEALED, handlers.onVotesRevealed);
    hub.off(HUB_EVENTS.VOTES_RESET, handlers.onVotesReset);
    hub.off(HUB_EVENTS.TICKET_ACTIVATED, handlers.onTicketActivated);
    hub.off(HUB_EVENTS.ESTIMATE_FINALIZED, handlers.onEstimateFinalized);
    hub.off(HUB_EVENTS.SESSION_CLOSED, handlers.onSessionClosed);
  };
}

/** Call when the user actually leaves the app area that needs the room (e.g. navigates away from the Planning Room). */
export async function disconnectFromPlanningPokerHub(): Promise<void> {
  if (connection && connection.state !== signalR.HubConnectionState.Disconnected) {
    await connection.stop();
  }
}

/** Hub method: JoinSession(Guid sessionId, string sessionCode) */
export async function hubJoinSession(sessionId: string, sessionCode: string): Promise<void> {
  await getConnection().invoke("JoinSession", sessionId, sessionCode);
}

/** Hub method: LeaveSession(string sessionCode) */
export async function hubLeaveSession(sessionCode: string): Promise<void> {
  await getConnection().invoke("LeaveSession", sessionCode);
}

/** Hub method: CastVote(string sessionCode, CastVoteRequest request) */
export async function hubCastVote(sessionCode: string, request: CastVoteRequest): Promise<void> {
  await getConnection().invoke("CastVote", sessionCode, request);
}

/** Hub method: RevealVotes(string sessionCode, Guid ticketId) */
export async function hubRevealVotes(sessionCode: string, ticketId: string): Promise<void> {
  await getConnection().invoke("RevealVotes", sessionCode, ticketId);
}

/** Hub method: ResetVotes(string sessionCode, Guid ticketId) */
export async function hubResetVotes(sessionCode: string, ticketId: string): Promise<void> {
  await getConnection().invoke("ResetVotes", sessionCode, ticketId);
}

/**
 * Hub method: FinalizeEstimate(string sessionCode, Guid ticketId, int finalEstimate)
 * Moderator-only — the hub rejects the call with a HubException otherwise
 * (surfaced to the caller as a rejected promise here).
 */
export async function hubFinalizeEstimate(
  sessionCode: string,
  ticketId: string,
  finalEstimate: number
): Promise<void> {
  await getConnection().invoke("FinalizeEstimate", sessionCode, ticketId, finalEstimate);
}

/**
 * Extracts a usable message from a rejected hub `invoke()` call. When the
 * server throws `HubException` (as every moderator-only check in
 * PlanningPokerHub does — e.g. "Only the session's moderator can reveal
 * votes."), SignalR delivers that message to the client verbatim, unlike
 * other server-side exceptions which it deliberately genericizes before
 * sending (so as not to leak implementation details). Falls back to the
 * given default for anything else — a network drop, a timeout, etc.
 */
export function getHubErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
