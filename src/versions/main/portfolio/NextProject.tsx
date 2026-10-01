"use client";

import { AppLink } from "@/versions/main/ui/AppLink";
import { PF_BACK, usePortfolioTransition } from "@/versions/main/portfolio/PortfolioTransition";
import { portfolioHref, type PortfolioProject } from "@/data/portfolio";
import { useContent, useDirectionSign, useLocalizeHref } from "@/versions/main/portfolio/content";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { isPlainLeftClick } from "@/lib/utils";
import { ArrowLeft, ArrowUpRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";

type NextProjectProps = { next: PortfolioProject; previous: PortfolioProject };

export function NextProject({ next, previous }: NextProjectProps) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const rich = useRichInteractions();
  const sign = useDirectionSign();
  const { open, warm } = usePortfolioTransition();
  const { t } = useContent();
  const localize = useLocalizeHref();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);
      gsap
        .timeline({ scrollTrigger: { trigger: frame.current, start: "top 85%", once: true } })
        .fromTo(frame.current, { clipPath: "inset(18% 12% 18% 12%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.6 })
        .from(q("[data-line]"), { yPercent: 115, duration: 1.3 }, 0.2)
        .from(q("[data-fade]"), { opacity: 0, y: 20, duration: 1, stagger: 0.06 }, 0.4);
      gsap.fromTo(
        q("[data-layer]"),
        { yPercent: -10, scale: 1.15 },
        { yPercent: 10, scale: 1, ease: "none", scrollTrigger: { trigger: frame.current, start: "top bottom", end: "bottom top", scrub: true } },
      );
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  const hover = (to: number) => {
    if (!rich) return;
    gsap.to(root.current!.querySelector("[data-zoom]"), { scale: to ? 1.06 : 1, duration: 1.4, ease: "expo.out" });
    gsap.to(root.current!.querySelector("[data-title]"), { x: to ? 24 * sign : 0, duration: 1.2, ease: "expo.out" });
  };

  return (
    <nav ref={root} aria-label={t.projects.moreProjects} className="border-t border-line pt-16 md:pt-24">
      <div className="gutter text-label mb-10 flex flex-wrap items-center justify-between gap-4 text-muted md:mb-14">
        <AppLink
          href={portfolioHref(previous.slug)}
          transitionLabel={previous.title}
          className="group flex items-center gap-2 transition-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
          {t.common.previous}<span className="hidden sm:inline"> — {previous.title}</span>
        </AppLink>
        <Link href={localize("/portfolio")} transitionTypes={[PF_BACK]} className="group flex items-center gap-2 transition-colors hover:text-fg">
          <LayoutGrid aria-hidden className="size-3.5" />
          {t.common.allProjects}
        </Link>
      </div>

      <Link
        href={localize(portfolioHref(next.slug))}
        data-cursor={t.common.nextProjectCursor}
        className="group block"
        onPointerEnter={() => {
          warm(next);
          hover(1);
        }}
        onPointerLeave={() => hover(0)}
        onFocus={() => warm(next)}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          open(next, frame.current);
        }}
      >
        <div className="gutter mb-8 flex items-end justify-between gap-6 md:mb-12">
          <div data-title>
            <p data-fade className="text-label mb-4 text-accent">
              {t.common.nextProject} — {next.id}
            </p>
            <ViewTransition name={`pf-title-${next.slug}`} share={{ "pf-open": "pf-morph-title", default: "none" }} default="none">
              <h2 className="text-[clamp(2.1rem,8vw,9.1rem)] font-extrabold uppercase leading-[0.86]">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-line className="block">
                    {next.title}
                  </span>
                </span>
              </h2>
            </ViewTransition>
            <p data-fade className="text-label mt-4 text-muted">
              {next.category}
              {next.market ? ` / ${next.market}` : ""}
            </p>
          </div>
          <ArrowUpRight aria-hidden className="mb-[1.5vw] size-10 shrink-0 text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45 md:size-20" />
        </div>

        <ViewTransition name={`pf-media-${next.slug}`} share={{ "pf-open": "pf-morph", default: "none" }} default="none">
          <div ref={frame} className="relative h-[60svh] overflow-hidden md:h-[90svh]" style={{ backgroundColor: next.color }}>
            <div data-layer className="absolute inset-x-0 -inset-y-[10%] will-change-transform">
              <div data-zoom className="absolute inset-0">
                <Image src={next.heroImage} alt={`${next.title} — ${next.category}`} fill sizes="100vw" className="object-cover" />
              </div>
            </div>
          </div>
        </ViewTransition>
      </Link>
    </nav>
  );
}
