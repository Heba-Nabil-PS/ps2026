"use client";

import { PageTransitionProvider } from "@/components/animations/PageTransition";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SoundProvider } from "@/components/sound/SoundProvider";
import { MotionConfig } from "framer-motion";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";

// The cursor is desktop-only enhancement — keep it out of the initial bundle.
const CustomCursor = dynamic(() => import("@/components/cursor/CustomCursor").then((m) => m.CustomCursor), {
  ssr: false,
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <SoundProvider>
          <PageTransitionProvider>
            {children}
            <CustomCursor />
          </PageTransitionProvider>
        </SoundProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
