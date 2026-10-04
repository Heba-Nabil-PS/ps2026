"use client";

import { consumeArrival, HERO_IMAGE, PF_BACK } from "@/versions/main/portfolio/PortfolioTransition";
import { LazyVideo } from "@/versions/main/portfolio/ui/LazyVideo";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent, useLocalizeHref } from "@/versions/main/portfolio/content";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { PULL, stretchLetterOf, StretchText, stretchTo } from "@/versions/main/motion/StretchLetter";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";

/** Case-study opener: the key visual first (the destination of the card morph), then the title block beneath it. */
export function ProjectHero({ project }: { project: PortfolioProject }) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { locale, t } = useContent();
  const localize = useLocalizeHref();
  /** The letter that stretches, as in every banner title (see StretchLetter). */
  const letter = locale === "ar" ? undefined : stretchLetterOf(project.title);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const arrived = consumeArrival(project.slug);
      const letters = q("[data-stretch-letter]");

      if (reduced) {
        gsap.from(q("[data-fade]"), { opacity: 0, duration: 0.4 });
        if (letters.length) gsap.set(letters, { "--x": stretchTo("[data-line]") });
        return;
      }

      const intro = gsap.timeline({ delay: arrived ? 0.75 : 0.1 });
      if (!arrived) {
        // Direct visit: the visual opens out of a narrow window, then the title rises beneath it.
        // (After a card morph the media and title are already in place.)
        intro
          .fromTo(q("[data-media]"), { scale: 1.2, clipPath: "inset(14% 10% 14% 10%)" }, { scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 1.8, ease: "expo.out" })
          .from(q("[data-line]"), { yPercent: 115, duration: 1.3, ease: "expo.out" }, 0.55);
      }
      intro.from(q("[data-fade]"), { y: 24, opacity: 0, duration: 1, stagger: 0.07, ease: "expo.out" }, arrived ? 0 : 0.8);
      if (letters.length) intro.to(letters, { "--x": stretchTo("[data-line]"), ...PULL }, arrived ? 0.1 : 1.1);

      // On scroll the visual sinks and fades out completely behind the title block, which sits half over it.
      gsap
        .timeline({ scrollTrigger: { trigger: q("[data-frame]")[0], start: "top top", end: "bottom 30%", scrub: true } })
        .to(q("[data-parallax]"), { yPercent: 18, scale: 1.08, ease: "none" }, 0)
        .to(q("[data-shade]"), { opacity: 1, ease: "none" }, 0);
    },
    { scope: root, dependencies: [reduced, project.slug], revertOnUpdate: true },
  );

  return (
    <section ref={root} aria-labelledby="project-title" className="relative">
      <ViewTransition name={`pf-media-${project.slug}`} share={{ "pf-open": "pf-morph", default: "none" }} default="none">
        {/* The whole frame is masked out at the bottom, so it dissolves into whatever the page paints beneath it
            (body is ink-950 with its own texture, not --color-bg) and never leaves a seam. */}
        <div
          data-pf-hero-media
          data-frame
          className="relative h-[78svh] min-h-[480px] overflow-hidden mask-[linear-gradient(to_bottom,#000_30%,rgb(0_0_0/0.55)_58%,rgb(0_0_0/0.18)_80%,transparent)]"
          style={{ backgroundColor: project.color }}
        >
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
          <div data-shade aria-hidden className="absolute inset-0 bg-bg opacity-0" />
          {/* Darkens the top so the header reads over any visual. */}
          <div aria-hidden className="absolute inset-x-0 top-0 h-56 bg-linear-to-b from-bg/90 via-bg/50 to-transparent md:h-64" />
          {/* Melts the lower half into the page, where the title block overlaps it. */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-bg/80 via-bg/50 via-40% to-transparent" />
        </div>
      </ViewTransition>

      {/* Pulled up so the title sits half over the fading visual. */}
      <div className="gutter relative z-10 mt-[-26svh] pb-6 md:mt-[-30svh]">
        <nav data-fade aria-label={t.common.breadcrumb} className="text-label mb-6 text-fg/70 md:mb-8">
          <ol className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <li>
              <Link href={localize("/")} className="-my-3 inline-block py-3 transition-colors hover:text-fg">
                {t.common.home}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3 rtl:rotate-180" />
            </li>
            <li>
              <Link href={localize("/portfolio")} transitionTypes={[PF_BACK]} className="-my-3 inline-block py-3 transition-colors hover:text-fg">
                {t.common.projectsCrumb}
              </Link>
            </li>
            <li aria-hidden>
              <ChevronRight className="size-3 rtl:rotate-180" />
            </li>
            <li aria-current="page" className="text-accent">
              {project.title}
            </li>
          </ol>
        </nav>
        {/* The display face runs wide: the title is sized so its longest word (twelve letters) still fits the screen. */}
        <ViewTransition name={`pf-title-${project.slug}`} share={{ "pf-open": "pf-morph-title", default: "none" }} default="none">
          <h1
            id="project-title"
            className={cn("stretch", locale === "ar" ? "text-[clamp(1.6rem,6.4vw,7.2rem)]" : "text-[clamp(1.2rem,5.9vw,7.2rem)]", "leading-[0.86]")}
          >
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                <StretchText text={project.title} letter={letter} />
              </span>
            </span>
          </h1>
        </ViewTransition>
        <p data-fade className="text-lead mt-8 max-w-2xl text-fg/80 md:mt-10">
          {project.description}
        </p>
      </div>
    </section>
  );
}
