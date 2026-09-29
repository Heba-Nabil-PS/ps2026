"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { useSound } from "@/versions/option-2/components/sound/SoundProvider";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type Transit = { href: string; from: string; label: string };

type TransitionContextValue = {
  navigate: (href: string, label?: string) => void;
  /** False while the transition layer is covering the screen. */
  ready: boolean;
};

const TransitionContext = createContext<TransitionContextValue>({
  navigate: () => {},
  ready: true,
});

const COVER = 0.38;
const REVEAL = 0.42;
const OFFSET = 0.06;

const accentLayer: Variants = {
  idle: { y: "100%", transition: { duration: 0 } },
  cover: { y: "0%", transition: { duration: COVER, ease: ease.quart } },
  reveal: { y: "-100%", transition: { duration: REVEAL, ease: ease.quart, delay: OFFSET } },
};

const surfaceLayer: Variants = {
  idle: { y: "100%", transition: { duration: 0 } },
  cover: { y: "0%", transition: { duration: COVER, ease: ease.quart, delay: OFFSET } },
  reveal: { y: "-100%", transition: { duration: REVEAL, ease: ease.quart } },
};

/**
 * Link-driven page transitions:
 * current page → layers sweep up → route change (while covered) → layers exit → new content reveals.
 * Works for every route, including /projects → /projects/[slug], where a
 * root template.tsx would not remount. Back/forward navigation stays instant.
 */
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const { play } = useSound();
  const [transit, setTransit] = useState<Transit | null>(null);

  const arrived = transit !== null && pathname !== transit.from;
  const phase = transit === null ? "idle" : arrived ? "reveal" : "cover";

  const navigate = useCallback(
    (href: string, label = "") => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) {
        window.location.assign(href);
        return;
      }
      if (url.pathname === pathname) {
        const target = url.hash ? document.querySelector<HTMLElement>(url.hash) : null;
        if (lenis) lenis.scrollTo(target ?? 0, { force: true, duration: 1.4 });
        else if (target) target.scrollIntoView();
        else window.scrollTo(0, 0);
        return;
      }
      if (transit) return;

      play("transition");
      if (reduced) {
        router.push(href);
        return;
      }
      setTransit({ href, from: pathname, label });
    },
    [lenis, pathname, play, reduced, router, transit],
  );

  const onSurfaceComplete = (definition: unknown) => {
    if (!transit) return;
    if (definition === "cover") {
      // Screen is fully covered: reset scroll invisibly, then swap the route.
      lenis?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
      router.push(transit.href);
    }
  };

  const onAccentComplete = (definition: unknown) => {
    if (definition === "reveal") setTransit(null);
  };

  const value = useMemo(() => ({ navigate, ready: transit === null || arrived }), [navigate, transit, arrived]);

  return (
    <TransitionContext.Provider value={value}>
      {children}
      <div
        aria-hidden
        className={cn("fixed inset-0 z-[80] overflow-hidden", transit ? "pointer-events-auto" : "pointer-events-none invisible")}
      >
        <motion.div
          className="absolute inset-0 bg-accent will-change-transform"
          variants={accentLayer}
          initial={false}
          animate={phase}
          onAnimationComplete={onAccentComplete}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center bg-surface will-change-transform"
          variants={surfaceLayer}
          initial={false}
          animate={phase}
          onAnimationComplete={onSurfaceComplete}
        >
          {transit?.label ? <span className="text-label text-muted">{transit.label}</span> : null}
        </motion.div>
      </div>
    </TransitionContext.Provider>
  );
}

export function usePageTransition() {
  return useContext(TransitionContext);
}

/**
 * For entrance animations: components that mount while the page is covered wait
 * for the reveal; components already on screen are never re-hidden.
 */
export function usePageReady() {
  const { ready } = useContext(TransitionContext);
  const [mountedWhileCovered] = useState(() => !ready);
  return ready || !mountedWhileCovered;
}
