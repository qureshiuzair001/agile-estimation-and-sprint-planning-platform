import { Spade } from "lucide-react";
import { cn } from "@/utils/cn";

export interface DeckCardProps {
  label: string;
  isSelected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * One card in the player's voting deck, styled like a real playing card:
 * a corner index (value + spade pip) in the top-left, mirrored in the
 * bottom-right, with the value large in the center. Always face-up —
 * nothing to flip here, that only happens once a vote is submitted (see
 * PokerCard for the results-row version).
 */
export function DeckCard({ label, isSelected, onClick, disabled }: DeckCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        "relative h-20 w-14 shrink-0 rounded-lg border-2 font-display transition-transform sm:h-24 sm:w-16",
        "hover:-translate-y-1.5 disabled:pointer-events-none disabled:opacity-40",
        isSelected
          ? "border-chip-500 bg-chip-400 text-felt-900 shadow-chip -translate-y-1.5"
          : "border-ink-900/10 bg-white text-ink-900 hover:border-chip-300 dark:border-parchment-50/15 dark:bg-felt-800 dark:text-parchment-50"
      )}
    >
      <span
        className={cn(
          "absolute left-1.5 top-1.5 flex flex-col items-center text-[10px] leading-none",
          isSelected ? "text-felt-900" : "text-chip-500"
        )}
      >
        <span className="font-bold">{label}</span>
        <Spade className="size-2.5" fill="currentColor" />
      </span>

      <span className="flex h-full w-full items-center justify-center text-xl font-semibold sm:text-2xl">
        {label}
      </span>

      <span
        className={cn(
          "absolute bottom-1.5 right-1.5 flex rotate-180 flex-col items-center text-[10px] leading-none",
          isSelected ? "text-felt-900" : "text-chip-500"
        )}
      >
        <span className="font-bold">{label}</span>
        <Spade className="size-2.5" fill="currentColor" />
      </span>
    </button>
  );
}
