import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  closeSession,
  createSession,
  getMySessions,
  getParticipants,
  getSession,
  getSessionByCode,
  joinSession,
  leaveSession,
} from "@/api/sessionApi";
import { getApiErrorMessage } from "@/api/axiosClient";
import type { CreateSessionRequest, JoinSessionRequest } from "@/types/session.types";

export function useCreateSession() {
  return useMutation({
    mutationFn: (payload: CreateSessionRequest) => createSession(payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not create the session."));
    },
  });
}

/**
 * The backend patch made POST /join return the full SessionResponse, so
 * this hook (and the page that uses it) can now navigate straight into
 * the room — the "ask your moderator for the link" workaround is gone.
 */
export function useJoinSession() {
  return useMutation({
    mutationFn: (payload: JoinSessionRequest) => joinSession(payload),
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not join that session."));
    },
  });
}

export function useSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", sessionId],
    queryFn: () => getSession(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useSessionByCode(sessionCode: string | undefined) {
  return useQuery({
    queryKey: ["sessions", "by-code", sessionCode],
    queryFn: () => getSessionByCode(sessionCode as string),
    enabled: Boolean(sessionCode),
  });
}

/** Replaces the old localStorage-based "recent sessions" workaround now that the backend supports it for real. */
export function useMySessions() {
  return useQuery({
    queryKey: ["sessions", "mine"],
    queryFn: () => getMySessions(),
  });
}

export function useParticipants(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["sessions", sessionId, "participants"],
    queryFn: () => getParticipants(sessionId as string),
    enabled: Boolean(sessionId),
  });
}

export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => leaveSession(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions", sessionId] });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Could not leave the session."));
    },
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => closeSession(sessionId),
    onSuccess: (_data, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ["sessions", sessionId] });
      toast.success("Session closed.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "Only the moderator can close this session."));
    },
  });
}
