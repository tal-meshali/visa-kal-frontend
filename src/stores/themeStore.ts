import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "light" | "dark";

const syncThemeToDom = (theme: Theme): void => {
  document.documentElement.setAttribute("data-theme", theme);
};

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme: Theme) => {
        syncThemeToDom(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next: Theme = get().theme === "light" ? "dark" : "light";
        get().setTheme(next);
      },
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ theme: state.theme }),
    },
  ),
);

export const syncThemeToDomFromStore = (): void => {
  syncThemeToDom(useThemeStore.getState().theme);
};
