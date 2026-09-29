"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { ImageReveal } from "@/versions/option-2/components/animations/ImageReveal";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import type { Project } from "@/versions/option-2/data/projects";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Case-study opener: index, title, meta, then a visual that widens to full-bleed on scroll. */
export function ProjectHero({ project }: { project: Project }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { locale, t } = useContent();
  const { scrollYProgress } = useScroll({ target: visualRef, offset: ["start end", "start start"] });
  const inset = useTransform(scrollYProgress, [0.35, 1], [4, 0]);
  const clipPath = useTransform(inset, (v) => `inset(0% ${v}vw 0% ${v}vw)`);

  return (
    <header className="pt-32 md:pt-32">
      <div className="gutter">
        <div className="text-label mb-8 flex items-center justify-between text-muted md:mb-12">
          <RevealText as="p" immediate delay={0.05}>
            {`${t.common.project} ${project.number}`}
          </RevealText>
          <RevealText as="p" immediate delay={0.1}>
            {`${project.number} / ${t.projects.caseStudySuffix}`}
          </RevealText>
        </div>

        <RevealText as="h1" mode="words" immediate delay={0.15} className="text-display font-extrabold uppercase">
          {project.title}
        </RevealText>

        <dl className="mt-10 grid grid-cols-2 gap-6 border-t border-line pt-6 md:mt-14 md:grid-cols-4">
          {[
            { label: t.common.category, value: project.category },
            { label: t.common.market, value: project.market },
            { label: t.common.client, value: project.client },
            { label: t.common.services, value: project.services.slice(0, 2).join(locale === "ar" ? "، " : ", ") },
          ].map((item, i) => (
            <div key={item.label} className="flex flex-col">
              <dt className="text-label order-1 mb-2 text-muted">{item.label}</dt>
              <dd className="order-2">
                <RevealText as="span" immediate delay={0.35 + i * 0.05} className="block">
                  {item.value}
                </RevealText>
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <motion.div ref={visualRef} className="mt-14 md:mt-20" style={reduced ? undefined : { clipPath }}>
        <ImageReveal
          src={project.heroImage}
          video={project.heroVideo}
          alt={`${project.title} — ${t.common.heroVisual}`}
          sizes="100vw"
          preload
          parallax={0.08}
          delay={0.3}
          tone={project.color}
          className="h-[70svh] md:h-[100svh]"
        />
      </motion.div>
    </header>
  );
}
