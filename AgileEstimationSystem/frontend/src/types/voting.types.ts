import type { UserRoleValue } from "@/constants/roles";

/** Mirrors CastVoteRequest — sent over the SignalR hub, not REST. */
export interface CastVoteRequest {
  ticketId: string;
  sessionCode: string;
  estimateValue: number;
}

/** Mirrors VoteResponse */
export interface VoteResponse {
  userId: string;
  username: string;
  estimateValue: number;
  /** New: the voter's account role — "Moderator" votes appear in both audiences' reveals. */
  role: UserRoleValue;
}

/**
 * Mirrors RevealVotesResponse.
 *
 * A reveal is now audience-segmented server-side (see PlanningPokerHub.RevealVotes):
 * a Developer client only ever receives an event with `audience: "Developer"`
 * (their own votes + the Moderator's), a Tester only `audience: "Tester"` —
 * the other group's votes are never sent to them at all, not just hidden
 * in the UI. The Moderator receives both.
 */
export interface RevealVotesResponse {
  ticketId: string;
  audience: UserRoleValue;
  votes: VoteResponse[];
  averageEstimate: number;
}

/** Payload of the hub's "VoteSubmitted" event (see PlanningPokerHub.CastVote). */
export interface VoteSubmittedEvent {
  userId: string;
  ticketId: string;
}
