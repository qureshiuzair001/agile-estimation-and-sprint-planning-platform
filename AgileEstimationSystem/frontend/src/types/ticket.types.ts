import type { TicketStatusValue } from "@/constants/status";

/** Mirrors CreateTicketRequest */
export interface CreateTicketRequest {
  sessionId: string;
  title: string;
  description: string;
}

/** Mirrors UpdateTicketRequest */
export interface UpdateTicketRequest {
  title: string;
  description: string;
}

/** Mirrors TicketResponse */
export interface TicketResponse {
  id: string;
  sessionId: string;
  title: string;
  description: string;
  status: TicketStatusValue;
  order: number;
  finalEstimate: number | null;
}
