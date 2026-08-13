import { create } from "zustand";
import type { HubConnectionState } from "@microsoft/signalr";

interface ConnectionState {
  status: HubConnectionState | "Idle";
  setStatus: (status: HubConnectionState) => void;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: "Idle",
  setStatus: (status) => set({ status }),
}));
