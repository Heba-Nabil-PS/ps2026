"use client";

import { SplitReveal } from "@/versions/option-2/components/studio/SplitReveal";
import { useStudio } from "@/versions/option-2/components/studio/StudioProvider";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { hasWebGL, useCanvasActive } from "@/versions/option-2/components/studio/webgl/useCanvasActive";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const HeroScene = dynamic(() => import("@/versions/option-2/components/studio/webgl/HeroScene"), { ssr: false });

export function StudioHero() {
  const { hero } = useContent().studioHome;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const { introDone } = useStudio();
  const active = useCanvasActive(section);
  const reduced = usePrefersReducedMotion();
  const lite = useMediaQuery("(max-width: 767px)");
  const [webgl, setWebgl] = useState(false);

  useSectionTheme(section, "light");

  useEffect(() => {
    // Feature detection has to wait for the browser; runs once after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  useGSAP(
    () => {
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
      });

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-hero-content]", {
          yPercent: -35,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(stage.current, {
          yPercent: 25,
          scale: 0.92,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: section },
  );

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.fromTo(
        stage.current,
        { opacity: 0, scale: 1.08 },
        { opacity: 1, scale: 1, duration: 2.2, ease: "expo.out", clearProps: "scale" },
      );
      gsap.from("[data-hero-fade]", { y: 30, opacity: 0, duration: 1.4, stagger: 0.08, delay: 0.7, ease: "expo.out" });
    },
    { scope: section, dependencies: [introDone] },
  );

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="relative h-svh min-h-160 overflow-hidden bg-[radial-gradient(120%_90%_at_70%_40%,#ffffff_0%,#eceef2_45%,#dfe2e8_100%)]"
    >
      <div ref={stage} className="absolute inset-0 opacity-0 will-change-transform" data-cursor-zone="hero">
        {webgl ? (
          <HeroScene progress={progress} active={active && introDone} lite={lite} reduced={reduced} />
        ) : (
          <div
            aria-hidden
            className="absolute -end-[10%] top-1/2 size-[70vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#21426a,#07121f_60%)] shadow-[0_60px_120px_-40px_rgba(3,7,13,0.5)]"
          />
        )}
      </div>

      <div data-hero-content className="pointer-events-none relative flex h-full flex-col justify-end px-4 pb-8 md:px-8 md:pb-10">
        <SplitReveal
          as="h1"
          id="hero-title"
          type="chars"
          trigger="manual"
          play={introDone}
          delay={0.25}
          stagger={0.03}
          duration={1.6}
          className="max-w-[12ch] font-medium tracking-[-0.055em] text-[#07121f] text-[clamp(2.75rem,7vw,7.5rem)] leading-[0.92]"
        >
          {hero.title.map((line, index) => (
            <span key={line} className={cn("block", index === 1 && "ps-[0.9em] italic font-light font-serif")}>
              {line}
            </span>
          ))}
        </SplitReveal>

        <div className="mt-8 grid grid-cols-1 items-end gap-6 border-t border-[#07121f]/10 pt-5 md:mt-12 md:grid-cols-12">
          <p data-hero-fade className="text-label text-[#07121f]/50 md:col-span-3">
            {hero.location}
          </p>
          <p data-hero-fade className="max-w-md text-base leading-snug text-[#07121f]/70 md:col-span-5 md:text-lg">
            {hero.intro}
          </p>
          <div data-hero-fade className="flex items-center gap-3 md:col-span-4 md:justify-end">
            <span className="text-label text-[#07121f]/50">{hero.scrollHint}</span>
            <span className="grid size-11 place-items-center rounded-full border border-[#07121f]/15">
              <ArrowDown aria-hidden className="size-4 animate-[bob_2.4s_ease-in-out_infinite]" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
