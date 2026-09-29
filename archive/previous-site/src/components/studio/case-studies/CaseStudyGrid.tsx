"use client";

import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { caseStudyHref, caseStudyShape, matchesFilter } from "@/data/caseStudies";
import type { PortfolioProject } from "@/data/portfolio";
import { useContent } from "@/i18n/LocaleProvider";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

/**
 * Filterable index of every case study. Filter pills share a sliding ink
 * highlight, cards re-flow with layout animation, and each frame clip-reveals
 * as it enters the viewport — the home grid's language, now searchable.
 */
export function CaseStudyGrid() {
  const { portfolio: caseStudies, caseStudiesPage, caseStudyFilters, t } = useContent();
  const section = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const { play } = useSound();

  useSectionTheme(section, "light");

  const visible = caseStudies.filter((project) => matchesFilter(project, filter));
  const filters: { label: string; value: string | null }[] = [{ label: caseStudiesPage.index.all, value: null }, ...caseStudyFilters.map((title) => ({ label: title, value: title }))];

  return (
    <section ref={section} id="index" aria-label={t.studio.allCaseStudiesLabel} className="relative bg-[#eceef2] px-4 pb-28 pt-12 text-[#0b0c0e] md:px-8 md:pb-40 md:pt-20">
      <LayoutGroup>
        <div className="mb-14 flex flex-col gap-6 border-t border-black/10 pt-6 md:mb-24 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-2" role="list" aria-label={t.studio.filterByDiscipline}>
            {filters.map((item) => {
              const active = item.value === filter;
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onPointerEnter={() => play("hover")}
                    onClick={() => {
                      play("click");
                      setFilter(item.value);
                    }}
                    className={cn(
                      "relative isolate h-10 rounded-full px-4 text-sm font-medium transition-colors duration-500",
                      active ? "text-[#f2f3f5]" : "text-black/60 hover:text-[#0b0c0e]",
                    )}
                  >
                    {active ? (
                      <motion.span
                        layoutId="case-filter"
                        aria-hidden
                        className="absolute inset-0 -z-10 rounded-full bg-[#0b0c0e]"
                        transition={{ duration: 0.6, ease: ease.expo }}
                      />
                    ) : (
                      <span aria-hidden className="absolute inset-0 -z-10 rounded-full border border-black/10" />
                    )}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="text-label tabular-nums text-black/50" aria-live="polite">
            ({String(visible.length).padStart(2, "0")}) {visible.length === 1 ? t.common.project : t.common.projects}
          </p>
        </div>

        <motion.ul layout className="grid grid-cols-1 gap-x-6 gap-y-16 md:grid-cols-2 md:gap-x-8 md:gap-y-24">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.35, ease: ease.quart } }}
                transition={{ duration: 0.9, ease: ease.expo }}
                className={cn(index % 2 === 1 && "md:mt-[18vh]")}
              >
                <CaseCard project={project} index={index} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </section>
  );
}

function CaseCard({ project, index }: { project: PortfolioProject; index: number }) {
  const { play } = useSound();
  const { t } = useContent();
  const shape = caseStudyShape(index);

  return (
    <article className="group">
      <TransitionLink
        href={caseStudyHref(project.slug)}
        transitionLabel={project.title}
        onPointerEnter={() => play("hover")}
        data-cursor="view"
        data-cursor-label={t.common.view}
        className="block"
      >
        <motion.div
          initial={{ clipPath: "inset(14% 6% 0% 6% round 24px)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 24px)" }}
          viewport={{ once: true, margin: "0px 0px -15% 0px" }}
          transition={{ duration: 1.2, ease: ease.expo }}
          className={cn("relative overflow-hidden rounded-3xl", shape === "landscape" ? "aspect-[4/3]" : "aspect-[4/5]")}
          style={{ backgroundColor: project.color }}
        >
          <div className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]">
            {project.hoverVideo ? (
              <video className="absolute inset-0 size-full object-cover" src={project.hoverVideo} poster={project.heroImage} autoPlay muted loop playsInline preload="metadata" />
            ) : (
              <Image src={project.heroImage} alt={`${project.title} — ${project.category}`} fill sizes="(min-width: 768px) 50vw, 100vw" quality={85} className="object-cover" />
            )}
          </div>
          <div aria-hidden className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/15" />
          <span
            aria-hidden
            className="absolute end-5 top-5 grid size-12 scale-0 place-items-center rounded-full bg-[#f2f3f5] text-[#0b0c0e] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-100"
          >
            <ArrowUpRight className="size-5" />
          </span>
        </motion.div>

        <div className="mt-5 flex items-start justify-between gap-6 md:mt-6">
          <div>
            <h3 className="text-2xl font-medium tracking-[-0.03em] md:text-3xl">
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat rtl:bg-right-bottom transition-[background-size] duration-700 ease-[var(--ease-expo)] group-hover:bg-[length:100%_1px]">
                {project.title}
              </span>
            </h3>
            <p className="mt-2 text-sm text-black/55">{project.category}</p>
          </div>
          <p className="text-label shrink-0 pt-2 tabular-nums text-black/45">
            {project.id}
            {project.market ? ` — ${project.market}` : ""}
          </p>
        </div>
      </TransitionLink>
    </article>
  );
}
