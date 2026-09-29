import type { Transition } from "framer-motion";

/**
 * Motion tokens (docs/website-direction.md §6). "Light moves through glass":
 * things resolve — blur to sharp, condensed to stretched, dark to lit.
 * GSAP equivalents: "expo.out" and "power3.inOut" / CustomEase-free "glass".
 */
export const ease = {
  /** Every entrance. */
  expo: [0.19, 1, 0.22, 1],
  /** Wipes, flutes and frame changes: one state to another. */
  glass: [0.65, 0, 0.35, 1],
  quart: [0.76, 0, 0.24, 1],
  out: [0.22, 1, 0.36, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const duration = {
  hover: 0.5,
  fast: 0.35,
  base: 0.9,
  slow: 1.4,
} as const;

export const springs = {
  cursor: { stiffness: 500, damping: 40, mass: 0.5 },
  magnetic: { stiffness: 180, damping: 18, mass: 0.3 },
  soft: { stiffness: 120, damping: 22, mass: 0.6 },
} as const;

export const revealTransition = (delay = 0): Transition => ({
  duration: duration.base,
  ease: ease.expo,
  delay,
});

/** GSAP-side easing names, so timelines read the same as the tokens above. */
export const gsapEase = {
  expo: "expo.out",
  glass: "power3.inOut",
} as const;
