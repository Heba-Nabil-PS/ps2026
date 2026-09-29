"use client";

import { PillButton } from "@/components/studio/PillButton";
import { ReelMedia } from "@/components/studio/ReelMedia";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

/**
 * Statement paragraph whose words ink in as you scroll, followed by the
 * showreel card that grows from an inset frame into a full-bleed stage.
 */
export function StudioIntro() {
  const { studioHome, t } = useContent();
  const { intro, reel } = studioHome;
  const section = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);
  const reelTrack = useRef<HTMLDivElement>(null);
  const reelFrame = useRef<HTMLDivElement>(null);

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Words ink in from grey to black while the paragraph crosses the viewport.
        const split = SplitText.create(statement.current, { type: "words", autoSplit: true });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: statement.current, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );

        gsap.from("[data-intro-fade]", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 75%", once: true },
        });

        // Showreel: inset rounded frame → full-bleed, while the image settles.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: reelTrack.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        tl.fromTo(
          reelFrame.current,
          { clipPath: "inset(22% 30% 22% 30% round 28px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut" },
        )
          .fromTo("[data-reel-media]", { scale: 1.35 }, { scale: 1, ease: "power2.inOut" }, 0)
          .fromTo("[data-reel-label='left']", { xPercent: 0 }, { xPercent: -60, ease: "power2.inOut" }, 0)
          .fromTo("[data-reel-label='right']", { xPercent: 0 }, { xPercent: 60, ease: "power2.inOut" }, 0)
          .to("[data-reel-label]", { opacity: 0, ease: "power1.in" }, 0.35);

        return () => split.revert();
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="intro-label" className="relative bg-[#eceef2] text-[#0b0c0e]">
      <div className="grid grid-cols-1 gap-10 px-4 pb-24 pt-28 md:grid-cols-12 md:px-8 md:pb-40 md:pt-44">
        <p id="intro-label" data-intro-fade className="text-label flex items-center gap-2 text-black/50 md:col-span-3">
          <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
          {intro.label}
        </p>
        <div className="md:col-span-9">
          <p
            ref={statement}
            className="font-medium tracking-[-0.035em] text-[clamp(1.75rem,4.1vw,4.4rem)] leading-[1.08]"
          >
            {intro.statement}
          </p>
          <div data-intro-fade className="mt-12 md:mt-16">
            <PillButton href={intro.cta.href}>{intro.cta.label}</PillButton>
          </div>
        </div>
      </div>

      {/* Pinned showreel — 220vh of scroll drives the expansion */}
      <div ref={reelTrack} className="relative h-[220vh]">
        <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
          <div
            ref={reelFrame}
            className="absolute inset-0 overflow-hidden bg-[#0b0c0e]"
            style={{ clipPath: "inset(22% 30% 22% 30% round 28px)" }}
            data-cursor="view"
            data-cursor-label={reel.label}
          >
            <div data-reel-media className="absolute inset-0 will-change-transform">
              <ReelMedia video={reel.video} slides={reel.slides} />
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
          </div>

          <div
            aria-hidden
            className="pointer-events-none relative flex w-full items-center justify-between px-4 font-medium tracking-[-0.05em] text-white mix-blend-difference text-[clamp(2.5rem,8vw,8.5rem)] md:px-8"
          >
            <span data-reel-label="left">{t.studio.play}</span>
            <span data-reel-label="right">{t.studio.reel}</span>
          </div>

          <p className="text-label absolute bottom-6 start-4 text-white/80 md:start-8">
            {reel.label} — {reel.year}
          </p>
        </div>
      </div>
    </section>
  );
}
