import type { SessionStatusValue } from "@/constants/status";
import type { UserRoleValue } from "@/constants/roles";

/** Mirrors CreateSessionRequest */
export interface CreateSessionRequest {
  title: string;
}

/** Mirrors JoinSessionRequest */
export interface JoinSessionRequest {
  sessionCode: string;
}

/** Mirrors SessionResponse */
export interface SessionResponse {
  id: string;
  sessionCode: string;
  title: string;
  status: SessionStatusValue;
  moderatorId: string;
  /** Computed server-side from the requester's JWT — added when the backend's ownership gap was patched. */
  isCurrentUserModerator: boolean;
}

/** Mirrors ParticipantResponse */
export interface ParticipantResponse {
  userId: string;
  username: string;
  isOnline: boolean;
  /** New: the participant's account role — powers the role badge in ParticipantsPanel. */
  role: UserRoleValue;
}
