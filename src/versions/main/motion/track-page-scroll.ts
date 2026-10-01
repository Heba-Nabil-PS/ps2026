"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollMotion } from "@/versions/main/motion/scroll-motion";

/**
 * Records how far the page has scrolled (in screens) and how fast into `scrollMotion`,
 * so the floating discs ride and turn with the scroll. Returns the cleanup, which also
 * puts both back to rest. Call it inside `motionGate`.
 */
export function trackPageScroll() {
  const page = ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      scrollMotion.page = self.scroll() / window.innerHeight;
    },
  });
  scrollMotion.page = page.scroll() / window.innerHeight;
  // Sampled every tick rather than on scroll, so it returns to 0 once the scroll settles.
  const tick = () => {
    scrollMotion.velocity = page.getVelocity();
  };
  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    page.kill();
    scrollMotion.page = 0;
    scrollMotion.velocity = 0;
  };
}
