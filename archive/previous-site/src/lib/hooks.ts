"use client";

import { useCallback, useSyncExternalStore } from "react";

/** SSR-safe matchMedia subscription (false on the server). */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Desktop-class pointer: a mouse or trackpad that can hover. */
export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

/**
 * prefers-reduced-motion, hydration-safe: always false during SSR + hydration,
 * then updates, so server and client markup never mismatch.
 */
export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

/** Rich, pointer-driven interactions are enabled only for fine pointers without reduced motion. */
export function useRichInteractions() {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  return fine && !reduced;
}
