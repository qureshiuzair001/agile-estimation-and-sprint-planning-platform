import { History } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { planningRoomPath } from "@/constants/routes";
import { SESSION_STATUS } from "@/constants/status";
import { useMySessions } from "@/hooks/useSessions";

const STATUS_TONE: Record<string, BadgeTone> = {
  [SESSION_STATUS.WAITING]: "neutral",
  [SESSION_STATUS.ACTIVE]: "gold",
  [SESSION_STATUS.REVEALED]: "info",
  [SESSION_STATUS.CLOSED]: "success",
};

/**
 * Backed by GET /api/sessions/mine, the same endpoint DashboardPage uses
 * for its "recent sessions" list. This page shows the full history with
 * status at a glance, most recent first (the backend already orders by
 * CreatedAt descending — see SessionService.GetSessionsForUserAsync).
 */
export default function SessionHistoryPage() {
  const { data: sessions, isLoading } = useMySessions();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-parchment-50">
          Session history
        </h1>
        <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/70">
          Every session you've created or joined, with its current status.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={<History className="size-8" />}
          title="No sessions yet"
          description="Sessions you create or join will show up here."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((session) => (
            <li key={session.id}>
              <Link to={planningRoomPath(session.id)}>
                <Card className="flex items-center justify-between gap-3 p-5 transition-shadow hover:shadow-card-hover">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-900 dark:text-parchment-50">
                      {session.title}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge tone="gold" className="font-mono">
                        {session.sessionCode}
                      </Badge>
                      {session.isCurrentUserModerator && <Badge tone="info">Moderator</Badge>}
                    </div>
                  </div>
                  <Badge tone={STATUS_TONE[session.status] ?? "neutral"}>{session.status}</Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
