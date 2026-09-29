"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import { PillButton } from "@/components/studio/PillButton";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { caseStudyHref } from "@/data/caseStudies";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

type CaseStudyNextProps = { next: PortfolioProject; previous: PortfolioProject };

/**
 * Dark sheet that rises over the case study with the next project as one
 * oversized link: hover swells the preview and rolls the arrow.
 */
export function CaseStudyNext({ next, previous }: CaseStudyNextProps) {
  const section = useRef<HTMLElement>(null);
  const { play } = useSound();
  const { t } = useContent();

  useSectionTheme(section, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          section.current,
          { borderTopLeftRadius: "4rem", borderTopRightRadius: "4rem" },
          {
            borderTopLeftRadius: "0rem",
            borderTopRightRadius: "0rem",
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true },
          },
        );
        gsap.from("[data-next-fade]", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 70%", once: true },
        });
        gsap.fromTo(
          "[data-next-media]",
          { yPercent: -10, scale: 1.15 },
          { yPercent: 10, scale: 1.15, ease: "none", scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-label={t.studio.moreCaseStudies} className="relative overflow-hidden rounded-t-[4rem] bg-[#0b0c0e] px-4 pb-28 pt-24 text-[#f2f3f5] md:px-8 md:pb-40 md:pt-36">
      <div className="mb-14 flex flex-wrap items-center justify-between gap-6 md:mb-20">
        <p data-next-fade className="text-label flex items-center gap-2 text-white/50">
          <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
          {t.common.nextCaseStudy}
        </p>
        <TransitionLink
          data-next-fade
          href={caseStudyHref(previous.slug)}
          transitionLabel={previous.title}
          onPointerEnter={() => play("hover")}
          className="group text-label inline-flex items-center gap-2 text-white/50 transition-colors hover:text-white"
        >
          <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-x-1" />
          {t.studio.previousPrefix} {previous.title}
        </TransitionLink>
      </div>

      <TransitionLink
        href={caseStudyHref(next.slug)}
        transitionLabel={next.title}
        onPointerEnter={() => play("hover")}
        data-cursor="view"
        data-cursor-label={t.common.open}
        className="group grid grid-cols-1 items-end gap-10 md:grid-cols-12"
      >
        <div className="md:col-span-7">
          <h2 data-next-fade className="font-medium tracking-[-0.055em] text-[clamp(3rem,9vw,10rem)] leading-[0.86]">
            <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_2px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom transition-[background-size] duration-700 ease-[var(--ease-expo)] group-hover:bg-[length:100%_2px]">
              {next.title}
            </span>
          </h2>
          <p data-next-fade className="mt-6 flex items-center gap-4 text-sm text-white/55 md:text-base">
            <span>{next.category}</span>
            <span aria-hidden className="size-1 rounded-full bg-white/30" />
            <span>{next.market ?? t.common.defaultMarketShort}</span>
            <ArrowUpRight aria-hidden className="ms-auto size-6 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45" />
          </p>
        </div>
        <div data-next-fade className="relative aspect-[4/3] overflow-hidden rounded-3xl md:col-span-5" style={{ backgroundColor: next.color }}>
          <div data-next-media className="absolute inset-0 will-change-transform">
            <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]">
              <Image src={next.heroImage} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </div>
        </div>
      </TransitionLink>

      <div data-next-fade className="mt-20 flex justify-center md:mt-28">
        <PillButton href="/case-studies" tone="paper">
          {t.common.allCaseStudies}
        </PillButton>
      </div>
    </section>
  );
}
