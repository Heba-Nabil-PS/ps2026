"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode } from "react";
import { motionGate, showNow } from "./useMotionGate";

/**
 * Calm entrance for blocks of content: children marked `data-reveal-item`
 * (or the wrapper itself) rise 40px and fade in (transform and opacity only, so it stays on the GPU), batched so
 * rows that enter together stagger together.
 */
export function Reveal({
  children,
  className,
  as: Component = "div",
  stagger = 0.1,
  delay = 0,
  immediate = false,
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "ul" | "ol" | "dl" | "footer" | "header" | "article";
  stagger?: number;
  delay?: number;
  immediate?: boolean;
}) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const items = el.querySelectorAll<HTMLElement>("[data-reveal-item]");
      const targets: HTMLElement[] = items.length ? Array.from(items) : [el];

      return motionGate(
        () => {
          gsap.set(el, { autoAlpha: 1 });
          gsap.set(targets, { autoAlpha: 0, y: 40 });
          const play = (batch: Element[], extraDelay = 0) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              duration: 1.3,
              ease: "expo.out",
              stagger,
              delay: extraDelay,
              clearProps: "transform",
            });

          if (immediate) {
            play(targets, delay);
            return;
          }
          ScrollTrigger.batch(targets, { start: "top 90%", once: true, onEnter: (batch) => play(batch, delay) });
        },
        () => {
          showNow(el);
          showNow(targets);
        },
      );
    },
    { scope: root, dependencies: [stagger, delay, immediate] },
  );

  return (
    <Component ref={root as never} data-reveal className={cn(className)}>
      {children}
    </Component>
  );
}
