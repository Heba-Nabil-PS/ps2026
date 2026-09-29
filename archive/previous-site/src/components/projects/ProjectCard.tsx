"use client";

import { ImageReveal } from "@/components/animations/ImageReveal";
import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import type { Project } from "@/data/projects";
import { useContent, useDirectionSign } from "@/i18n/LocaleProvider";
import { useRichInteractions } from "@/lib/hooks";
import { ease, springs } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { animate, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef } from "react";

type ProjectCardProps = {
  project: Project;
  /** Aspect-ratio classes for the visual. */
  aspectClassName: string;
  sizes: string;
  size?: "lg" | "md";
  preload?: boolean;
  className?: string;
};

export function ProjectCard({ project, aspectClassName, sizes, size = "md", preload, className }: ProjectCardProps) {
  const rich = useRichInteractions();
  const { play } = useSound();
  const { t } = useContent();
  const sign = useDirectionSign();
  const bounds = useRef<DOMRect | null>(null);

  // One hover value (0 → 1) drives every hover property: no React re-renders.
  const hover = useMotionValue(0);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const followX = useSpring(pointerX, springs.soft);
  const followY = useSpring(pointerY, springs.soft);

  const frameClip = useTransform(hover, (v) => {
    const inset = (1 - v) * 2.5;
    return `inset(${inset}% ${inset}% ${inset}% ${inset}%)`;
  });
  const mediaScale = useTransform(hover, [0, 1], [1.08, 1.02]);
  const mediaX = useTransform(followX, [-0.5, 0.5], [-18, 18]);
  const mediaY = useTransform(followY, [-0.5, 0.5], [-14, 14]);
  const shade = useTransform(hover, [0, 1], [0.28, 0]);
  const titleX = useTransform(followX, [-0.5, 0.5], [-10, 10]);
  const indicatorOpacity = useTransform(hover, [0, 1], [0, 1]);
  const indicatorX = useTransform(hover, [0, 1], [-12 * sign, 0]);

  const setHover = (to: number) => animate(hover, to, { duration: 0.9, ease: ease.expo });

  return (
    <article
      className={cn("group relative", className)}
      onPointerEnter={(event) => {
        if (!rich || event.pointerType !== "mouse") return;
        bounds.current = event.currentTarget.getBoundingClientRect();
        setHover(1);
        play("hover");
      }}
      onPointerMove={(event) => {
        const rect = bounds.current;
        if (!rich || !rect) return;
        pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
        pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
      }}
      onPointerLeave={() => {
        bounds.current = null;
        setHover(0);
        pointerX.set(0);
        pointerY.set(0);
      }}
    >
      <TransitionLink
        href={`/projects/${project.slug}`}
        transitionLabel={project.title}
        data-cursor="view"
        data-cursor-label={t.common.view}
        onFocus={() => setHover(1)}
        onBlur={() => setHover(0)}
        className="block outline-offset-8"
      >
        <motion.div style={{ clipPath: rich ? frameClip : undefined }}>
          <ImageReveal
            src={project.heroImage}
            video={project.heroVideo}
            alt={`${project.title} — ${project.category}`}
            sizes={sizes}
            preload={preload}
            tone={project.color}
            className={aspectClassName}
            mediaStyle={rich ? { scale: mediaScale, x: mediaX, y: mediaY } : undefined}
          >
            {rich ? (
              <motion.span aria-hidden className="pointer-events-none absolute inset-0 bg-bg" style={{ opacity: shade }} />
            ) : null}
          </ImageReveal>
        </motion.div>

        <div className={cn("mt-5 grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 md:mt-6", size === "lg" && "md:mt-8")}>
          <span className="text-label tabular-nums text-accent">{project.number}</span>
          <div className="min-w-0">
            <motion.h3
              className={cn(
                "font-extrabold uppercase will-change-transform",
                size === "lg" ? "text-headline" : "text-title",
              )}
              style={rich ? { x: titleX } : undefined}
            >
              {project.title}
            </motion.h3>
            <p className="text-label mt-3 text-muted">
              {project.category} <span aria-hidden>—</span> {project.market}
            </p>
          </div>
          <motion.span
            aria-hidden
            className="text-label flex items-center gap-1.5 self-start pt-2 text-fg"
            style={rich ? { opacity: indicatorOpacity, x: indicatorX } : undefined}
          >
            <span className="hidden sm:inline">{t.common.viewProject}</span>
            <ArrowUpRight className="size-4 text-accent" />
          </motion.span>
        </div>
      </TransitionLink>
    </article>
  );
}
