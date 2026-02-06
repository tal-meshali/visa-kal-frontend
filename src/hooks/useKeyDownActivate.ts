import { useCallback } from "react";
import type { KeyboardEvent } from "react";

export const DEFAULT_ACTIVATE_KEYS = ["Enter", " "] as const;

export type UseKeyDownActivateOptions = {
  /** Keys that trigger the callback (default: Enter and Space). Prefer a stable array. */
  keys?: readonly string[];
};

/**
 * Returns a plain onKeyDown handler (no hook). Use in callbacks or loops
 * where hooks cannot be used (e.g. inside .map()).
 */
export function getKeyDownActivateHandler(
  onActivate: () => void,
  options: UseKeyDownActivateOptions = {}
): (e: KeyboardEvent) => void {
  const keys = options.keys ?? DEFAULT_ACTIVATE_KEYS;
  return (e: KeyboardEvent) => {
    if (keys.includes(e.key)) {
      e.preventDefault();
      onActivate();
    }
  };
}

/**
 * Returns an onKeyDown handler that calls the callback when one of the
 * configured keys is pressed (default: Enter and Space). Calls preventDefault
 * when the key matches.
 */
export function useKeyDownActivate(
  onActivate: () => void,
  options: UseKeyDownActivateOptions = {}
): (e: KeyboardEvent) => void {
  const keys = options.keys ?? DEFAULT_ACTIVATE_KEYS;
  return useCallback(
    (e: KeyboardEvent) => {
      if (keys.includes(e.key)) {
        e.preventDefault();
        onActivate();
      }
    },
    [onActivate, keys]
  );
}
