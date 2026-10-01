"use client";

import { gsap } from "@/lib/gsap";
import { HERO_SCREENS, HERO_STATES, scrollMotion } from "@/versions/main/motion/scroll-motion";
import { trackPageScroll } from "@/versions/main/motion/track-page-scroll";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { useEffect, type RefObject } from "react";

/**
 * Ties the home page's animation to the scroll, with GSAP ScrollTrigger. It
 * writes to `scrollMotion`, which the background reads each frame, and renders nothing.
 *
 * - A page-wide trigger records how far the page has scrolled (in screens) and
 *   how fast: the floating discs ride and turn with it everywhere on the page.
 * - A timeline scrubbed from the top of the hero (`target`) on through the sections after it plays the particle logo's
 *   four states: floating → forming → the formed logo travelling → breaking
 *   apart. It is laid out in screens of scroll (HERO_STATES), and scrubbing back
 *   up plays it in reverse.
 * - A second timeline, across the hero's first screen (`[data-hero-content]`),
 *   lifts the headline away and lets the details go first, clearing the view for the logo.
 *
 * With reduced motion none of this runs and the store stays at rest.
 */
export function ScrollAnimationController({ target }: { target: RefObject<HTMLElement | null> }) {
  useEffect(() => {
    const root = target.current;
    if (!root) return;

    return motionGate(() => {
      const stopTracking = trackPageScroll();

      // Runs from the top of the page for HERO_SCREENS screens (past the hero, behind the sections after it),
      // so one second of this timeline is one screen of scroll.
      gsap
        .timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: () => `+=${HERO_SCREENS * window.innerHeight}`,
            invalidateOnRefresh: true,
            scrub: 0.8,
            onUpdate: (self) => {
              scrollMotion.progress = self.progress;
            },
          },
        })
        .addLabel("floating", 0)
        .to(scrollMotion, { form: 1, duration: HERO_STATES.form.screens, ease: "sine.inOut" }, HERO_STATES.form.at)
        .addLabel("formed")
        .to(scrollMotion, { travel: 1, duration: HERO_SCREENS }, 0)
        .addLabel("breaking", HERO_STATES.release.at)
        .to(scrollMotion, { release: 1, duration: HERO_STATES.release.screens, ease: "sine.inOut" }, "breaking");

      const content = root.querySelector("[data-hero-content]") ?? root;
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: content, start: "top top", end: "bottom top", scrub: 0.8 } })
        .to(root.querySelectorAll("[data-hero-title]"), { yPercent: -18, duration: 1 }, 0)
        .to(root.querySelectorAll("[data-hero-title]"), { opacity: 0, duration: 0.45 }, 0.35)
        .to(root.querySelectorAll("[data-hero-details]"), { y: -60, opacity: 0, duration: 0.6 }, 0)
        .to(root.querySelectorAll("[data-hero-fade='eyebrow']"), { opacity: 0, duration: 0.5 }, 0);

      return () => {
        stopTracking();
        scrollMotion.progress = 0;
        scrollMotion.form = 0;
        scrollMotion.release = 0;
        scrollMotion.travel = 0;
      };
    });
  }, [target]);

  return null;
}
