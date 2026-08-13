import { LayoutGrid, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { ROUTES, planningRoomPath } from "@/constants/routes";
import { USER_ROLES } from "@/constants/roles";
import { useMySessions } from "@/hooks/useSessions";
import { useAuthStore } from "@/store/authStore";

/**
 * Now backed by the real GET /api/sessions/mine endpoint added by the
 * backend patch — this replaces the earlier localStorage-based "recent
 * sessions" workaround, which only reflected one browser.
 */
export default function DashboardPage() {
  const { data: sessions, isLoading } = useMySessions();
  const isModerator = useAuthStore((state) => state.user?.role === USER_ROLES.MODERATOR);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-parchment-50">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-600 dark:text-parchment-200/70">
            Sessions you've created or joined.
          </p>
        </div>

        <div className="flex gap-2">
          {/* Only Moderator accounts can create a session (the backend
              rejects it otherwise) — see RoleRoute on /sessions/new. */}
          {isModerator && (
            <Link to={ROUTES.CREATE_SESSION}>
              <Button>Create session</Button>
            </Link>
          )}
          <Link to={ROUTES.JOIN_SESSION}>
            <Button variant="secondary">Join session</Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={<LayoutGrid className="size-8" />}
          title="No sessions yet"
          description={
            isModerator
              ? "Create a new planning session or join one with a session code to get started."
              : "Ask your moderator for a session code or invite link to get started."
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.map((session) => (
            <Link key={session.id} to={planningRoomPath(session.id)}>
              <Card className="flex items-center justify-between gap-3 p-5 transition-shadow hover:shadow-card-hover">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink-900 dark:text-parchment-50">
                    {session.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone="gold" className="font-mono">
                      {session.sessionCode}
                    </Badge>
                    {session.isCurrentUserModerator && <Badge tone="info">Moderator</Badge>}
                  </div>
                </div>
                <ArrowRight className="size-4 shrink-0 text-ink-600/50 dark:text-parchment-200/40" />
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
