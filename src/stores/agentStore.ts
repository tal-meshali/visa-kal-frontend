import { create } from "zustand";

interface AgentState {
  agentId: string | null;
  setAgentId: (id: string) => void;
  clearAgentId: () => void;
  getAgentId: () => string | null;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  agentId: null,
  setAgentId: (id: string) => set({ agentId: id }),
  clearAgentId: () => set({ agentId: null }),
  getAgentId: () => get().agentId,
}));
