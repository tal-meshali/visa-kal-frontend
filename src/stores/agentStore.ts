import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AgentState {
  agentId: string | null;
  setAgentId: (id: string) => void;
  clearAgentId: () => void;
  getAgentId: () => string | null;
}

export const useAgentStore = create<AgentState>()(
  persist(
    (set, get) => ({
      agentId: null,
      setAgentId: (id: string) => set({ agentId: id }),
      clearAgentId: () => set({ agentId: null }),
      getAgentId: () => get().agentId,
    }),
    {
      name: "agent-id-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ agentId: state.agentId }),
    },
  ),
);
