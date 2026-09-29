"use client";

import type { TextComponent, TextTag } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef, type ReactNode } from "react";

type Variant = "up" | "fade" | "left" | "scale" | "clip";

const variants: Record<Variant, [gsap.TweenVars, gsap.TweenVars]> = {
  up: [{ y: 64, opacity: 0 }, { y: 0, opacity: 1 }],
  fade: [{ opacity: 0 }, { opacity: 1 }],
  left: [{ x: -40, opacity: 0 }, { x: 0, opacity: 1 }],
  scale: [{ scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1 }],
  // No scale here: wrappers can be full-bleed, and scaling above 1 would widen the page.
  clip: [{ clipPath: "inset(16% 10% 16% 10%)" }, { clipPath: "inset(0% 0% 0% 0%)" }],
};

type ScrollRevealProps = {
  children: ReactNode;
  as?: TextTag;
  className?: string;
  variant?: Variant;
  /** Animate matching descendants in sequence instead of the wrapper itself. */
  targets?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
};

/** GSAP ScrollTrigger reveal. Reduced motion collapses every variant to a short fade. */
export function ScrollReveal({
  children,
  as: tag = "div",
  className,
  variant = "up",
  targets,
  delay = 0,
  stagger = 0.08,
  duration = 1.3,
  start = "top 85%",
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const Tag = tag as unknown as TextComponent;
  const reduced = usePrefersReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;
      const items = targets ? gsap.utils.toArray<HTMLElement>(targets, root) : [root];
      if (!items.length) return;
      const [from, to] = reduced ? variants.fade : variants[variant];
      gsap.fromTo(items, from, {
        ...to,
        delay,
        stagger,
        duration: reduced ? 0.4 : duration,
        ease: reduced ? "none" : "expo.out",
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    { scope: ref, dependencies: [reduced, variant, targets], revertOnUpdate: true },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
