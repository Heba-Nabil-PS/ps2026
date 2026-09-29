"use client";

import { useCopy } from "@/versions/main/use-copy";
import { ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { WorkCard } from "@/versions/main/sections/WorkCard";
import { FilterMenu } from "@/versions/main/ui/FilterMenu";
import { SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/** Rhythm of the grid: wide, narrow / narrow, wide — repeating. */
const layout = (index: number) =>
  index % 4 === 0 || index % 4 === 3
    ? { span: "md:col-span-7", aspect: "landscape" as const, sizes: "(min-width: 768px) 58vw, 100vw" }
    : { span: "md:col-span-5", aspect: "portrait" as const, sizes: "(min-width: 768px) 42vw, 100vw" };

/**
 * The full work index. One quiet filter bar: a Service and an Industry menu,
 * the live result count, and Clear once anything is chosen. Counts in each
 * menu reflect the other choice, and options that would empty the grid are
 * disabled. The grid reflows with a layout animation and the choice is kept
 * in the URL (?category=branding&industry=restaurants), so a view can be shared.
 */
export function WorkIndex() {
  const { copy, work, categories, categoriesOf, industries, industryOf } = useCopy();
  const params = useSearchParams();
  const pathname = usePathname();
  const initial = params.get("category");
  const [category, setCategory] = useState<string | null>(categories.some((c) => c.slug === initial) ? initial : null);
  const initialIndustry = params.get("industry");
  const [industry, setIndustry] = useState<string | null>(industries.some((item) => item.slug === initialIndustry) ? initialIndustry : null);

  const visible = useMemo(
    () =>
      work.filter(
        (project) => (!category || categoriesOf(project).includes(category)) && (!industry || industryOf(project)?.slug === industry),
      ),
    [category, industry, work, categoriesOf, industryOf],
  );

  // The grid reflows when the filter changes; re-measure the FrameRise triggers once it settles.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 1000);
    return () => window.clearTimeout(id);
  }, [category, industry]);

  const sync = (nextCategory: string | null, nextIndustry: string | null) => {
    const query = new URLSearchParams();
    if (nextCategory) query.set("category", nextCategory);
    if (nextIndustry) query.set("industry", nextIndustry);
    const search = query.toString();
    window.history.replaceState(null, "", search ? `${pathname}?${search}` : pathname);
  };

  const choose = (slug: string | null) => {
    setCategory(slug);
    sync(slug, industry);
  };

  const chooseIndustry = (slug: string | null) => {
    setIndustry(slug);
    sync(category, slug);
  };

  // Faceted counts: each menu counts within the other menu's current choice.
  const inCategory = (slug: string | null) => work.filter((project) => !slug || categoriesOf(project).includes(slug));
  const inIndustry = (slug: string | null) => work.filter((project) => !slug || industryOf(project)?.slug === slug);
  const categoryOptions = [
    { value: null, label: copy.ui.all, count: inIndustry(industry).length },
    ...categories.map((item) => ({ value: item.slug, label: item.title, count: inIndustry(industry).filter((project) => categoriesOf(project).includes(item.slug)).length })),
  ];
  const industryOptions = [
    { value: null, label: copy.ui.all, count: inCategory(category).length },
    ...industries.map((item) => ({ value: item.slug, label: item.title, count: inCategory(category).filter((project) => industryOf(project)?.slug === item.slug).length })),
  ];
  const filtered = Boolean(category || industry);

  const clear = () => {
    setCategory(null);
    setIndustry(null);
    sync(null, null);
  };

  return (
    <div className="gutter pb-10">
      <LayoutGroup>
        <div role="group" aria-label={copy.work.filterLabel} className="relative mb-14 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-label me-2 hidden items-center gap-2 text-subtle sm:flex">
              <SlidersHorizontal aria-hidden className="size-4" />
              {copy.work.filters.label}
            </span>
            <FilterMenu label={copy.work.filters.service} options={categoryOptions} value={category} onChange={choose} />
            <FilterMenu label={copy.work.filters.industry} options={industryOptions} value={industry} onChange={chooseIndustry} />
            <AnimatePresence>
              {filtered ? (
                <motion.button
                  type="button"
                  onClick={clear}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.4, ease: ease.expo }}
                  className="flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-muted transition-colors hover:text-fg"
                >
                  <X aria-hidden className="size-4" />
                  {copy.work.filters.clear}
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>
          <p className="text-label tabular-nums text-subtle">
            <span className="text-sky">{String(visible.length).padStart(2, "0")}</span> / {String(work.length).padStart(2, "0")} {copy.work.filters.results}
          </p>
        </div>

        <p aria-live="polite" className="sr-only">
          {visible.length} / {work.length}
        </p>

        <motion.ul layout className="grid gap-x-6 gap-y-16 md:grid-cols-12 md:gap-y-24">
          <AnimatePresence mode="popLayout">
            {visible.map((project, index) => {
              const cell = layout(index);
              return (
                <motion.li
                  key={project.slug}
                  layout
                  initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                  transition={{ duration: 0.9, ease: ease.expo, delay: Math.min(index, 6) * 0.05 }}
                  className={cn(cell.span)}
                >
                  <WorkCard
                    project={project}
                    index={work.indexOf(project)}
                    viewLabel={copy.ui.view}
                    aspect={cell.aspect}
                    sizes={cell.sizes}
                    priority={index < 2}
                    frame={(media) => <FrameRise>{media}</FrameRise>}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </motion.ul>
        {visible.length === 0 ? (
          <p className="text-muted">
            {copy.work.empty}{" "}
            <button type="button" onClick={clear} className="text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {copy.work.filters.clear}
            </button>
          </p>
        ) : null}
      </LayoutGroup>
    </div>
  );
}
