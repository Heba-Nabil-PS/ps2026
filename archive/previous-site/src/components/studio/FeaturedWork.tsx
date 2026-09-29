"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import { PillButton } from "@/components/studio/PillButton";
import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import type { FeaturedProject } from "@/data/studioHome";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

/** Staggered two-column project grid with clip reveals and inner parallax. */
export function FeaturedWork() {
  const { studioHome, featuredProjects, t } = useContent();
  const { work } = studioHome;
  const section = useRef<HTMLElement>(null);
  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
          const frame = card.querySelector("[data-card-frame]");
          const media = card.querySelector("[data-card-media]");
          const meta = card.querySelectorAll("[data-card-meta]");

          gsap.fromTo(
            frame,
            { clipPath: "inset(18% 8% 0% 8% round 24px)" },
            {
              clipPath: "inset(0% 0% 0% 0% round 24px)",
              ease: "power3.out",
              scrollTrigger: { trigger: card, start: "top 95%", end: "top 45%", scrub: 0.8 },
            },
          );
          gsap.fromTo(
            media,
            { yPercent: -12, scale: 1.18 },
            {
              yPercent: 12,
              scale: 1.18,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
          gsap.from(meta, {
            y: 24,
            opacity: 0,
            duration: 1,
            stagger: 0.08,
            scrollTrigger: { trigger: card, start: "top 70%", once: true },
          });
        });

        // The right column drifts at a different speed for depth.
        gsap.to("[data-column='right']", {
          yPercent: -8,
          ease: "none",
          scrollTrigger: { trigger: "[data-grid]", start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: section },
  );

  const left = featuredProjects.filter((_, index) => index % 2 === 0);
  const right = featuredProjects.filter((_, index) => index % 2 === 1);

  return (
    <section ref={section} id="work" aria-labelledby="work-title" className="relative bg-[#eceef2] px-4 py-28 text-[#0b0c0e] md:px-8 md:py-40">
      <header className="mb-16 grid grid-cols-1 items-end gap-8 md:mb-28 md:grid-cols-12">
        <SplitReveal
          as="h2"
          id="work-title"
          type="chars"
          className="font-medium tracking-[-0.055em] text-[clamp(3.5rem,12vw,13rem)] md:col-span-8 leading-[0.85]"
        >
          <span className="block">{work.title[0]}</span>
          <span className="block ps-[1.2em] font-serif font-light italic">{work.title[1]}</span>
        </SplitReveal>
        <div className="md:col-span-4 md:pb-4">
          <p className="text-label mb-4 text-black/50">({String(featuredProjects.length).padStart(2, "0")}) {t.common.projects}</p>
          <SplitReveal as="p" type="lines" className="max-w-sm text-lg leading-snug text-black/70">
            {work.body}
          </SplitReveal>
        </div>
      </header>

      <div data-grid className="grid grid-cols-1 gap-x-6 gap-y-20 md:grid-cols-2 md:gap-x-8 md:gap-y-32">
        <div className="flex flex-col gap-20 md:gap-32">
          {left.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index * 2} />
          ))}
        </div>
        <div data-column="right" className="flex flex-col gap-20 md:mt-[36vh] md:gap-32">
          {right.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index * 2 + 1} />
          ))}
        </div>
      </div>

      <div className="mt-24 flex justify-center md:mt-40">
        <PillButton href={work.cta.href}>{work.cta.label}</PillButton>
      </div>
    </section>
  );
}

function ProjectCard({ project, index }: { project: FeaturedProject; index: number }) {
  const { play } = useSound();
  const { t } = useContent();

  return (
    <article data-card className="group">
      <TransitionLink
        href={project.href}
        transitionLabel={project.title}
        onPointerEnter={() => play("hover")}
        data-cursor="view"
        data-cursor-label={t.common.view}
        className="block"
      >
        <div
          data-card-frame
          className={cn(
            "relative overflow-hidden rounded-3xl bg-[#d6d9df]",
            project.shape === "landscape" ? "aspect-[4/3]" : "aspect-[4/5]",
          )}
        >
          <div data-card-media className="absolute inset-0 will-change-transform">
            <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]">
              {project.media.video ? (
                <video
                  className="absolute inset-0 size-full object-cover"
                  src={project.media.video}
                  poster={project.media.image}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={project.media.image}
                  alt={project.media.alt}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  quality={85}
                  className="object-cover"
                />
              )}
            </div>
          </div>
          <div
            aria-hidden
            className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/15"
          />
          <span
            aria-hidden
            className="absolute end-5 top-5 grid size-12 scale-0 place-items-center rounded-full bg-[#f2f3f5] text-[#0b0c0e] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-100"
          >
            <ArrowUpRight className="size-5" />
          </span>
        </div>

        <div className="mt-5 flex items-start justify-between gap-6 md:mt-6">
          <div>
            <h3 data-card-meta className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom transition-[background-size] duration-700 ease-[var(--ease-expo)] group-hover:bg-[length:100%_1px]">
                {project.title}
              </span>
            </h3>
            <p data-card-meta className="mt-2 text-sm text-black/55">
              {project.category}
            </p>
          </div>
          <p data-card-meta className="text-label shrink-0 pt-2 tabular-nums text-black/45">
            {String(index + 1).padStart(2, "0")}
            {project.market ? ` — ${project.market}` : ""}
          </p>
        </div>
      </TransitionLink>
    </article>
  );
}
