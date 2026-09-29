"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroReveal } from "@/versions/main/intro/intro-signal";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { ButtonLink } from "@/versions/main/ui/Button";
import { Label } from "@/versions/main/ui/Label";
import { useCopy } from "@/versions/main/use-copy";
import dynamic from "next/dynamic";
import { useRef } from "react";

// The canvas field is decoration: kept out of the server render and the first bundle.
const AnimatedBackground = dynamic(() => import("@/versions/main/home/AnimatedBackground").then((m) => m.AnimatedBackground), { ssr: false });

/**
 * Home hero — the first screen after the intro opens.
 *
 * A quiet eyebrow, then the brand line set large and revealed word by word from
 * below its baseline, the supporting line, and the two actions last. Behind it,
 * the flowing-line field (AnimatedBackground) keeps moving slowly. The entrance
 * waits for the intro (see intro-signal) so the two play as one sequence; with
 * reduced motion everything is simply there.
 */
export function Hero() {
  const { copy } = useCopy();
  const hero = copy.home.hero;
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current) return;
      return motionGate(() => {
        const entrance = gsap
          .timeline({ paused: true })
          // y is pinned to 0: GSAP would otherwise read the CSS starting offset as pixels and keep it.
          .fromTo("[data-hero-word]", { y: 0, yPercent: 110, opacity: 0 }, { y: 0, yPercent: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.09 }, 0)
          .fromTo("[data-hero-fade='eyebrow']", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out" }, 0.1)
          .fromTo("[data-hero-fade='intro']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 0.75)
          .fromTo("[data-hero-fade='cta']", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, 1.05);
        const unsubscribe = onIntroReveal(() => entrance.play());

        // Scrolling away lifts the headline and lets the details go first.
        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: 0.8 } })
          .to("[data-hero-title]", { yPercent: -16, ease: "none" }, 0)
          .to("[data-hero-details]", { y: -60, opacity: 0, ease: "none" }, 0);

        return unsubscribe;
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="gutter relative isolate flex min-h-svh flex-col overflow-hidden pb-10 pt-32 md:pb-12 md:pt-36">
      {/* A soft light behind the waist of the flow, then the flow itself, faded at the top and bottom edges. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(55%_50%_at_68%_48%,rgb(33_66_106/0.55),transparent_70%)]" />
      <div aria-hidden className="absolute inset-0 -z-10 mask-[linear-gradient(180deg,transparent,black_16%,black_72%,transparent)]">
        <AnimatedBackground />
      </div>

      <div data-hero-fade="eyebrow">
        <Label>{hero.eyebrow}</Label>
      </div>

      <h1 data-hero-title className="stretch mt-auto pt-16 text-[clamp(2rem,7.2vw,8.5rem)] leading-[0.92] ar:leading-[1.15]">
        {hero.title.map((line, lineIndex) => (
          <span key={line} className={lineIndex === 1 ? "block text-sky" : "block"}>
            {line.split(" ").map((word, wordIndex) => (
              <span key={`${word}-${wordIndex}`}>
                {wordIndex > 0 ? " " : null}
                {/* The clip lets each word rise from below its own baseline. */}
                <span className="inline-block overflow-hidden pb-[0.1em] align-top ar:pb-[0.2em]">
                  <span data-hero-word className="inline-block will-change-transform">
                    {word}
                  </span>
                </span>
              </span>
            ))}
          </span>
        ))}
      </h1>

      <div data-hero-details className="mt-10 grid items-end gap-8 md:mt-14 md:grid-cols-12">
        <p data-hero-fade="intro" className="text-lead max-w-md text-muted md:col-span-6 lg:col-span-5">
          {hero.intro}
        </p>
        <div data-hero-fade="cta" className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7">
          <ButtonLink href="/work" transitionLabel={copy.meta.pages.work.title}>
            {hero.primary}
          </ButtonLink>
          <ButtonLink href="/services" variant="glass" transitionLabel={copy.meta.pages.services.title}>
            {hero.secondary}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
