import { Check } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { USER_ROLES } from "@/constants/roles";
import type { ParticipantResponse } from "@/types/session.types";

export interface ParticipantsPanelProps {
  participants: ParticipantResponse[];
  submittedUserIds: string[];
}

const ROLE_TONE: Record<string, BadgeTone> = {
  [USER_ROLES.MODERATOR]: "gold",
  [USER_ROLES.DEVELOPER]: "info",
  [USER_ROLES.TESTER]: "success",
};

export function ParticipantsPanel({ participants, submittedUserIds }: ParticipantsPanelProps) {
  const votedCount = participants.filter((p) => submittedUserIds.includes(p.userId)).length;

  return (
    <div className="flex flex-col gap-2.5">
      {participants.length > 0 && (
        <p className="text-xs font-medium text-ink-600 dark:text-parchment-200/60">
          {votedCount} of {participants.length} voted
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {participants.map((participant) => {
          const hasVoted = submittedUserIds.includes(participant.userId);

          return (
            <div key={participant.userId} className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <Avatar username={participant.username} isOnline={participant.isOnline} />
                {hasVoted ? (
                  <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-chip-400 ring-2 ring-white dark:ring-felt-800">
                    <Check className="size-2.5 text-felt-900" strokeWidth={3} />
                  </span>
                ) : (
                  <span
                    className="absolute -right-1 -top-1 size-4 animate-pulse rounded-full bg-ink-900/15 ring-2 ring-white dark:bg-parchment-50/20 dark:ring-felt-800"
                    aria-hidden="true"
                  />
                )}
              </div>
              <span className="max-w-[4.5rem] truncate text-xs text-ink-600 dark:text-parchment-200/70">
                {participant.username}
              </span>
              <Badge tone={ROLE_TONE[participant.role] ?? "neutral"} className="px-1.5 py-0 text-[9px]">
                {participant.role}
              </Badge>
            </div>
          );
        })}
      </div>
    </div>
  );
}
