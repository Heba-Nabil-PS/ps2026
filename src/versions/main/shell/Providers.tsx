"use client";

import { SmoothScroll } from "@/shared/motion/SmoothScroll";
import { RouteTransitionProvider } from "@/versions/main/shell/RouteTransition";
import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";

// Desktop-only enhancement; kept out of the initial bundle.
const Cursor = dynamic(() => import("@/versions/main/shell/Cursor").then((m) => m.Cursor), { ssr: false });

/** Smooth scrolling (Lenis), glass page transitions and the cursor. Framer Motion honours reduced motion. */
export function Providers({ children }: { children: ReactNode }) {
  // Tells the safety net in the root layout that the app started (see layout.tsx).
  useEffect(() => {
    (window as Window & { __psReady?: boolean }).__psReady = true;
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <RouteTransitionProvider>
          {children}
          <Cursor />
        </RouteTransitionProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
