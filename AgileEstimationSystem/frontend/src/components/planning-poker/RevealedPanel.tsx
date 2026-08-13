import { PartyPopper } from "lucide-react";
import { PokerCard } from "@/components/planning-poker/PokerCard";
import { cardLabelForValue, averageOfNumericVotes } from "@/utils/cardDisplay";
import type { RevealVotesResponse } from "@/types/voting.types";

export interface RevealedPanelProps {
  title: string;
  reveal: RevealVotesResponse;
  /** Compact mode for when two panels sit side by side (Moderator view) — smaller cards, tighter spacing. */
  compact?: boolean;
}

/**
 * One audience's revealed results. A "reveal" is now audience-segmented
 * server-side (see PlanningPokerHub.RevealVotes and votingStore's
 * developerReveal/testerReveal) — this component renders exactly the one
 * `RevealVotesResponse` it's given, nothing more. VotingPanel decides how
 * many of these to render and with what title, based on the viewer's role.
 */
export function RevealedPanel({ title, reveal, compact = false }: RevealedPanelProps) {
  const numericAverage = averageOfNumericVotes(reveal.votes.map((v) => v.estimateValue));

  const voteCounts = new Map<number, number>();
  reveal.votes.forEach((vote) => {
    voteCounts.set(vote.estimateValue, (voteCounts.get(vote.estimateValue) ?? 0) + 1);
  });
  const maxVoteCount = Math.max(1, ...voteCounts.values());
  const isConsensus = voteCounts.size === 1 && reveal.votes.length > 1;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-ink-900/5 p-3 dark:border-parchment-50/10 sm:p-4">
      <h3 className="text-sm font-semibold text-ink-900 dark:text-parchment-50">{title}</h3>

      {reveal.votes.length === 0 ? (
        <p className="text-xs text-ink-600 dark:text-parchment-200/60">No votes in this group.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2.5 sm:gap-3">
            {reveal.votes.map((vote) => (
              <div key={vote.userId} className="flex flex-col items-center gap-1.5">
                <PokerCard
                  value={cardLabelForValue(vote.estimateValue)}
                  frontLabel={vote.username.slice(0, 2).toUpperCase()}
                  isRevealed
                  size={compact ? "sm" : "md"}
                />
                <span className="max-w-[3.5rem] truncate text-xs text-ink-600 dark:text-parchment-200/70">
                  {vote.username}
                </span>
              </div>
            ))}
          </div>

          {isConsensus && (
            <div className="flex items-center gap-2 rounded-lg border border-chip-400/50 bg-chip-50 px-3 py-2 text-xs font-medium text-chip-700 dark:border-chip-400/25 dark:bg-chip-700/10 dark:text-chip-300">
              <PartyPopper className="size-3.5" /> Consensus!
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-felt-700/5 p-3 dark:bg-parchment-50/5">
            <div>
              <p className="font-mono text-xl font-semibold text-ink-900 dark:text-parchment-50">
                {numericAverage !== null ? numericAverage.toFixed(1) : "—"}
              </p>
              <p className="text-[11px] text-ink-600 dark:text-parchment-200/60">Average</p>
            </div>

            {voteCounts.size > 1 && (
              <div className="flex items-end gap-1.5">
                {Array.from(voteCounts.entries())
                  .sort(([a], [b]) => a - b)
                  .map(([value, count]) => (
                    <div key={value} className="flex flex-col items-center gap-1">
                      <div
                        className="w-4 rounded-t bg-chip-400"
                        style={{ height: `${(count / maxVoteCount) * 32 + 4}px` }}
                        title={`${count} vote${count === 1 ? "" : "s"}`}
                      />
                      <span className="text-[9px] font-medium text-ink-600 dark:text-parchment-200/60">
                        {cardLabelForValue(value)}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
