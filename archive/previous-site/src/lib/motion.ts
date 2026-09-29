import type { Transition } from "framer-motion";

/** Single source of truth for easing + timing across the site. */
export const ease = {
  expo: [0.19, 1, 0.22, 1],
  quart: [0.76, 0, 0.24, 1],
  out: [0.22, 1, 0.36, 1],
} as const satisfies Record<string, [number, number, number, number]>;

export const duration = {
  fast: 0.35,
  base: 0.8,
  slow: 1.2,
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
