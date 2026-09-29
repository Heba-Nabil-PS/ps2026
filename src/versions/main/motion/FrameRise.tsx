"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode } from "react";
import { motionGate } from "./useMotionGate";

/**
 * Work "arrives": the frame starts tilted back in perspective, narrow and
 * heavily rounded (the Agentura reference), and flattens into a full card as
 * it reaches the middle of the screen. Scrubbed, so it reverses on the way up.
 */
export function FrameRise({ children, className, frameClassName }: { children: ReactNode; className?: string; frameClassName?: string }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const frame = el?.querySelector<HTMLElement>("[data-frame]");
      if (!el || !frame) return;
      return motionGate(() => {
        gsap.fromTo(
          frame,
          { rotateX: 22, scale: 0.84, borderRadius: "5rem", yPercent: 6 },
          {
            rotateX: 0,
            scale: 1,
            borderRadius: "1.5rem",
            yPercent: 0,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "top 25%", scrub: 0.8 },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className={cn("[perspective:1400px]", className)}>
      <div data-frame className={cn("relative origin-bottom overflow-hidden rounded-[1.5rem] will-change-transform", frameClassName)}>
        {children}
      </div>
    </div>
  );
}
