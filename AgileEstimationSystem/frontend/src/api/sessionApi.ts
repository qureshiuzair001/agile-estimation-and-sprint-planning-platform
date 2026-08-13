import { apiClient } from "@/api/axiosClient";
import type { MessageResponse } from "@/types/common.types";
import type {
  CreateSessionRequest,
  JoinSessionRequest,
  ParticipantResponse,
  SessionResponse,
} from "@/types/session.types";

/** POST /api/sessions */
export async function createSession(payload: CreateSessionRequest): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>("/api/sessions", payload);
  return data;
}

/**
 * POST /api/sessions/join
 * Now returns the full SessionResponse (backend patch) instead of just a
 * message, so the caller can navigate straight into the room.
 */
export async function joinSession(payload: JoinSessionRequest): Promise<SessionResponse> {
  const { data } = await apiClient.post<SessionResponse>("/api/sessions/join", payload);
  return data;
}

/** GET /api/sessions/{id} */
export async function getSession(sessionId: string): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>(`/api/sessions/${sessionId}`);
  return data;
}

/** GET /api/sessions/by-code/{sessionCode} — added by the backend patch. */
export async function getSessionByCode(sessionCode: string): Promise<SessionResponse> {
  const { data } = await apiClient.get<SessionResponse>(`/api/sessions/by-code/${sessionCode}`);
  return data;
}

/** GET /api/sessions/mine — added by the backend patch; replaces the localStorage workaround. */
export async function getMySessions(): Promise<SessionResponse[]> {
  const { data } = await apiClient.get<SessionResponse[]>("/api/sessions/mine");
  return data;
}

/** GET /api/sessions/{id}/participants */
export async function getParticipants(sessionId: string): Promise<ParticipantResponse[]> {
  const { data } = await apiClient.get<ParticipantResponse[]>(
    `/api/sessions/${sessionId}/participants`
  );
  return data;
}

/** POST /api/sessions/{id}/leave */
export async function leaveSession(sessionId: string): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`/api/sessions/${sessionId}/leave`);
  return data;
}

/** POST /api/sessions/{id}/close — only succeeds server-side if the caller is the moderator. */
export async function closeSession(sessionId: string): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(`/api/sessions/${sessionId}/close`);
  return data;
}
