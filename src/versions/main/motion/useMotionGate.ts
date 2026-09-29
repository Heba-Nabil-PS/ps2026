"use client";

import { gsap } from "@/lib/gsap";

/**
 * Runs `animate` only when the visitor has not asked for reduced motion.
 * Otherwise `fallback` runs (default: just make the targets visible).
 * Returns a cleanup that reverts every tween and ScrollTrigger created.
 */
export function motionGate(animate: () => void, fallback?: () => void) {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", animate);
  mm.add("(prefers-reduced-motion: reduce)", () => fallback?.());
  return () => mm.revert();
}

/** Makes `[data-reveal]` elements visible without motion. */
export const showNow = (targets: gsap.TweenTarget) => gsap.set(targets, { autoAlpha: 1, clearProps: "transform" });
