import { apiClient } from "@/api/axiosClient";
import type { MessageResponse } from "@/types/common.types";
import type {
  CreateTicketRequest,
  TicketResponse,
  UpdateTicketRequest,
} from "@/types/ticket.types";
import type { VoteResponse } from "@/types/voting.types";

/** POST /api/tickets */
export async function createTicket(payload: CreateTicketRequest): Promise<TicketResponse> {
  const { data } = await apiClient.post<TicketResponse>("/api/tickets", payload);
  return data;
}

/** GET /api/tickets/session/{sessionId} */
export async function getTicketsBySession(sessionId: string): Promise<TicketResponse[]> {
  const { data } = await apiClient.get<TicketResponse[]>(`/api/tickets/session/${sessionId}`);
  return data;
}

/**
 * GET /api/tickets/{ticketId}/votes — new endpoint backing the ticket
 * history / vote breakdown view. Works for any ticket that has votes,
 * not just finalized ones, but is mainly used for Estimated tickets
 * since votes are never deleted once a ticket is finalized.
 */
export async function getVotesForTicket(ticketId: string): Promise<VoteResponse[]> {
  const { data } = await apiClient.get<VoteResponse[]>(`/api/tickets/${ticketId}/votes`);
  return data;
}

/** PUT /api/tickets/{ticketId} */
export async function updateTicket(
  ticketId: string,
  payload: UpdateTicketRequest
): Promise<MessageResponse> {
  const { data } = await apiClient.put<MessageResponse>(`/api/tickets/${ticketId}`, payload);
  return data;
}

/** DELETE /api/tickets/{ticketId} */
export async function deleteTicket(ticketId: string): Promise<MessageResponse> {
  const { data } = await apiClient.delete<MessageResponse>(`/api/tickets/${ticketId}`);
  return data;
}

/** PUT /api/tickets/{ticketId}/activate */
export async function activateTicket(ticketId: string): Promise<MessageResponse> {
  const { data } = await apiClient.put<MessageResponse>(`/api/tickets/${ticketId}/activate`);
  return data;
}
