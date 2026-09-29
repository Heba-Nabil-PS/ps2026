"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

/**
 * Scene 3 — the lead. The portrait opens from a rounded window to full frame
 * while the photo inside settles from a close zoom and drifts with parallax;
 * the name rises letter by letter and an oversized quote mark turns with scroll.
 */
export function TeamLead() {
  const { teamPage, site, t } = useContent();
  const { lead: copy } = teamPage;
  const { lead } = site.team;
  const section = useRef<HTMLElement>(null);

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const frame = "[data-portrait]";
        gsap.fromTo(
          frame,
          { clipPath: "inset(22% 16% 22% 16% round 999px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 1.5rem)",
            ease: "power2.out",
            scrollTrigger: { trigger: frame, start: "top 95%", end: "center 55%", scrub: 0.8 },
          },
        );
        gsap.fromTo(
          "[data-portrait-img]",
          { scale: 1.4, yPercent: -8 },
          { scale: 1, yPercent: 8, ease: "none", scrollTrigger: { trigger: frame, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.fromTo(
          "[data-quote-mark]",
          { rotate: -30, yPercent: 30 },
          { rotate: 20, yPercent: -30, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
        gsap.from("[data-lead-rule]", {
          scaleX: 0,
          duration: 1.6,
          ease: "expo.inOut",
          scrollTrigger: { trigger: "[data-lead-rule]", start: "top 85%", once: true },
        });
        gsap.from("[data-lead-fade]", {
          y: 30,
          autoAlpha: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-lead-copy]", start: "top 75%", once: true },
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="lead-name" className="relative overflow-hidden bg-[#eceef2] px-4 py-28 text-[#0b0c0e] md:px-8 md:py-44">
      <div className="grid grid-cols-1 items-center gap-14 md:grid-cols-12 md:gap-8">
        <figure data-portrait className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-[#dfe2e8] md:col-span-5">
          <div data-portrait-img className="absolute inset-0 will-change-transform">
            <Image src={lead.image} alt={copy.alt} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </figure>

        <div data-lead-copy className="relative md:col-span-6 md:col-start-7">
          <span
            data-quote-mark
            aria-hidden
            className="pointer-events-none absolute -top-24 end-0 select-none font-serif text-[16rem] font-light italic leading-none text-[#88bbd8]/40 md:-top-36 md:text-[22rem]"
          >
            &ldquo;
          </span>

          <p data-lead-fade className="text-label mb-8 flex items-center gap-2 text-black/50">
            <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
            {copy.label}
          </p>

          <SplitReveal
            as="h2"
            id="lead-name"
            type="chars"
            stagger={0.03}
            duration={1.4}
            className="font-medium tracking-[-0.05em] text-[clamp(2.75rem,6.5vw,7rem)] leading-[0.9]"
          >
            {lead.name}
          </SplitReveal>
          <p data-lead-fade className="mt-4 font-serif text-xl font-light italic text-[#122443] md:text-2xl">
            {lead.role}
          </p>

          <div data-lead-rule className="my-10 h-px origin-[0%_50%] bg-black/15 rtl:origin-[100%_50%] md:my-14" />

          <SplitReveal as="blockquote" type="lines" className="max-w-xl text-xl leading-snug tracking-[-0.02em] text-black/80 md:text-3xl">
            {copy.quote}
          </SplitReveal>

          <TransitionLink
            data-lead-fade
            href="/careers"
            transitionLabel={t.meta.careers.title}
            className="group mt-12 inline-flex items-center gap-2 text-base font-medium md:text-lg"
          >
            <span className="link-underline">{t.meta.careers.title}</span>
            <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100" />
          </TransitionLink>
        </div>
      </div>
    </section>
  );
}
