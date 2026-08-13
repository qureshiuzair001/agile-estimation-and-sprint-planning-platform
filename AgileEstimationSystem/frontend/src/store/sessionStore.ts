import { create } from "zustand";
import type { ParticipantResponse, SessionResponse } from "@/types/session.types";
import type { TicketResponse } from "@/types/ticket.types";

interface SessionState {
  session: SessionResponse | null;
  participants: ParticipantResponse[];
  tickets: TicketResponse[];
  activeTicketId: string | null;

  setSession: (session: SessionResponse) => void;
  setParticipants: (participants: ParticipantResponse[]) => void;
  setTickets: (tickets: TicketResponse[]) => void;
  upsertTicket: (ticket: TicketResponse) => void;
  removeTicket: (ticketId: string) => void;
  setActiveTicketId: (ticketId: string | null) => void;
  reset: () => void;
}

const initialState = {
  session: null,
  participants: [],
  tickets: [],
  activeTicketId: null,
} satisfies Pick<SessionState, "session" | "participants" | "tickets" | "activeTicketId">;

/**
 * Room-scoped state, separate from auth state. This store is reset every
 * time the user leaves a Planning Room (see `reset()`), unlike authStore
 * which persists across the whole app session.
 */
export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  setSession: (session) => set({ session }),
  setParticipants: (participants) => set({ participants }),
  setTickets: (tickets) => set({ tickets }),

  upsertTicket: (ticket) =>
    set((state) => {
      const exists = state.tickets.some((t) => t.id === ticket.id);
      return {
        tickets: exists
          ? state.tickets.map((t) => (t.id === ticket.id ? ticket : t))
          : [...state.tickets, ticket].sort((a, b) => a.order - b.order),
      };
    }),

  removeTicket: (ticketId) =>
    set((state) => ({ tickets: state.tickets.filter((t) => t.id !== ticketId) })),

  setActiveTicketId: (ticketId) => set({ activeTicketId: ticketId }),

  reset: () => set(initialState),
}));
