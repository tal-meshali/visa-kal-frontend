import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CookieConsentStatus = "accepted" | "refused" | null;

interface CookieConsentState {
  status: CookieConsentStatus;
  setAccepted: () => void;
  setRefused: () => void;
  reset: () => void;
  hasChoiceMade: () => boolean;
  hasConsent: () => boolean;
  hasRefused: () => boolean;
}

export const useCookieConsentStore = create<CookieConsentState>()(
  persist(
    (set, get) => ({
      status: null,
      reset: () => set({ status: null }),
      setAccepted: () => set({ status: "accepted" }),
      setRefused: () => set({ status: "refused" }),
      hasChoiceMade: () => get().status !== null,
      hasConsent: () => get().status === "accepted",
      hasRefused: () => get().status === "refused",
    }),
    {
      name: "cookie-consent-store",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
