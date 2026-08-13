import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, XCircle, Copy } from "lucide-react";
import toast from "react-hot-toast";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { Card } from "@/components/ui/Card";
import { ConnectionStatusBadge } from "@/components/planning-poker/ConnectionStatusBadge";
import { TicketBacklog } from "@/components/planning-poker/TicketBacklog";
import { VotingPanel } from "@/components/planning-poker/VotingPanel";

import { useSession, useParticipants, useCloseSession, useLeaveSession } from "@/hooks/useSessions";
import { useActivateTicket, useTickets } from "@/hooks/useTickets";
import { useAuthStore } from "@/store/authStore";
import { useSessionStore } from "@/store/sessionStore";
import { useVotingStore } from "@/store/votingStore";
import { useConnectionStore } from "@/store/connectionStore";
import { ROUTES } from "@/constants/routes";
import { TICKET_STATUS } from "@/constants/status";
import { USER_ROLES } from "@/constants/roles";
import {
  connectToPlanningPokerHub,
  disconnectFromPlanningPokerHub,
  getHubErrorMessage,
  hubCastVote,
  hubFinalizeEstimate,
  hubJoinSession,
  hubLeaveSession,
  hubRevealVotes,
  hubResetVotes,
} from "@/signalr/planningPokerHub";

/**
 * The live Planning Room. Combines REST (initial data load) with SignalR
 * (real-time updates). Session.Status still doesn't map cleanly to
 * per-ticket voting state even after the backend patch (that's a deeper
 * modeling issue, not just a bug), so this page still keys off
 * Ticket.Status for "which ticket is active" by product decision.
 */
export default function PlanningRoomPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  const { data: session, isLoading: isSessionLoading } = useSession(sessionId);
  const { data: participants = [] } = useParticipants(sessionId);
  const { data: tickets = [] } = useTickets(sessionId);

  const { mutate: closeSession, isPending: isClosing } = useCloseSession();
  const { mutate: leaveSession } = useLeaveSession();
  const { mutate: activateTicket, isPending: isActivatingNext } = useActivateTicket(sessionId ?? "");

  const setSession = useSessionStore((state) => state.setSession);
  const setParticipants = useSessionStore((state) => state.setParticipants);
  const activeTicketId = useSessionStore((state) => state.activeTicketId);
  const setActiveTicketId = useSessionStore((state) => state.setActiveTicketId);
  const resetSessionStore = useSessionStore((state) => state.reset);

  const [isFinalizing, setIsFinalizing] = useState(false);

  const markSubmitted = useVotingStore((state) => state.markSubmitted);
  const applyReveal = useVotingStore((state) => state.applyReveal);
  const resetForNewTicket = useVotingStore((state) => state.resetForNewTicket);
  const setConnectionStatus = useConnectionStore((state) => state.setStatus);

  // Ticket.Status is the real source of truth for which ticket is "active"
  // (Session.Status never transitions — see backend review, item 5).
  const votingTicket = tickets.find((t) => t.status === TICKET_STATUS.VOTING) ?? null;

  // Powers the "Start next ticket" action once the current one is
  // finalized — the lowest-Order ticket still awaiting a first round.
  const nextPendingTicket =
    tickets
      .filter((t) => t.status === TICKET_STATUS.PENDING)
      .sort((a, b) => a.order - b.order)[0] ?? null;

  const hasJoinedRef = useRef(false);

  useEffect(() => {
    if (session) setSession(session);
  }, [session, setSession]);

  useEffect(() => {
    setParticipants(participants);
  }, [participants, setParticipants]);

  useEffect(() => {
    return () => resetSessionStore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActiveTicketId(votingTicket?.id ?? null);
    resetForNewTicket();
  }, [votingTicket?.id, setActiveTicketId, resetForNewTicket]);

  useEffect(() => {
    if (!session || hasJoinedRef.current) return;

    let cleanup: (() => void) | undefined;

    async function connect() {
      cleanup = await connectToPlanningPokerHub({
        onParticipantsUpdated: setParticipants,
        onVoteSubmitted: (event) => markSubmitted(event.userId),
        onVotesRevealed: (result) => applyReveal(result),
        onVotesReset: () => resetForNewTicket(),
        onTicketActivated: () => {
          queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
        },
        onEstimateFinalized: () => {
          queryClient.invalidateQueries({ queryKey: ["tickets", sessionId] });
          toast.success("Final estimate confirmed.");
        },
        onSessionClosed: () => {
          toast("The moderator closed this session.", { icon: "\u{1F6AA}" });
          navigate(ROUTES.DASHBOARD);
        },
        onConnectionStateChange: setConnectionStatus,
      });

      await hubJoinSession(session!.id, session!.sessionCode);
      hasJoinedRef.current = true;
    }

    connect().catch(() => {
      toast.error("Couldn't connect to the live session. Try refreshing the page.");
    });

    return () => {
      cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  useEffect(() => {
    return () => {
      if (session) hubLeaveSession(session.sessionCode).catch(() => undefined);
      disconnectFromPlanningPokerHub().catch(() => undefined);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id]);

  if (isSessionLoading || !session) {
    return <Loader fullScreen label="Loading session…" />;
  }

  function handleCastVote(value: number) {
    if (!session || !activeTicketId || !currentUser) return;
    hubCastVote(session.sessionCode, {
      ticketId: activeTicketId,
      sessionCode: session.sessionCode,
      estimateValue: value,
    }).catch((error) =>
      toast.error(getHubErrorMessage(error, "Your vote didn't go through. Try again."))
    );
  }

  function handleReveal() {
    if (!session || !activeTicketId) return;
    hubRevealVotes(session.sessionCode, activeTicketId).catch((error) =>
      toast.error(getHubErrorMessage(error, "Couldn't reveal votes. Try again."))
    );
  }

  function handleReset() {
    if (!session || !activeTicketId) return;
    hubResetVotes(session.sessionCode, activeTicketId).catch((error) =>
      toast.error(getHubErrorMessage(error, "Couldn't reset votes. Try again."))
    );
  }

  async function handleFinalize(finalEstimate: number) {
    if (!session || !activeTicketId) return;
    setIsFinalizing(true);
    try {
      await hubFinalizeEstimate(session.sessionCode, activeTicketId, finalEstimate);
    } catch (error) {
      toast.error(getHubErrorMessage(error, "Couldn't confirm the estimate. Try again."));
    } finally {
      setIsFinalizing(false);
    }
  }

  function handleLeave() {
    if (!session) return;
    leaveSession(session.id, { onSuccess: () => navigate(ROUTES.DASHBOARD) });
  }

  function handleClose() {
    if (!session) return;
    closeSession(session.id, { onSuccess: () => navigate(ROUTES.DASHBOARD) });
  }

  function handleActivateNext(ticketId: string) {
    activateTicket(ticketId);
  }

  async function handleCopyInviteLink() {
    if (!session) return;
    const inviteUrl = `${window.location.origin}${ROUTES.JOIN_SESSION}?code=${session.sessionCode}`;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success("Invite link copied to clipboard.");
    } catch {
      toast.error("Couldn't copy the link — you can still share the session code directly.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-xl font-semibold text-ink-900 dark:text-parchment-50 sm:text-2xl">
            {session.title}
          </h1>
          <Badge tone="gold" className="font-mono">
            {session.sessionCode}
          </Badge>
          {session.isCurrentUserModerator && (
            <button
              type="button"
              onClick={handleCopyInviteLink}
              className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-600 hover:bg-ink-900/5 dark:text-parchment-200/70 dark:hover:bg-parchment-50/10"
            >
              <Copy className="size-3.5" /> Copy invite link
            </button>
          )}
          <ConnectionStatusBadge />
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={handleLeave} className="flex-1 sm:flex-none">
            <LogOut className="size-4" /> Leave
          </Button>
          {session.isCurrentUserModerator && (
            <Button
              size="sm"
              variant="danger"
              onClick={handleClose}
              isLoading={isClosing}
              className="flex-1 sm:flex-none"
            >
              <XCircle className="size-4" /> Close session
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="order-2 md:order-1">
          <TicketBacklog
            sessionId={session.id}
            tickets={tickets}
            activeTicketId={activeTicketId}
            isModerator={session.isCurrentUserModerator}
          />
        </div>

        <Card className="order-1 p-4 sm:p-6 md:order-2">
          <VotingPanel
            activeTicket={votingTicket}
            nextPendingTicket={nextPendingTicket}
            participants={participants}
            currentUserId={currentUser?.id ?? ""}
            currentUserRole={currentUser?.role ?? USER_ROLES.DEVELOPER}
            isModerator={session.isCurrentUserModerator}
            isFinalizing={isFinalizing}
            isActivatingNext={isActivatingNext}
            onCastVote={handleCastVote}
            onReveal={handleReveal}
            onReset={handleReset}
            onFinalize={handleFinalize}
            onActivateNext={handleActivateNext}
          />
        </Card>
      </div>
    </div>
  );
}
