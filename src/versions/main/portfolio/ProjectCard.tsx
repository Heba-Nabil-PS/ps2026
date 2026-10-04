"use client";

import { distortion } from "@/versions/main/portfolio/fx/distortion";
import { usePortfolioTransition } from "@/versions/main/portfolio/PortfolioTransition";
import { portfolioHref, type PortfolioProject } from "@/data/portfolio";
import { useContent, useDirectionSign, useLocalizeHref } from "@/versions/main/portfolio/content";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn, isPlainLeftClick } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, ViewTransition } from "react";

export type CardLayout = {
  className: string;
  aspect: string;
  sizes: string;
  size: "lg" | "md";
};

type ProjectCardProps = {
  project: PortfolioProject;
  layout: CardLayout;
  preload?: boolean;
};

/**
 * Cinematic project card.
 * Layers (outer → inner): magnetic root → reveal frame → scroll parallax → hover shift/scale → media.
 * Each layer owns exactly one kind of transform so scroll, hover and reveal never fight.
 */
export function ProjectCard({ project, layout, preload = false }: ProjectCardProps) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const parallax = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const quick = useRef<Record<string, gsap.QuickToFunc>>({});
  const rich = useRichInteractions();
  const reduced = usePrefersReducedMotion();
  const { open, warm } = usePortfolioTransition();
  const { t } = useContent();
  const localize = useLocalizeHref();
  const sign = useDirectionSign();
  const large = layout.size === "lg";

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);

      const reveal = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 90%", once: true } });
      reveal
        .fromTo(frame.current, { clipPath: "inset(14% 9% 14% 9%)", scale: 0.92, opacity: 0.3 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, opacity: 1, duration: 1.5 })
        .fromTo(q("[data-media]"), { scale: 1.35 }, { scale: 1, duration: 1.8 }, 0)
        .from(q("[data-line]"), { yPercent: 115, duration: 1.2, stagger: 0.08 }, 0.3)
        .from(q("[data-meta]"), { x: -24 * sign, opacity: 0, duration: 1, stagger: 0.06, ease: "power3.out" }, 0.45);

      gsap.fromTo(
        parallax.current,
        { yPercent: -7 },
        { yPercent: 7, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
      );

      if (rich) {
        const opts = { duration: 0.9, ease: "power3" };
        quick.current = {
          rootX: gsap.quickTo(root.current, "x", opts),
          rootY: gsap.quickTo(root.current, "y", opts),
          mediaX: gsap.quickTo(hover.current, "xPercent", opts),
          mediaY: gsap.quickTo(hover.current, "yPercent", opts),
          titleX: gsap.quickTo(q("[data-title]"), "x", opts),
        };
      }
    },
    { scope: root, dependencies: [reduced, rich, sign], revertOnUpdate: true },
  );

  const onEnter = (event: React.PointerEvent) => {
    warm(project);
    if (!rich || event.pointerType !== "mouse") return;
    root.current?.setAttribute("data-hovered", "true");
    gsap.to(hover.current, { scale: 1.07, duration: 1.4, ease: "expo.out" });

    const clip = video.current;
    if (clip && project.hoverVideo) {
      if (!clip.src) clip.src = project.hoverVideo;
      clip.play().then(() => {
        if (root.current?.dataset.hovered === "true") gsap.to(clip, { opacity: 1, duration: 0.6 });
      }).catch(() => {});
    } else {
      distortion?.attach(hover.current!, hover.current!.querySelector("img"));
    }
  };

  const onMove = (event: React.PointerEvent) => {
    if (!rich || event.pointerType !== "mouse" || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    const { rootX, rootY, mediaX, mediaY, titleX } = quick.current;
    rootX?.((nx - 0.5) * 14);
    rootY?.((ny - 0.5) * 10);
    mediaX?.((0.5 - nx) * 3);
    mediaY?.((0.5 - ny) * 3);
    titleX?.((nx - 0.5) * 24);
    if (!project.hoverVideo) {
      // The distortion canvas fills the (taller) hover layer, so map the pointer into that box.
      const layer = hover.current!.getBoundingClientRect();
      distortion?.move((event.clientX - layer.left) / layer.width, (event.clientY - layer.top) / layer.height);
    }
  };

  const onLeave = () => {
    if (!rich) return;
    root.current?.setAttribute("data-hovered", "false");
    Object.values(quick.current).forEach((to) => to(0));
    gsap.to(hover.current, { scale: 1, duration: 1.2, ease: "expo.out" });
    if (video.current) gsap.to(video.current, { opacity: 0, duration: 0.4, onComplete: () => video.current?.pause() });
    distortion?.leave();
  };

  return (
    <article
      ref={root}
      data-hovered="false"
      className={cn("group/card relative will-change-transform", layout.className)}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <Link
        href={localize(portfolioHref(project.slug))}
        data-cursor={t.common.viewProjectCursor}
        onFocus={() => warm(project)}
        onTouchStart={() => warm(project)}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          open(project, frame.current);
        }}
        className="block outline-offset-8"
        aria-label={`${project.title} — ${project.category}${project.market ? `, ${project.market}` : ""}`}
      >
        <ViewTransition name={`pf-media-${project.slug}`} share={{ "pf-open": "pf-morph", default: "none" }} default="none">
          <div ref={frame} className={cn("theme-dark relative overflow-hidden rounded-card", layout.aspect)} style={{ backgroundColor: project.color }}>
            <div ref={parallax} className="absolute inset-x-0 -inset-y-[8%]">
              <div ref={hover} className="absolute inset-0 will-change-transform">
                <div data-media className="absolute inset-0">
                  <Image
                    src={project.heroImage}
                    alt=""
                    fill
                    sizes={layout.sizes}
                    preload={preload}
                    loading={preload ? "eager" : "lazy"}
                    className="object-cover"
                  />
                  {project.hoverVideo ? (
                    <video ref={video} aria-hidden muted loop playsInline preload="none" className="absolute inset-0 h-full w-full opacity-0" />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Legibility scrim + overlay metadata */}
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/75 via-bg/5 to-bg/30" />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-5 md:p-7">
              <div className="text-label flex items-start justify-between gap-4 text-fg/85">
                <span data-meta>{t.common.project} {project.id}</span>
                <span data-meta className="text-end">
                  {project.category}
                  {project.market ? (
                    <>
                      <span className="mx-2 text-fg/40">/</span>
                      {project.market}
                    </>
                  ) : null}
                </span>
              </div>

            </div>
          </div>
        </ViewTransition>

        <div data-title className="mt-6 will-change-transform">
          <div
            className={cn(
              "flex items-center gap-[0.35em]",
              large ? "text-[clamp(1.36rem,4.35vw,4.7rem)]" : "text-[clamp(1.3rem,2.65vw,2.8rem)]",
            )}
          >
            <ViewTransition name={`pf-title-${project.slug}`} share={{ "pf-open": "pf-morph-title", default: "none" }} default="none">
              <h2 className="min-w-0 font-extrabold uppercase leading-[0.95] tracking-[-0.01em] ar:font-display ar:font-bold">
                <span className="block overflow-hidden pb-[0.06em]">
                  <span data-line className="block">
                    {project.title}
                  </span>
                </span>
              </h2>
            </ViewTransition>
            <span
              aria-hidden
              className={cn(
                "flex shrink-0 text-accent transition-[opacity,translate] duration-700 ease-[var(--ease-expo)]",
                rich && "-translate-x-[0.3em] opacity-0 rtl:translate-x-[0.3em] group-data-[hovered=true]/card:translate-x-0 group-data-[hovered=true]/card:opacity-100",
              )}
            >
              <ArrowRight strokeWidth={2.25} className="size-[0.85em] rtl:-scale-x-100" />
            </span>
          </div>
          <ul data-meta className="mt-3 flex flex-wrap gap-2" aria-label={t.common.tags}>
            {project.tags.slice(0, 3).map((tag) => (
              <li key={tag} className="text-label rounded-full border border-line px-3 py-1.5 text-[0.75rem] text-muted md:text-[0.65rem]">
                {tag}
              </li>
            ))}
          </ul>
        </div>

        <p data-meta className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          {project.description}
        </p>
      </Link>
    </article>
  );
}
