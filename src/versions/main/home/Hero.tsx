"use client";

import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { workHref } from "@/versions/main/data/work";
import { LocalTime } from "@/versions/main/shell/LocalTime";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { Label } from "@/versions/main/ui/Label";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

/** How long each project stays in the reel window, in milliseconds. */
const REEL_STEP = 3200;

/**
 * Home hero — "first scroll, first impression" (deck slides 6 & 8).
 * Everything sits in the normal flow, so nothing overlaps at any width:
 * the eyebrow row, then the stretched title with a reel window opening
 * beside the first word and cycling through the selected work, then the
 * intro, the actions and a "now showing" caption that links to the case.
 */
export function Hero() {
  const { copy, site, featured } = useCopy();
  const hero = copy.home.hero;
  const isAr = useLocale() === "ar";
  const root = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const project = featured[current];

  // Advance the reel; pauses while hovered or focused so the caption can be read.
  useEffect(() => {
    if (paused || featured.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setCurrent((index) => (index + 1) % featured.length), REEL_STEP);
    return () => window.clearTimeout(timer);
  }, [current, paused, featured.length]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      return motionGate(() => {
        // The reel window opens from the first word outwards.
        gsap.fromTo(
          "[data-hero-reel]",
          { clipPath: isAr ? "inset(0% 0% 0% 100% round 999px)" : "inset(0% 100% 0% 0% round 999px)" },
          { clipPath: "inset(0% 0% 0% 0% round 999px)", duration: 1.5, ease: "expo.inOut", delay: 0.75 },
        );
        // Scrolling away lifts the title and fades the details.
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.8 } })
          .to("[data-hero-title]", { yPercent: -18, ease: "none" }, 0)
          .to("[data-hero-details]", { y: -60, opacity: 0, ease: "none" }, 0);
      });
    },
    { scope: root, dependencies: [isAr] },
  );

  return (
    <section ref={root} className="gutter relative isolate flex min-h-svh flex-col overflow-hidden pb-8 pt-32 md:pt-36">
      {/* Light source and the deck's halftone field */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(55%_50%_at_70%_35%,rgb(33_66_106/0.6),transparent_70%)]" />
      <div aria-hidden className="halftone absolute inset-0 -z-10 opacity-40 [mask-image:radial-gradient(55%_55%_at_75%_30%,black,transparent)]" />

      {/* Eyebrow row */}
      <Reveal immediate delay={0.2} className="flex flex-wrap items-center justify-between gap-4">
        <div data-reveal-item>
          <Label>{hero.eyebrow}</Label>
        </div>
        <p data-reveal-item className="text-label flex gap-3 text-subtle">
          <span>{hero.location}</span>
          <LocalTime timeZone={site.timeZone} className="tabular-nums" />
        </p>
      </Reveal>

      {/* Title with the work reel set into the first line */}
      <div data-hero-title className="mt-auto pt-12">
        <h1 className="sr-only">{hero.title.join(" ")}</h1>
        <div aria-hidden className="text-[10.4vw] leading-[0.9] md:text-[8.8vw] ar:text-[11.5vw] md:ar:text-[10vw]">
          <div className="flex items-center gap-[0.18em]">
            <StretchHeading as="p" lines={[hero.title[0]]} immediate delay={0.25} width={isAr ? 125 : 112} className="shrink-0 leading-[inherit]" />
            <AppLink
              href={workHref(project.slug)}
              transitionLabel={project.title}
              data-cursor={copy.ui.view}
              tabIndex={-1}
              data-hero-reel
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
              className="group relative block h-[0.74em] min-w-0 flex-1 overflow-hidden rounded-full bg-navy-800"
            >
              {featured.map((item, index) => (
                <Image
                  key={item.slug}
                  src={item.heroImage}
                  alt=""
                  fill
                  priority={index === 0}
                  sizes="45vw"
                  quality={70}
                  className={cn(
                    "object-cover transition-[opacity,transform,filter] duration-[1.2s] ease-expo group-hover:[filter:none]",
                    index === current ? "scale-100 opacity-100" : "scale-110 opacity-0",
                    "[filter:grayscale(0.35)_brightness(0.9)]",
                  )}
                />
              ))}
              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-paper/15" />
            </AppLink>
          </div>
          <StretchHeading as="p" lines={[hero.title[1]]} immediate delay={0.4} width={isAr ? 125 : 112} className="leading-[inherit] text-sky" />
        </div>
      </div>

      {/* Intro, actions and the reel caption */}
      <div data-hero-details className="mt-10 grid items-end gap-8 md:mt-12 md:grid-cols-12">
        <Reveal immediate delay={0.9} className="flex flex-col items-start gap-6 md:col-span-6 lg:col-span-5">
          <p data-reveal-item className="text-lead max-w-md text-muted">
            {hero.intro}
          </p>
          <div data-reveal-item className="flex flex-wrap gap-3">
            <ButtonLink href="/work" transitionLabel={copy.meta.pages.work.title}>
              {hero.primary}
            </ButtonLink>
            <ButtonLink href="/services" variant="glass" transitionLabel={copy.meta.pages.services.title}>
              {hero.secondary}
            </ButtonLink>
          </div>
        </Reveal>

        <Reveal immediate delay={1.1} className="md:col-span-5 md:col-start-8 lg:col-span-4 lg:col-start-9">
          <AppLink
            data-reveal-item
            href={workHref(project.slug)}
            transitionLabel={project.title}
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
            className="group block border-t border-line-strong pt-4"
          >
            <span className="text-label flex items-center justify-between text-subtle">
              <span>{hero.nowShowing}</span>
              <span className="tabular-nums">
                {String(current + 1).padStart(2, "0")} / {String(featured.length).padStart(2, "0")}
              </span>
            </span>
            <span className="mt-3 flex items-center justify-between gap-4">
              <span className="min-w-0">
                <span key={project.slug} className="block truncate text-title font-medium transition-colors duration-500 group-hover:text-sky">
                  {project.title}
                </span>
                <span className="mt-1 block truncate text-sm text-muted">{project.category}</span>
              </span>
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100">
                <ArrowUpRight className="size-4" />
              </span>
            </span>
            {/* Progress through the current slide */}
            <span aria-hidden className="mt-4 block h-px overflow-hidden bg-line">
              <span
                key={`${current}-${paused}`}
                className="block h-full origin-left bg-sky rtl:origin-right"
                style={{ animation: paused ? "none" : `hero-reel ${REEL_STEP}ms linear forwards`, transform: paused ? "scaleX(1)" : undefined }}
              />
            </span>
          </AppLink>
        </Reveal>
      </div>
    </section>
  );
}
