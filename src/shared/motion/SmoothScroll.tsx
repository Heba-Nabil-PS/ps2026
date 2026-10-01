"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { ReactLenis, useLenis } from "lenis/react";
import { useEffect, useMemo, type ReactNode } from "react";

/**
 * Global Lenis instance on the window scroller, so native scroll events,
 * Framer Motion's useScroll and sticky positioning all keep working.
 * Touch devices keep native momentum scrolling; reduced motion disables smoothing.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion();

  const options = useMemo(
    () => ({
      lerp: 0.1,
      smoothWheel: !reduced,
      syncTouch: false,
      anchors: true,
      stopInertiaOnNavigate: true,
      // Driven by GSAP's ticker instead (see TickerSync).
      autoRaf: false,
    }),
    [reduced],
  );

  return (
    <ReactLenis root options={options}>
      <TickerSync />
      {children}
    </ReactLenis>
  );
}

/**
 * Runs Lenis on GSAP's ticker and tells ScrollTrigger the moment it scrolls: one clock
 * for both, so scrubbed and pinned sections move on the same frame as the page instead
 * of a frame behind it (which reads as stutter).
 */
function TickerSync() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    const raf = (time: number) => lenis.raf(time * 1000);
    const offScroll = lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(raf);
    // A slow frame must not make the scroll and the scrubs jump to catch up.
    gsap.ticker.lagSmoothing(0);
    // Mobile toolbars showing and hiding resize the viewport; refreshing for that jolts the page.
    ScrollTrigger.config({ ignoreMobileResize: true });
    return () => {
      gsap.ticker.remove(raf);
      offScroll();
    };
  }, [lenis]);

  return null;
}
