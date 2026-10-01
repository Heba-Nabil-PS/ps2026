import type { gsap } from "@/lib/gsap";
import type { ComponentType } from "react";

/**
 * A scene appends its short story to the universe's master timeline, starting
 * at `at` (when its card reaches the front) and lasting `len` units. Scenes
 * render their final state in markup, so with reduced motion they are simply
 * finished; the builder sets the starting state with `fromTo`, which also
 * resets cleanly when the scroll runs backwards.
 */
export type SceneBuild = (tl: gsap.core.Timeline, root: HTMLElement, at: number, len: number) => void;

export type SceneDef = {
  Scene: ComponentType;
  build: SceneBuild;
  /** The floor light under the card while it is in front. Highlights inside scenes stay sky. */
  glow: string;
};

/** `at + len * t`: a moment inside the story. */
export const moment = (at: number, len: number) => (t: number) => at + len * t;
