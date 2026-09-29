"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { ReactLenis } from "lenis/react";
import { useMemo, type ReactNode } from "react";

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
      autoRaf: true,
    }),
    [reduced],
  );

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}
