"use client";

import type { PortfolioProject } from "@/data/portfolio";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { workHref } from "@/versions/main/data/work";
import { motionGate } from "@/versions/main/motion/useMotionGate";
import { AppLink } from "@/versions/main/ui/AppLink";
import { useDirectionSign } from "@/i18n/locale-context";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { distortion } from "@/versions/main/portfolio/fx/distortion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useRef, type PointerEvent } from "react";

type JourneyProject = Pick<PortfolioProject, "slug" | "title" | "category" | "description" | "market" | "color" | "hoverVideo"> & { image: string };

/** Catmull-Rom through the points, as cubic Béziers: one smooth line that passes through every one of them. */
function smoothPath(points: { x: number; y: number }[]) {
  let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * The flagship cases as one journey. A line comes in from the section above,
 * runs beside each project, crosses the gap to the next and leaves for the
 * services below; it is drawn by the scroll, its head always level with the
 * middle of the screen, so it reaches each card as the card takes the centre.
 *
 * Each card has the portfolio card's effects: a fade-up reveal, scroll parallax,
 * and on hover a magnetic pull, zoom, liquid distortion (or hover video).
 * Phones get a straight lane down the side; reduced motion gets the cards as they are
 * and the line already drawn.
 */
export function ProjectJourney({ projects, viewLabel }: { projects: readonly JourneyProject[]; viewLabel: string }) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const list = root.current;
      if (!list) return;
      const svg = list.querySelector<SVGSVGElement>("[data-journey-svg]")!;
      // While the line is hidden (as on the home page, where LogoThread is the line) it is not laid out or followed:
      // reading points along a path on every scroll was pure cost, and a heavy one on Safari.
      if (getComputedStyle(svg).visibility === "hidden") return;
      const track = svg.querySelector<SVGPathElement>("[data-journey-track]")!;
      const line = svg.querySelector<SVGPathElement>("[data-journey-line]")!;
      const head = svg.querySelector<SVGGElement>("[data-journey-head]")!;
      const cards = Array.from(list.querySelectorAll<HTMLElement>("[data-journey-card]"));

      /** Length along the path at which it reaches each height, so the scroll can be turned into a length. */
      let samples: { y: number; at: number }[] = [];
      let length = 0;

      const layout = () => {
        const box = list.getBoundingClientRect();
        const w = box.width;
        const h = box.height;
        const narrow = window.innerWidth < 768;
        svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
        const points: { x: number; y: number }[] = [{ x: narrow ? 0 : w / 2, y: -80 }];
        cards.forEach((card, i) => {
          // From the list item, which the scroll never transforms: the media fills its content box from the top.
          const item = card.getBoundingClientRect();
          const style = getComputedStyle(card);
          const left = item.left - box.left + parseFloat(style.paddingLeft);
          const right = item.right - box.left - parseFloat(style.paddingRight);
          const media = { height: card.querySelector<HTMLElement>("[data-card-media]")!.offsetHeight };
          const mid = item.top - box.top + media.height / 2;
          if (narrow) {
            // A lane down the start side, swaying a little as it passes each card.
            const lane = left > w - right ? left / 2 : (right + w) / 2;
            points.push({ x: lane + (i % 2 ? 5 : -5), y: mid });
            return;
          }
          // Beside the card, in the open half of the row, then through the gap to the next.
          const open = left > w - right ? left / 2 : (right + w) / 2;
          points.push({ x: open, y: mid - media.height * 0.18 }, { x: open, y: mid + media.height * 0.18 });
          const next = cards[i + 1];
          if (next) {
            const gapTop = card.getBoundingClientRect().bottom - box.top;
            const gapBottom = next.getBoundingClientRect().top - box.top;
            points.push({ x: w / 2, y: (gapTop + gapBottom) / 2 });
          }
        });
        const end = points[points.length - 1];
        points.push({ x: narrow ? end.x : w / 2, y: h + 80 });
        const d = smoothPath(points);
        track.setAttribute("d", d);
        line.setAttribute("d", d);
        length = line.getTotalLength();
        line.style.strokeDasharray = `${length}`;
        samples = [];
        for (let k = 0, steps = 240; k <= steps; k++) {
          const at = (length * k) / steps;
          samples.push({ y: line.getPointAtLength(at).y, at });
        }
      };

      /** The first length at which the path reaches height `y` (it only ever runs downwards overall). */
      const lengthAt = (y: number) => {
        if (!samples.length || y <= samples[0].y) return 0;
        for (let k = 1; k < samples.length; k++) {
          if (samples[k].y >= y) {
            const a = samples[k - 1];
            const b = samples[k];
            return a.at + ((y - a.y) / Math.max(b.y - a.y, 0.001)) * (b.at - a.at);
          }
        }
        return length;
      };

      return motionGate(
        () => {
          layout();
          const draw = { at: 0 };
          const render = () => {
            line.style.strokeDashoffset = `${length - draw.at}`;
            const point = line.getPointAtLength(draw.at);
            head.setAttribute("transform", `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)})`);
            head.style.opacity = draw.at > 2 && draw.at < length - 2 ? "1" : "0";
          };
          const follow = gsap.quickTo(draw, "at", { duration: 0.6, ease: "power3.out", onUpdate: render });
          // The head stays level with the middle of the screen.
          ScrollTrigger.create({
            trigger: list,
            start: "top bottom",
            end: "bottom top",
            onRefresh: () => {
              layout();
              render();
            },
            onUpdate: () => follow(lengthAt(window.innerHeight / 2 - list.getBoundingClientRect().top)),
          });
          render();
        },
        () => {
          // Reduced motion: the line drawn in full, no head.
          layout();
          line.style.strokeDashoffset = "0";
          head.style.opacity = "0";
          ScrollTrigger.create({ trigger: list, onRefresh: layout });
        },
      );
    },
    { scope: root, dependencies: [projects.length] },
  );

  return (
    <ul ref={root} className="relative isolate mt-12 flex flex-col gap-[clamp(3.5rem,9vw,9rem)] md:mt-20">
      {/* Hidden on the home page: the logo's thread (LogoThread) is the one line through the page now. The cards still follow it. */}
      <svg data-journey-svg aria-hidden className="pointer-events-none invisible absolute inset-0 -z-10 size-full overflow-visible" fill="none" preserveAspectRatio="none">
        <defs>
          <radialGradient id="journey-glow">
            <stop offset="0" stopColor="var(--color-sky)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--color-sky)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <path data-journey-track stroke="var(--color-line-strong)" strokeWidth={1} strokeDasharray="2 7" />
        <path data-journey-line stroke="var(--color-sky)" strokeWidth={1.5} strokeLinecap="round" />
        <g data-journey-head style={{ opacity: 0 }}>
          <circle r={26} fill="url(#journey-glow)" />
          <circle r={3.5} fill="var(--color-sky-200)" />
        </g>
      </svg>

      {projects.map((project, index) => (
        <li key={project.slug} data-journey-card className={index % 2 ? "ps-7 md:ms-auto md:w-[58%] md:ps-0" : "ps-7 md:w-[58%] md:ps-0"}>
          <JourneyCard project={project} index={index} last={index === projects.length - 1} viewLabel={viewLabel} />
        </li>
      ))}
    </ul>
  );
}

/**
 * One case, with the portfolio card's effects (portfolio/ProjectCard).
 * Layers (outer → inner): magnetic root → reveal frame → scroll parallax → hover shift/scale → media.
 * Each layer owns exactly one kind of transform so scroll, hover and reveal never fight.
 */
function JourneyCard({ project, index, last, viewLabel }: { project: JourneyProject; index: number; last: boolean; viewLabel: string }) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const parallax = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const quick = useRef<Record<string, gsap.QuickToFunc>>({});
  const rich = useRichInteractions();
  const reduced = usePrefersReducedMotion();
  const sign = useDirectionSign();

  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(root);

      // Scrubbed by the scroll: the card rises, fades and straightens up as it comes in, and goes back down on the way up.
      gsap
        .timeline({ scrollTrigger: { trigger: root.current, start: "top bottom", end: "top 45%", scrub: 0.8 } })
        .fromTo(frame.current, { y: 220, opacity: 0, scale: 0.88, rotateX: 12, transformPerspective: 1200, transformOrigin: "50% 100%" }, { y: 0, opacity: 1, scale: 1, rotateX: 0, ease: "power2.out" })
        .fromTo(q("[data-media]"), { scale: 1.3 }, { scale: 1, ease: "power2.out" }, 0);

      const reveal = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 75%", once: true } });
      reveal
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

  const onEnter = (event: PointerEvent) => {
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

  const onMove = (event: PointerEvent) => {
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
    <div ref={root} data-hovered="false" className="group/card relative will-change-transform" onPointerEnter={onEnter} onPointerMove={onMove} onPointerLeave={onLeave}>
      <AppLink href={workHref(project.slug)} transitionLabel={project.title} data-cursor={viewLabel} className="block outline-offset-8">
        <div ref={frame} data-card-media className="theme-dark relative aspect-[16/10] overflow-hidden rounded-card" style={{ backgroundColor: project.color }}>
          <div ref={parallax} className="absolute inset-x-0 -inset-y-[8%]">
            <div ref={hover} className="absolute inset-0 will-change-transform">
              <div data-media className="absolute inset-0">
                <Image src={project.image} alt="" fill sizes="(min-width: 768px) 58vw, 100vw" quality={78} className="object-cover" />
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
              <span data-meta className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>
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

        {/* The home thread fades out just above the last title (LogoThread), clear of the text. */}
        <div data-title data-thread-end={last || undefined} className="mt-5 will-change-transform">
          <h3 className="text-headline font-extrabold uppercase leading-[0.92]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">
                {project.title}
              </span>
            </span>
          </h3>
          <span className="block overflow-hidden">
            <span
              className={cn(
                "text-label mt-3 flex items-center gap-2 text-accent transition-transform duration-700 ease-[var(--ease-expo)]",
                rich && "translate-y-full group-data-[hovered=true]/card:translate-y-0",
              )}
            >
              <ArrowRight aria-hidden className="size-3.5 rtl:-scale-x-100" /> {viewLabel}
            </span>
          </span>
        </div>

        <p data-meta className="mt-4 max-w-md text-sm leading-relaxed text-muted">
          {project.description}
        </p>
      </AppLink>
    </div>
  );
}
