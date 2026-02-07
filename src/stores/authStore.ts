import { create } from "zustand";

interface AuthTokenState {
  token: string | null;
  setToken: (newToken: string | null) => void;
}

export const useAuthStore = create<AuthTokenState>((set) => ({
  token: null,
  setToken: (newToken: string | null) => {
    set({ token: newToken });
  },
}));
