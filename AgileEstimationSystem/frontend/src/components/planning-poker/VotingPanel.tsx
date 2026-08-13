import { useEffect, useState } from "react";
import { ArrowRight, Check, Eye, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { DeckCard } from "@/components/planning-poker/DeckCard";
import { RevealedPanel } from "@/components/planning-poker/RevealedPanel";
import { ParticipantsPanel } from "@/components/planning-poker/ParticipantsPanel";
import { CARD_DECK } from "@/constants/cardDeck";
import { USER_ROLES, type UserRoleValue } from "@/constants/roles";
import { averageOfNumericVotes, suggestedCardValue } from "@/utils/cardDisplay";
import { cn } from "@/utils/cn";
import type { ParticipantResponse } from "@/types/session.types";
import type { TicketResponse } from "@/types/ticket.types";
import type { VoteResponse } from "@/types/voting.types";
import { useVotingStore } from "@/store/votingStore";
import { TICKET_STATUS } from "@/constants/status";

export interface VotingPanelProps {
  activeTicket: TicketResponse | null;
  /** Next ticket in the backlog (lowest Order, status Pending), if any — powers the "Start next ticket" action. */
  nextPendingTicket: TicketResponse | null;
  participants: ParticipantResponse[];
  currentUserId: string;
  currentUserRole: UserRoleValue;
  isModerator: boolean;
  isFinalizing: boolean;
  isActivatingNext: boolean;
  onCastVote: (value: number) => void;
  onReveal: () => void;
  onReset: () => void;
  onFinalize: (finalEstimate: number) => void;
  onActivateNext: (ticketId: string) => void;
}

/** De-dupes votes by userId across the two audience reveals — the Moderator's own vote appears in both. */
function mergeUniqueVotes(...votesLists: (VoteResponse[] | undefined)[]): VoteResponse[] {
  const byUserId = new Map<string, VoteResponse>();
  votesLists.forEach((list) => list?.forEach((vote) => byUserId.set(vote.userId, vote)));
  return Array.from(byUserId.values());
}

export function VotingPanel({
  activeTicket,
  nextPendingTicket,
  participants,
  currentUserId,
  currentUserRole,
  isModerator,
  isFinalizing,
  isActivatingNext,
  onCastVote,
  onReveal,
  onReset,
  onFinalize,
  onActivateNext,
}: VotingPanelProps) {
  const selectedValue = useVotingStore((state) => state.selectedValue);
  const submittedUserIds = useVotingStore((state) => state.submittedUserIds);
  const developerReveal = useVotingStore((state) => state.developerReveal);
  const testerReveal = useVotingStore((state) => state.testerReveal);
  const selectValue = useVotingStore((state) => state.selectValue);

  // A reveal is audience-segmented server-side now (see votingStore) — a
  // Developer only ever receives developerReveal, a Tester only
  // testerReveal, and a Moderator receives both. "Is this revealed, from
  // MY seat" therefore depends on role: for a Moderator it's "either
  // audience came back", for everyone else it's "my own audience did".
  const myReveal = currentUserRole === USER_ROLES.TESTER ? testerReveal : developerReveal;
  const isRevealedForViewer = isModerator
    ? developerReveal !== null || testerReveal !== null
    : myReveal !== null;

  // Only relevant for the Moderator's finalize picker: a suggestion
  // based on the combined, de-duplicated set of everyone's votes across
  // both audiences (their own vote appears in both reveals otherwise).
  const combinedVotes = mergeUniqueVotes(developerReveal?.votes, testerReveal?.votes);
  const combinedAverage = averageOfNumericVotes(combinedVotes.map((v) => v.estimateValue));
  const suggestedEstimate = suggestedCardValue(combinedAverage);

  const [chosenEstimate, setChosenEstimate] = useState<number | null>(null);

  // Re-seed the moderator's working choice with the suggestion every time
  // a fresh reveal arrives. Kept above the `!activeTicket` early return
  // below so this hook always runs on every render, in the same order —
  // conditionally skipping a hook call is a Rules-of-Hooks violation.
  useEffect(() => {
    setChosenEstimate(suggestedEstimate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTicket?.id, developerReveal, testerReveal]);

  if (!activeTicket) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-card border border-dashed border-ink-900/10 p-6 text-center dark:border-parchment-50/15 sm:p-10">
        <p className="text-sm text-ink-600 dark:text-parchment-200/70">
          {nextPendingTicket
            ? "No ticket is active."
            : "No ticket is active. Add one to the backlog to start estimating."}
        </p>
        {nextPendingTicket && isModerator && (
          <Button
            onClick={() => onActivateNext(nextPendingTicket.id)}
            isLoading={isActivatingNext}
          >
            Start next ticket <ArrowRight className="size-4" />
          </Button>
        )}
        {nextPendingTicket && !isModerator && (
          <p className="text-xs text-ink-600 dark:text-parchment-200/60">
            Waiting for the moderator to start "{nextPendingTicket.title}".
          </p>
        )}
      </div>
    );
  }

  const hasEveryoneVoted =
    participants.length > 0 && participants.every((p) => submittedUserIds.includes(p.userId));

  function handleSelect(value: number) {
    selectValue(value);
    onCastVote(value);
  }

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink-900 dark:text-parchment-50">
          {activeTicket.title}
        </h2>
        {activeTicket.description && (
          <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/70">
            {activeTicket.description}
          </p>
        )}
      </div>

      <ParticipantsPanel participants={participants} submittedUserIds={submittedUserIds} />

      {isRevealedForViewer ? (
        <div className="flex flex-col gap-4">
          {isModerator ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {developerReveal && (
                <RevealedPanel title="Developer votes" reveal={developerReveal} compact />
              )}
              {testerReveal && <RevealedPanel title="Tester votes" reveal={testerReveal} compact />}
            </div>
          ) : (
            myReveal && (
              <RevealedPanel
                title={currentUserRole === USER_ROLES.TESTER ? "Tester votes" : "Developer votes"}
                reveal={myReveal}
              />
            )
          )}

          {isModerator ? (
            <div className="flex flex-col gap-3 rounded-lg border border-chip-400/40 bg-chip-50 p-4 dark:border-chip-400/20 dark:bg-chip-700/10">
              <div>
                <p className="text-sm font-medium text-ink-900 dark:text-parchment-50">
                  Confirm the final estimate
                </p>
                <p className="text-xs text-ink-600 dark:text-parchment-200/70">
                  Suggested from everyone's combined average — pick a different card if the team
                  agreed on something else after discussion.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {CARD_DECK.filter(
                  (card) => card.value !== -1 && card.value !== -2
                ).map((card) => (
                  <button
                    key={card.value}
                    type="button"
                    onClick={() => setChosenEstimate(card.value)}
                    className={cn(
                      "flex size-11 items-center justify-center rounded-lg border-2 font-display font-semibold transition-colors",
                      chosenEstimate === card.value
                        ? "border-chip-500 bg-chip-400 text-felt-900"
                        : "border-ink-900/10 bg-white text-ink-900 hover:border-chip-400 dark:border-parchment-50/15 dark:bg-felt-800 dark:text-parchment-50",
                      suggestedEstimate === card.value &&
                        chosenEstimate !== card.value &&
                        "ring-2 ring-chip-400/60 ring-offset-1"
                    )}
                  >
                    {card.label}
                    {suggestedEstimate === card.value && (
                      <span className="sr-only"> (suggested)</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => chosenEstimate !== null && onFinalize(chosenEstimate)}
                  disabled={chosenEstimate === null}
                  isLoading={isFinalizing}
                  className="self-start"
                >
                  <Check className="size-4" /> Confirm estimate
                </Button>
                <Button variant="secondary" onClick={onReset} className="self-start">
                  <RotateCcw className="size-4" /> Re-vote instead
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-600 dark:text-parchment-200/60">
              Waiting for the moderator to confirm the final estimate…
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex gap-2.5 overflow-x-auto pb-2 sm:gap-3">
            {CARD_DECK.map((card) => (
              <DeckCard
                key={card.value}
                label={card.label}
                isSelected={selectedValue === card.value}
                onClick={() => handleSelect(card.value)}
                disabled={activeTicket.status !== TICKET_STATUS.VOTING}
              />
            ))}
          </div>

          {isModerator && (
            <Button
              onClick={onReveal}
              disabled={submittedUserIds.length === 0}
              className="self-start"
            >
              <Eye className="size-4" /> Reveal votes {hasEveryoneVoted ? "" : "(some pending)"}
            </Button>
          )}

          {!submittedUserIds.includes(currentUserId) ? (
            <p className="text-xs text-ink-600 dark:text-parchment-200/60">
              Pick a card above to submit your vote — it stays secret until the moderator reveals.
            </p>
          ) : (
            !isModerator && (
              <p className="text-xs text-ink-600 dark:text-parchment-200/60">
                Vote submitted. You can change it any time before the moderator reveals.
              </p>
            )
          )}
        </>
      )}
    </div>
  );
}
