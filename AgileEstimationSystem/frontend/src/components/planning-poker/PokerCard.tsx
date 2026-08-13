import { Spade } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PokerCardProps {
  /** The real estimate value, shown once revealed. */
  value: string;
  /** Shown on the face-down side before reveal — typically the voter's initials. */
  frontLabel: string;
  isRevealed: boolean;
  size?: "sm" | "md";
}

const SIZE_CLASSES = {
  sm: "h-16 w-11",
  md: "h-24 w-16",
} as const;

const VALUE_TEXT_SIZE = {
  sm: "text-base",
  md: "text-2xl",
} as const;

const CORNER_TEXT_SIZE = {
  sm: "text-[8px]",
  md: "text-[10px]",
} as const;

/**
 * Represents one participant's vote in the results row, styled like an
 * actual playing card rather than a plain rounded rectangle: a diamond
 * lattice card-back before reveal, corner index + suit pip once
 * revealed. Flips via CSS 3D transform (see globals.css's
 * .card-flip-* utilities) when `isRevealed` becomes true.
 */
export function PokerCard({ value, frontLabel, isRevealed, size = "md" }: PokerCardProps) {
  return (
    <div className={cn("card-flip-perspective", SIZE_CLASSES[size])}>
      <div className={cn("card-flip-inner h-full w-full rounded-lg", isRevealed && "is-revealed")}>
        {/* Face-down: card back with a diamond lattice pattern, like a real deck. */}
        <div
          className="card-flip-face flex items-center justify-center rounded-lg border-2 border-chip-400/70 bg-felt-700 shadow-sm"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(230,178,74,0.15) 0, rgba(230,178,74,0.15) 1px, transparent 1px, transparent 8px)," +
              "repeating-linear-gradient(-45deg, rgba(230,178,74,0.15) 0, rgba(230,178,74,0.15) 1px, transparent 1px, transparent 8px)",
          }}
        >
          <span
            className={cn(
              "flex items-center justify-center rounded-full border border-chip-300/60 bg-felt-800/60 font-display font-semibold text-parchment-50",
              size === "sm" ? "size-6 text-[9px]" : "size-9 text-xs"
            )}
          >
            {frontLabel}
          </span>
        </div>

        {/* Face-up: proper playing-card layout — corner index (value + spade pip), mirrored top-left/bottom-right. */}
        <div className="card-flip-face card-flip-face-back rounded-lg border-2 border-ink-900/10 bg-white shadow-sm dark:border-parchment-50/15 dark:bg-felt-800">
          <div
            className={cn(
              "absolute left-1 top-1 flex flex-col items-center leading-none text-chip-500",
              CORNER_TEXT_SIZE[size]
            )}
          >
            <span className="font-display font-bold">{value}</span>
            <Spade className={size === "sm" ? "size-2" : "size-2.5"} fill="currentColor" />
          </div>

          <div className="flex h-full w-full items-center justify-center">
            <span
              className={cn(
                "font-display font-semibold text-ink-900 dark:text-parchment-50",
                VALUE_TEXT_SIZE[size]
              )}
            >
              {value}
            </span>
          </div>

          <div
            className={cn(
              "absolute bottom-1 right-1 flex rotate-180 flex-col items-center leading-none text-chip-500",
              CORNER_TEXT_SIZE[size]
            )}
          >
            <span className="font-display font-bold">{value}</span>
            <Spade className={size === "sm" ? "size-2" : "size-2.5"} fill="currentColor" />
          </div>
        </div>
      </div>
    </div>
  );
}
