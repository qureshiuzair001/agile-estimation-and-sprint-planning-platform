import { create } from "zustand";
import { USER_ROLES } from "@/constants/roles";
import type { RevealVotesResponse } from "@/types/voting.types";

interface VotingState {
  /** The card value the current user has selected but not necessarily submitted yet. */
  selectedValue: number | null;
  /** userIds who have submitted a vote for the active ticket (values hidden until reveal). */
  submittedUserIds: string[];
  /**
   * Populated once a "Developer" or "Tester" reveal event arrives — see
   * applyReveal. Kept as two separate slots instead of one, because a
   * reveal is now audience-segmented server-side: a Moderator can end up
   * with both populated at once (they receive both audiences), while a
   * Developer or Tester will only ever see their own slot filled — the
   * other one genuinely never arrives for them.
   */
  developerReveal: RevealVotesResponse | null;
  testerReveal: RevealVotesResponse | null;

  selectValue: (value: number) => void;
  markSubmitted: (userId: string) => void;
  /** Routes an incoming reveal to the right slot based on its `audience` field. */
  applyReveal: (result: RevealVotesResponse) => void;
  resetForNewTicket: () => void;
}

const initialState = {
  selectedValue: null,
  submittedUserIds: [],
  developerReveal: null,
  testerReveal: null,
} satisfies Pick<
  VotingState,
  "selectedValue" | "submittedUserIds" | "developerReveal" | "testerReveal"
>;

/**
 * Kept separate from sessionStore because it resets on every new ticket
 * (see resetForNewTicket), while participants/tickets persist for the
 * whole room.
 */
export const useVotingStore = create<VotingState>((set) => ({
  ...initialState,

  selectValue: (value) => set({ selectedValue: value }),

  markSubmitted: (userId) =>
    set((state) => ({
      submittedUserIds: state.submittedUserIds.includes(userId)
        ? state.submittedUserIds
        : [...state.submittedUserIds, userId],
    })),

  applyReveal: (result) =>
    set(
      result.audience === USER_ROLES.TESTER
        ? { testerReveal: result }
        : { developerReveal: result }
    ),

  resetForNewTicket: () => set(initialState),
}));
