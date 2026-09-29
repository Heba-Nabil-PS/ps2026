"use client";

import { usePageReady } from "@/components/animations/PageTransition";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type HeaderTheme = "light" | "dark";

type StudioContextValue = {
  /** True once the preloader has left the screen — entrance animations key off this. */
  introDone: boolean;
  completeIntro: () => void;
  /** Theme of the section currently under the header. */
  headerTheme: HeaderTheme;
  setHeaderTheme: (theme: HeaderTheme) => void;
};

const StudioContext = createContext<StudioContextValue>({
  introDone: true,
  completeIntro: () => {},
  headerTheme: "light",
  setHeaderTheme: () => {},
});

/**
 * Runtime for the immersive home: keeps ScrollTrigger in sync with Lenis,
 * refreshes triggers once fonts land, and shares intro / header state.
 */
export function StudioProvider({ children }: { children: ReactNode }) {
  const pageReady = usePageReady();
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<HeaderTheme>("light");

  useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, []);

  const completeIntro = useCallback(() => setPreloaderDone(true), []);
  const introDone = preloaderDone && pageReady;

  const value = useMemo(
    () => ({ introDone, completeIntro, headerTheme, setHeaderTheme }),
    [introDone, completeIntro, headerTheme],
  );

  return (
    <StudioContext.Provider value={value}>
      <div className="studio">{children}</div>
    </StudioContext.Provider>
  );
}

export function useStudio() {
  return useContext(StudioContext);
}
