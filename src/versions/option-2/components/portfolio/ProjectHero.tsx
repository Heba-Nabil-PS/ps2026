"use client";

import { consumeArrival, HERO_IMAGE } from "@/versions/option-2/components/portfolio/PortfolioTransition";
import { LazyVideo } from "@/versions/option-2/components/ui/LazyVideo";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import Image from "next/image";
import { useRef, ViewTransition } from "react";

/** Full-viewport case-study opener — the destination of the card morph. */
export function ProjectHero({ project }: { project: PortfolioProject }) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { t } = useContent();

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const arrived = consumeArrival(project.slug);

      if (reduced) {
        gsap.from(q("[data-fade]"), { opacity: 0, duration: 0.4 });
        return;
      }

      const intro = gsap.timeline({ delay: arrived ? 0.75 : 0.1 });
      if (!arrived) {
        // Direct visit: the hero builds itself. (After a card morph the media and title are already in place.)
        intro
          .fromTo(q("[data-media]"), { scale: 1.2, clipPath: "inset(12% 8% 12% 8%)" }, { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.out" })
          .from(q("[data-line]"), { yPercent: 115, duration: 1.3, ease: "expo.out" }, 0.35);
      }
      intro.from(q("[data-fade]"), { y: 24, opacity: 0, duration: 1, stagger: 0.07, ease: "expo.out" }, arrived ? 0 : 0.6);

      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } })
        .to(q("[data-parallax]"), { yPercent: 18, scale: 1.1, ease: "none" }, 0)
        .to(q("[data-shade]"), { opacity: 0.85, ease: "none" }, 0)
        .to(q("[data-copy]"), { yPercent: -40, opacity: 0, ease: "none" }, 0);
    },
    { scope: root, dependencies: [reduced, project.slug], revertOnUpdate: true },
  );

  return (
    <section ref={root} aria-labelledby="project-title" className="relative h-[100svh] min-h-[560px] overflow-hidden">
      <ViewTransition name={`pf-media-${project.slug}`} share={{ "pf-open": "pf-morph", default: "none" }} default="none">
        <div data-pf-hero-media className="absolute inset-0 overflow-hidden" style={{ backgroundColor: project.color }}>
          <div data-media className="absolute inset-0">
            <div data-parallax className="absolute inset-0 will-change-transform">
              <Image
                src={project.heroImage}
                alt={`${project.title} — ${t.common.keyVisual}`}
                fill
                sizes={HERO_IMAGE.sizes}
                preload
                className="object-cover"
              />
              {project.backgroundVideo ? <LazyVideo src={project.backgroundVideo} label={`${project.title} — ${t.common.backgroundFilm}`} /> : null}
            </div>
          </div>
        </div>
      </ViewTransition>

      <div data-shade aria-hidden className="absolute inset-0 bg-bg opacity-20" />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-bg via-bg/10 to-bg/40" />

      <div data-copy className="gutter absolute inset-x-0 bottom-0 pb-10 md:pb-14">
        <div className="text-label mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-fg/80 md:mb-8">
          <span data-fade className="text-accent">
            {t.common.project} {project.id}
          </span>
          <span data-fade>{project.category}</span>
          {project.market ? <span data-fade>{project.market}</span> : null}
        </div>
        <ViewTransition name={`pf-title-${project.slug}`} share={{ "pf-open": "pf-morph-title", default: "none" }} default="none">
          <h1 id="project-title" className="text-mega font-extrabold uppercase">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                {project.title}
              </span>
            </span>
          </h1>
        </ViewTransition>
        <div data-fade className="mt-8 flex items-end justify-between gap-6 md:mt-10">
          <p className="max-w-md text-fg/80">{project.description}</p>
          <span className="text-label hidden items-center gap-3 text-muted md:flex">
            {t.common.scroll}
            <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-line">
              <span className="absolute inset-0 animate-[scroll-line_2.2s_var(--ease-quart)_infinite] bg-fg" />
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
