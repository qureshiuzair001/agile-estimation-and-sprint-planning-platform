import { History } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTicketVotes } from "@/hooks/useTickets";
import { cardLabelForValue } from "@/utils/cardDisplay";
import type { TicketResponse } from "@/types/ticket.types";

export interface TicketHistoryModalProps {
  ticket: TicketResponse | null;
  onClose: () => void;
}

/**
 * Shows how a team arrived at a ticket's final estimate — every
 * individual vote, not just the average. Backed by GET
 * /api/tickets/{id}/votes, a new endpoint: votes are never deleted once
 * cast (only an explicit re-vote clears them), so this works for any
 * ticket that's been through at least one round, not just Estimated ones.
 */
export function TicketHistoryModal({ ticket, onClose }: TicketHistoryModalProps) {
  const { data: votes, isLoading } = useTicketVotes(ticket?.id);

  return (
    <Modal
      isOpen={Boolean(ticket)}
      onClose={onClose}
      title={ticket?.title ?? ""}
      description="Vote breakdown"
    >
      {ticket?.finalEstimate !== null && ticket?.finalEstimate !== undefined && (
        <div className="mb-4 rounded-lg bg-chip-50 p-3 text-center dark:bg-chip-700/10">
          <p className="font-mono text-2xl font-semibold text-ink-900 dark:text-parchment-50">
            {ticket.finalEstimate}
          </p>
          <p className="text-xs text-ink-600 dark:text-parchment-200/60">Final estimate</p>
        </div>
      )}

      {isLoading ? (
        <Loader label="Loading votes…" />
      ) : !votes || votes.length === 0 ? (
        <EmptyState
          icon={<History className="size-8" />}
          title="No votes recorded"
          description="This ticket hasn't been voted on yet."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {votes.map((vote) => (
            <li
              key={vote.userId}
              className="flex items-center justify-between gap-3 rounded-lg border border-ink-900/5 p-2.5 dark:border-parchment-50/10"
            >
              <div className="flex items-center gap-2.5">
                <Avatar username={vote.username} size="sm" />
                <span className="text-sm text-ink-900 dark:text-parchment-50">
                  {vote.username}
                </span>
              </div>
              <span className="font-mono text-sm font-semibold text-chip-600 dark:text-chip-300">
                {cardLabelForValue(vote.estimateValue)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
