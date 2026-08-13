import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus, Trash2, Play, History } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { TicketHistoryModal } from "@/components/planning-poker/TicketHistoryModal";
import { ticketSchema, type TicketFormValues } from "@/schemas/ticket.schema";
import { TICKET_STATUS } from "@/constants/status";
import type { TicketResponse } from "@/types/ticket.types";
import { useActivateTicket, useCreateTicket, useDeleteTicket } from "@/hooks/useTickets";
import { cn } from "@/utils/cn";

const STATUS_TONE: Record<string, BadgeTone> = {
  [TICKET_STATUS.PENDING]: "neutral",
  [TICKET_STATUS.VOTING]: "gold",
  [TICKET_STATUS.ESTIMATED]: "success",
  [TICKET_STATUS.SKIPPED]: "danger",
};

export interface TicketBacklogProps {
  sessionId: string;
  tickets: TicketResponse[];
  activeTicketId: string | null;
  /**
   * Only Moderators can add, activate, or delete tickets (requirement:
   * "Moderator: ... Can create Ticket"). Developers/Testers get a
   * read-only backlog — they can still open the history/vote-breakdown
   * view for any ticket, since viewing your own group's past votes isn't
   * a moderator-only action.
   */
  isModerator: boolean;
}

export function TicketBacklog({ sessionId, tickets, activeTicketId, isModerator }: TicketBacklogProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [historyTicket, setHistoryTicket] = useState<TicketResponse | null>(null);

  const { mutate: createTicket, isPending: isCreating } = useCreateTicket(sessionId);
  const { mutate: activateTicket } = useActivateTicket(sessionId);
  const { mutate: deleteTicket } = useDeleteTicket(sessionId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: "", description: "" },
  });

  function onSubmit(values: TicketFormValues) {
    createTicket(
      { sessionId, title: values.title, description: values.description },
      {
        onSuccess: () => {
          reset();
          setIsAddOpen(false);
        },
      }
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-ink-900 dark:text-parchment-50">
          Backlog
        </h2>
        {isModerator && (
          <Button size="sm" variant="secondary" onClick={() => setIsAddOpen(true)}>
            <Plus className="size-4" /> Add ticket
          </Button>
        )}
      </div>

      <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto pr-0.5 md:max-h-[calc(100vh-14rem)]">
        {tickets.map((ticket) => {
          // A ticket has a vote record worth showing once it's been
          // through at least one round — Estimated always qualifies;
          // Voting can too if a round was revealed but not yet
          // finalized (votes aren't deleted until an explicit re-vote).
          const hasHistory =
            ticket.status === TICKET_STATUS.ESTIMATED || ticket.status === TICKET_STATUS.VOTING;

          return (
            <li
              key={ticket.id}
              className={cn(
                "flex items-center justify-between gap-2 rounded-lg border p-3",
                ticket.id === activeTicketId
                  ? "border-chip-400 bg-chip-50 dark:bg-chip-700/10"
                  : "border-ink-900/5 bg-white dark:bg-felt-800 dark:border-parchment-50/10"
              )}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink-900 dark:text-parchment-50">
                  {ticket.title}
                </p>
                <Badge tone={STATUS_TONE[ticket.status] ?? "neutral"} className="mt-1">
                  {ticket.status}
                  {ticket.finalEstimate !== null && ` · ${ticket.finalEstimate}`}
                </Badge>
              </div>

              <div className="flex shrink-0 items-center gap-0.5">
                {hasHistory && (
                  <button
                    type="button"
                    onClick={() => setHistoryTicket(ticket)}
                    aria-label="View vote history"
                    title="View vote history"
                    className="rounded-md p-2 text-ink-600 hover:bg-ink-900/5 dark:text-parchment-200 dark:hover:bg-parchment-50/10"
                  >
                    <History className="size-4" />
                  </button>
                )}
                {isModerator && ticket.id !== activeTicketId && ticket.status !== TICKET_STATUS.ESTIMATED && (
                  <button
                    type="button"
                    onClick={() => activateTicket(ticket.id)}
                    aria-label="Activate for voting"
                    className="rounded-md p-2 text-felt-600 hover:bg-felt-600/10 dark:text-felt-300"
                  >
                    <Play className="size-4" />
                  </button>
                )}
                {isModerator && (
                  <button
                    type="button"
                    onClick={() => deleteTicket(ticket.id)}
                    aria-label="Delete ticket"
                    className="rounded-md p-2 text-coral-500 hover:bg-coral-500/10"
                  >
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
            </li>
          );
        })}

        {tickets.length === 0 && (
          <p className="rounded-lg border border-dashed border-ink-900/10 p-4 text-center text-sm text-ink-600 dark:border-parchment-50/15 dark:text-parchment-200/60">
            {isModerator
              ? "No tickets yet — add one to start estimating."
              : "No tickets yet — waiting for the moderator to add some."}
          </p>
        )}
      </ul>

      {isModerator && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title="Add a ticket"
          description="Give your team something to estimate."
        >
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
            <Input label="Title" error={errors.title?.message} {...register("title")} />

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-ink-700 dark:text-parchment-100"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="rounded-lg border border-ink-900/10 bg-white p-3 text-sm text-ink-900 focus:border-chip-400 dark:bg-felt-800 dark:text-parchment-50 dark:border-parchment-50/15"
                {...register("description")}
              />
              {errors.description?.message && (
                <p className="text-xs text-coral-500">{errors.description.message}</p>
              )}
            </div>

            <Button type="submit" fullWidth isLoading={isCreating}>
              Add ticket
            </Button>
          </form>
        </Modal>
      )}

      <TicketHistoryModal ticket={historyTicket} onClose={() => setHistoryTicket(null)} />
    </div>
  );
}
