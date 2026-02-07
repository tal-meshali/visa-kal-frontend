import { create } from "zustand";
import type { ContrastMode } from "../types/accessibility";

export type FontSizeValue = "100" | "110" | "125" | "150";

const syncContrastToDom = (contrast: ContrastMode): void => {
  const html = document.documentElement;
  if (contrast === "standard") {
    html.removeAttribute("data-contrast");
  } else {
    html.setAttribute("data-contrast", contrast);
  }
};

const syncFontSizeToDom = (fontSize: FontSizeValue): void => {
  document.documentElement.setAttribute("data-font-size", fontSize);
};

const syncReduceMotionToDom = (value: boolean): void => {
  const html = document.documentElement;
  if (value) {
    html.setAttribute("data-reduce-motion", "true");
  } else {
    html.removeAttribute("data-reduce-motion");
  }
};

const syncMonochromeToDom = (value: boolean): void => {
  const html = document.documentElement;
  if (value) {
    html.setAttribute("data-monochrome", "true");
  } else {
    html.removeAttribute("data-monochrome");
  }
};

interface AccessibilityState {
  contrastMode: ContrastMode;
  fontSize: FontSizeValue;
  reduceMotion: boolean;
  monochrome: boolean;
  setContrastMode: (value: ContrastMode) => void;
  setFontSize: (value: FontSizeValue) => void;
  setReduceMotion: (value: boolean) => void;
  setMonochrome: (value: boolean) => void;
}

export const useAccessibilityStore = create<AccessibilityState>((set) => ({
  contrastMode: "standard",
  fontSize: "100",
  reduceMotion: false,
  monochrome: false,
  setContrastMode: (value: ContrastMode) => {
    syncContrastToDom(value);
    set({ contrastMode: value });
  },
  setFontSize: (value: FontSizeValue) => {
    syncFontSizeToDom(value);
    set({ fontSize: value });
  },
  setReduceMotion: (value: boolean) => {
    syncReduceMotionToDom(value);
    set({ reduceMotion: value });
  },
  setMonochrome: (value: boolean) => {
    syncMonochromeToDom(value);
    set({ monochrome: value });
  },
}));

export const syncAccessibilityToDomFromStore = (): void => {
  const state = useAccessibilityStore.getState();
  syncContrastToDom(state.contrastMode);
  syncFontSizeToDom(state.fontSize);
  syncReduceMotionToDom(state.reduceMotion);
  syncMonochromeToDom(state.monochrome);
};
