/**
 * Standard Fibonacci-style planning poker deck.
 *
 * IMPORTANT: The backend's CastVoteRequest.EstimateValue is a plain `int`
 * with no server-side constraint (see backend review, Phase 2, item 11).
 * "?" and "☕" are UI-only conventions mapped to sentinel integers below
 * so they can still travel over the existing `int EstimateValue` field
 * without a backend change. Revisit this mapping if the backend is ever
 * updated to support a proper non-numeric vote type.
 */
export const CARD_DECK_UNKNOWN_VALUE = -1;
export const CARD_DECK_BREAK_VALUE = -2;

export interface PokerCard {
  label: string;
  value: number;
}

export const CARD_DECK: PokerCard[] = [
  { label: "0", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "5", value: 5 },
  { label: "8", value: 8 },
  { label: "13", value: 13 },
  { label: "21", value: 21 },
  { label: "?", value: CARD_DECK_UNKNOWN_VALUE },
  { label: "☕", value: CARD_DECK_BREAK_VALUE },
];
