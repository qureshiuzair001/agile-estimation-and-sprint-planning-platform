import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  activateTicket,
  createTicket,
  deleteTicket,
  getTicketsBySession,
  getVotesForTicket,
  updateTicket,
} from "@/api/ticketApi";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { CreateTicketRequest, UpdateTicketRequest } from "@/types/ticket.types";

export function useTickets(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["tickets", sessionId],
    queryFn: () => getTicketsBySession(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

/** Per-ticket vote breakdown — used by the ticket history modal. Only fetched when opened (see `enabled`). */
export function useTicketVotes(ticketId: string | undefined) {
  return useQuery({
    queryKey: ["tickets", ticketId, "votes"],
    queryFn: () => getVotesForTicket(ticketId as string),
    enabled: Boolean(ticketId),
  });
}

export function useCreateTicket(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTicketRequest) => createTicket(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
      toast.success("Ticket added.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not add the ticket."));
    },
  });
}

export function useUpdateTicket(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, payload }: { ticketId: string; payload: UpdateTicketRequest }) =>
      updateTicket(ticketId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
      toast.success("Ticket updated.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not update the ticket."));
    },
  });
}

export function useDeleteTicket(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => deleteTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
      toast.success("Ticket removed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not remove the ticket."));
    },
  });
}

/**
 * NOTE: activating a ticket over REST does not broadcast anything over
 * SignalR (see backend review, item 9) — other connected clients won't
 * find out a ticket became active in real time from this call alone.
 * We invalidate the query cache locally so at least the moderator who
 * triggered it sees the change immediately.
 */
export function useActivateTicket(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ticketId: string) => activateTicket(ticketId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not activate the ticket."));
    },
  });
}
