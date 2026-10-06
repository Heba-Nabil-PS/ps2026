"use client";

import { ScrollTrigger } from "@/lib/gsap";
import { SmoothScroll } from "@/shared/motion/SmoothScroll";
import { RouteTransitionProvider } from "@/versions/main/shell/RouteTransition";
import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";

// Desktop-only enhancement; kept out of the initial bundle.
const Cursor = dynamic(() => import("@/versions/main/shell/Cursor").then((m) => m.Cursor), { ssr: false });

/** Smooth scrolling (Lenis), page transitions and the cursor. Framer Motion honours reduced motion. */
export function Providers({ children }: { children: ReactNode }) {
  // Tells the safety net in the root layout that the app started (see layout.tsx).
  useEffect(() => {
    (window as Window & { __psReady?: boolean }).__psReady = true;
  }, []);

  // When the page grows or shrinks after load (a filtered list, images arriving on a slow phone, an accordion),
  // every scroll trigger below the change is measured against the old layout and fires late or never, leaving
  // content hidden as blank space. Re-measure once the height settles.
  useEffect(() => {
    let height = document.body.scrollHeight;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      const next = document.body.scrollHeight;
      if (Math.abs(next - height) < 2) return;
      height = next;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        ScrollTrigger.refresh();
        height = document.body.scrollHeight;
      }, 200);
    });
    observer.observe(document.body);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
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
