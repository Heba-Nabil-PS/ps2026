"use client";

import { gsap } from "@/lib/gsap";
import { PageBackdrop } from "@/versions/main/home/PageBackdrop";
import { signalIntroReveal } from "@/versions/main/intro/intro-signal";
import { scrollMotion } from "@/versions/main/motion/scroll-motion";
import { trackPageScroll } from "@/versions/main/motion/track-page-scroll";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { useEffect } from "react";

/**
 * The logo's story behind an inner page's hero (the `[data-page-hero]` PageHero).
 * `form` and `release` are seconds and scroll fractions of the hero: the discs
 * gather into the logo shortly after the page opens (there is no long hero track
 * to scroll it together, as on the home page), then let go as the hero scrolls away.
 * `calmFrom` is the scroll, in screens, at which the page behind goes quiet.
 */
const STAGE = {
  form: { delay: 0.8, duration: 2.6 },
  release: { from: 0.2, to: 0.85 },
  calmFrom: 0.25,
} as const;

/**
 * The home page's particle logo as the backdrop of an inner page: the same field
 * (PageBackdrop), driven here instead of by the home hero (HeroSection +
 * ScrollAnimationController). Renders the backdrop; the driver below writes `scrollMotion`.
 *
 * With reduced motion the logo simply stands, formed, in the still frame.
 */
export function PageLogoStage() {
  useEffect(() => {
    // No intro covers this page, so the field may gather into view at once.
    signalIntroReveal();
    const hero = document.querySelector<HTMLElement>("[data-page-hero]");

    const stop = motionGate(
      () => {
        const stopTracking = trackPageScroll();
        scrollMotion.calmFrom = STAGE.calmFrom;

        gsap.to(scrollMotion, { form: 1, ...STAGE.form, ease: "sine.inOut" });
        if (hero) {
          // One second of this timeline is the whole hero's way out of view.
          gsap
            .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 } })
            .to(scrollMotion, { travel: 1, duration: 1 }, 0)
            .to(scrollMotion, { release: 1, duration: STAGE.release.to - STAGE.release.from, ease: "sine.inOut" }, STAGE.release.from);
        }

        return stopTracking;
      },
      () => {
        scrollMotion.form = 1;
      },
    );

    return () => {
      stop();
      scrollMotion.form = 0;
      scrollMotion.release = 0;
      scrollMotion.travel = 0;
      scrollMotion.calmFrom = null;
    };
  }, []);

  return <PageBackdrop />;
}
