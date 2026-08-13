import { CARD_DECK, CARD_DECK_BREAK_VALUE, CARD_DECK_UNKNOWN_VALUE } from "@/constants/cardDeck";

/** Converts a raw EstimateValue (as stored/sent by the backend) back into its display label. */
export function cardLabelForValue(value: number): string {
  const match = CARD_DECK.find((card) => card.value === value);
  return match?.label ?? String(value);
}

/** Computes a display-friendly average, excluding non-numeric sentinel votes ("?" and "☕"). */
export function averageOfNumericVotes(values: number[]): number | null {
  const numeric = values.filter(
    (value) => value !== CARD_DECK_UNKNOWN_VALUE && value !== CARD_DECK_BREAK_VALUE
  );

  if (numeric.length === 0) return null;

  return numeric.reduce((sum, value) => sum + value, 0) / numeric.length;
}

/** The numeric (non-sentinel) values in the standard deck, in ascending order — used to snap an average to a real card. */
const NUMERIC_DECK_VALUES = CARD_DECK.map((card) => card.value)
  .filter((value) => value !== CARD_DECK_UNKNOWN_VALUE && value !== CARD_DECK_BREAK_VALUE)
  .sort((a, b) => a - b);

/**
 * Snaps a raw average onto the nearest real Planning Poker card value
 * (e.g. an average of 4.3 suggests "5", not a fractional estimate that
 * doesn't exist on anyone's deck). Ties round up to the larger card,
 * matching how most Planning Poker tools resolve a tie between two
 * Fibonacci neighbors.
 */
export function suggestedCardValue(average: number | null): number | null {
  if (average === null) return null;

  return NUMERIC_DECK_VALUES.reduce((closest, candidate) => {
    const currentDiff = Math.abs(candidate - average);
    const closestDiff = Math.abs(closest - average);

    if (currentDiff < closestDiff) return candidate;
    if (currentDiff === closestDiff) return Math.max(closest, candidate);
    return closest;
  }, NUMERIC_DECK_VALUES[0]);
}
