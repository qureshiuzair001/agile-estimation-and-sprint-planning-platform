/**
 * These mirror AgileEstimation.Domain.Enums.SessionStatus and TicketStatus.
 * The backend serializes enums as their string name (via .ToString()),
 * so these string constants must match the C# enum member names exactly.
 */
export const SESSION_STATUS = {
  WAITING: "Waiting",
  ACTIVE: "Active",
  REVEALED: "Revealed",
  CLOSED: "Closed",
} as const;

export type SessionStatusValue =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

/**
 * NOTE: per product decision, the Planning Room UI treats TicketStatus
 * (below) as the real source of truth for voting state, because the
 * backend's Session.Status never transitions away from "Waiting" today.
 */
export const TICKET_STATUS = {
  PENDING: "Pending",
  VOTING: "Voting",
  ESTIMATED: "Estimated",
  SKIPPED: "Skipped",
} as const;

export type TicketStatusValue =
  (typeof TICKET_STATUS)[keyof typeof TICKET_STATUS];
