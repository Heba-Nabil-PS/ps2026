"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { ease } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, startTransition, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type Navigate = (href: string, label?: string) => void;

const TransitionContext = createContext<Navigate>(() => {});

export const useRouteTransition = () => useContext(TransitionContext);

const FLUTES = 10;

type State = { phase: "idle" } | { phase: "covering" | "covered"; href: string; from: string; label?: string };

/**
 * Page transitions as reeded glass (principle P1): ten flutes rise over the
 * page from the centre outward, the destination's name stretches in, the
 * route changes behind the glass, then the flutes lift away. Reduced motion
 * navigates directly.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const [state, setState] = useState<State>({ phase: "idle" });
  const fallback = useRef<number | undefined>(undefined);

  const navigate = useCallback<Navigate>(
    (href, label) => {
      const target = new URL(href, window.location.href);
      const samePage = target.pathname === window.location.pathname;
      if (samePage && target.hash) {
        const el = document.getElementById(decodeURIComponent(target.hash.slice(1)));
        window.history.pushState(null, "", target.hash);
        if (el && lenis) lenis.scrollTo(el, { offset: -96 });
        else el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (samePage) {
        lenis?.scrollTo(0);
        return;
      }
      if (reduced) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      setState({ phase: "covering", href, from: window.location.pathname, label });
    },
    [router, lenis, reduced],
  );

  const onCovered = useCallback(() => {
    if (state.phase !== "covering") return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    setState({ ...state, phase: "covered" });
    startTransition(() => router.push(state.href, { scroll: false }));
    // Never leave the glass up if the route does not change (e.g. an error).
    window.clearTimeout(fallback.current);
    fallback.current = window.setTimeout(() => setState({ phase: "idle" }), 5000);
  }, [state, lenis, router]);

  useEffect(() => () => window.clearTimeout(fallback.current), []);

  // The new route has rendered once the pathname differs from where we started.
  const arrived = state.phase === "covered" && pathname !== state.from;
  const targetHash = state.phase === "covered" ? new URL(state.href, "http://x").hash : "";

  // Deep links such as /services#branding land on their anchor behind the glass.
  useEffect(() => {
    if (!arrived || !targetHash) return;
    const el = document.getElementById(decodeURIComponent(targetHash.slice(1)));
    if (el) lenis?.scrollTo(el, { immediate: true, force: true, offset: -96 });
  }, [arrived, targetHash, lenis]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <AnimatePresence>
        {state.phase !== "idle" ? (
          <GlassCurtain
            key="curtain"
            label={state.label}
            arrived={arrived}
            onCovered={onCovered}
            onDone={() => {
              window.clearTimeout(fallback.current);
              setState({ phase: "idle" });
            }}
          />
        ) : null}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}

function GlassCurtain({ label, arrived, onCovered, onDone }: { label?: string; arrived: boolean; onCovered: () => void; onDone: () => void }) {
  const centre = (FLUTES - 1) / 2;

  return (
    <div aria-hidden className="pointer-events-auto fixed inset-0 z-80 flex">
      {Array.from({ length: FLUTES }, (_, index) => {
        // Flutes open from the centre outward; the outermost (index 0) finishes last.
        const delay = Math.abs(index - centre) * 0.045;
        const last = index === 0;
        return (
          <motion.div
            key={index}
            className="relative h-full flex-1 bg-ink-900"
            style={{
              transformOrigin: arrived ? "50% 0%" : "50% 100%",
              backgroundImage:
                "linear-gradient(90deg, rgb(140 196 230 / 0.10) 0%, rgb(255 255 255 / 0.02) 18%, transparent 50%, rgb(0 0 0 / 0.35) 100%)",
              marginInlineEnd: -1,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: arrived ? 0 : 1 }}
            transition={{ duration: arrived ? 0.8 : 0.65, ease: ease.glass, delay: arrived ? 0.1 + delay : delay }}
            onAnimationComplete={() => {
              if (!last) return;
              if (arrived) onDone();
              else onCovered();
            }}
          />
        );
      })}
      {label ? (
        <motion.p
          className="stretch text-headline pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-fg"
          initial={{ opacity: 0, "--wdth": 60 } as never}
          animate={(arrived ? { opacity: 0, "--wdth": 150 } : { opacity: 1, "--wdth": 125 }) as never}
          transition={{ duration: arrived ? 0.4 : 0.9, ease: ease.expo, delay: arrived ? 0 : 0.25 }}
        >
          <span data-line className="block">
            {label}
          </span>
        </motion.p>
      ) : null}
    </div>
  );
}
