"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useStudio } from "@/components/studio/StudioProvider";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

/**
 * Case-study opener: title splits in once the preloader leaves, then the
 * hero media grows from an inset rounded frame to a full-bleed stage while
 * the page scrolls — the showreel's move, applied to the project.
 */
export function CaseStudyHero({ project }: { project: PortfolioProject }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const { introDone } = useStudio();
  const { t } = useContent();

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.from("[data-case-fade]", { y: 30, opacity: 0, duration: 1.4, stagger: 0.08, delay: 0.5, ease: "expo.out" });
      gsap.fromTo(frame.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 1.6, delay: 0.4, ease: "expo.out", clearProps: "transform" });
    },
    { scope: section, dependencies: [introDone] },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: track.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        });
        tl.fromTo(
          frame.current,
          { clipPath: "inset(0% 4% 12% 4% round 28px)" },
          { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "power2.inOut" },
        )
          .fromTo("[data-case-media]", { scale: 1.25 }, { scale: 1, ease: "power2.inOut" }, 0)
          .to("[data-case-caption]", { opacity: 0, ease: "power1.in" }, 0.4);
      });
    },
    { scope: section },
  );

  const meta = [
    { label: t.common.client, value: project.client },
    { label: t.common.category, value: project.category },
    { label: t.common.market, value: project.market ?? t.common.defaultMarket },
  ];

  return (
    <section ref={section} aria-labelledby="case-title" className="relative bg-[#eceef2] text-[#0b0c0e]">
      <div className="px-4 pb-10 pt-32 md:px-8 md:pb-14 md:pt-44">
        <p data-case-fade className="text-label mb-8 md:mb-12">
          <TransitionLink href="/case-studies" transitionLabel={t.common.caseStudies} className="group inline-flex items-center gap-2 text-black/50 transition-colors hover:text-[#0b0c0e]">
            <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-x-1" />
            {t.common.allCaseStudies}
          </TransitionLink>
        </p>

        <SplitReveal
          as="h1"
          id="case-title"
          type="chars"
          trigger="manual"
          play={introDone}
          delay={0.2}
          stagger={0.03}
          duration={1.6}
          className="max-w-[12ch] font-medium tracking-[-0.055em] text-[clamp(3rem,9vw,10.5rem)] leading-[0.86]"
        >
          {project.title}
        </SplitReveal>

        <div className="mt-10 grid grid-cols-1 items-end gap-8 border-t border-black/10 pt-5 md:mt-14 md:grid-cols-12">
          <p data-case-fade className="max-w-md text-base leading-snug text-black/70 md:col-span-5 md:text-lg">
            {project.description}
          </p>
          <dl className="grid grid-cols-3 gap-4 md:col-span-7 md:justify-self-end md:gap-10">
            {meta.map((item) => (
              <div key={item.label} data-case-fade>
                <dt className="text-label mb-2 text-black/45">{item.label}</dt>
                <dd className="text-sm md:text-base">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div ref={track} className="relative h-[170vh]">
        <div className="sticky top-0 h-svh overflow-hidden">
          <div
            ref={frame}
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: "inset(0% 4% 12% 4% round 28px)", backgroundColor: project.color }}
          >
            <div data-case-media className="absolute inset-0 will-change-transform">
              {project.backgroundVideo ? (
                <video className="absolute inset-0 size-full object-cover" src={project.backgroundVideo} poster={project.heroImage} autoPlay muted loop playsInline preload="metadata" />
              ) : (
                <Image src={project.heroImage} alt={`${project.title} — ${project.category}`} fill sizes="100vw" quality={85} priority className="object-cover" />
              )}
            </div>
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            <p data-case-caption className="text-label absolute bottom-6 start-6 flex items-center gap-2 text-white/80 md:bottom-8 md:start-10">
              <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
              {t.studio.caseStudy} {project.id} — {project.market ?? t.common.defaultMarketShort}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
