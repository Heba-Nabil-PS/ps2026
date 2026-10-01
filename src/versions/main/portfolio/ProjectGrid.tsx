"use client";

import { ProjectCard, type CardLayout } from "@/versions/main/portfolio/ProjectCard";
import { useContent } from "@/versions/main/portfolio/content";
import { useCopy } from "@/versions/main/use-copy";
import { FilterMenu } from "@/versions/main/ui/FilterMenu";
import type { PortfolioProject } from "@/data/portfolio";
import { ScrollTrigger } from "@/lib/gsap";
import { ease } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

const copy = {
  en: { filters: "Filter", service: "Service", market: "Market", all: "All", clear: "Clear", results: "projects", empty: "No projects match these filters." },
  ar: { filters: "تصفية", service: "الخدمة", market: "السوق", all: "الكل", clear: "مسح", results: "مشروعًا", empty: "لا توجد مشاريع تطابق هذه التصفية." },
};

const noSubscribe = () => () => {};

/** A six-beat editorial rhythm that repeats for any number of projects: wide, pair (offset), pair (offset), wide. */
const rhythm: CardLayout[] = [
  { className: "md:col-span-12", aspect: "aspect-[4/5] md:aspect-[16/8]", sizes: "100vw", size: "lg" },
  { className: "md:col-span-7", aspect: "aspect-[4/5] md:aspect-[4/3]", sizes: "(min-width: 768px) 58vw, 100vw", size: "md" },
  { className: "md:col-span-5 md:mt-[10vh]", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
  { className: "md:col-span-5", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
  { className: "md:col-span-7 md:col-start-6 md:mt-[12vh]", aspect: "aspect-[4/5] md:aspect-[16/11]", sizes: "(min-width: 768px) 58vw, 100vw", size: "md" },
  { className: "md:col-span-10 md:col-start-2", aspect: "aspect-[4/5] md:aspect-[16/9]", sizes: "(min-width: 768px) 84vw, 100vw", size: "lg" },
];

export function ProjectGrid({ projects }: { projects: PortfolioProject[] }) {
  const { locale } = useContent();
  const c = copy[locale];
  // Services are the six disciplines; a service card links here as ?service=branding.
  const { categories, categoriesOf } = useCopy();
  const pathname = usePathname();
  // Read the URL without useSearchParams, so the static page still renders the grid on the server.
  const fromUrl = useSyncExternalStore(noSubscribe, () => new URLSearchParams(window.location.search).get("service"), () => null);
  const [chosen, setChosen] = useState<string | null | undefined>(undefined);
  const requested = chosen === undefined ? fromUrl : chosen;
  const service = categories.some((item) => item.slug === requested) ? requested : null;
  const [market, setMarket] = useState<string | null>(null);

  const marketList = useMemo(() => [...new Set(projects.map((p) => p.market).filter((m): m is string => Boolean(m)))], [projects]);

  const inService = (value: string | null) => projects.filter((p) => !value || categoriesOf(p).includes(value));
  const inMarket = (value: string | null) => projects.filter((p) => !value || p.market === value);
  const visible = inService(service).filter((p) => !market || p.market === market);

  // Keep the service in the URL so a filtered view can be shared.
  const setService = (value: string | null) => {
    setChosen(value);
    window.history.replaceState(null, "", value ? `${pathname}?service=${value}` : pathname);
  };

  const serviceOptions = [
    { value: null, label: c.all, count: inMarket(market).length },
    ...categories.map((item) => ({ value: item.slug, label: item.title, count: inMarket(market).filter((p) => categoriesOf(p).includes(item.slug)).length })),
  ];
  const marketOptions = [
    { value: null, label: c.all, count: inService(service).length },
    ...marketList.map((value) => ({ value, label: value, count: inService(service).filter((p) => p.market === value).length })),
  ];
  const filtered = Boolean(service || market);

  // The grid reflows when the filter changes; re-measure the scroll triggers once it settles.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 600);
    return () => window.clearTimeout(id);
  }, [service, market]);

  const clear = () => {
    setService(null);
    setMarket(null);
  };

  return (
    <>
      <div role="group" aria-label={c.filters} className="relative mb-12 flex flex-wrap items-center justify-between gap-4 border-y border-line py-4 md:mb-16">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-label me-2 hidden items-center gap-2 text-subtle sm:flex">
            <SlidersHorizontal aria-hidden className="size-4" />
            {c.filters}
          </span>
          <FilterMenu label={c.service} options={serviceOptions} value={service} onChange={setService} />
          <FilterMenu label={c.market} options={marketOptions} value={market} onChange={setMarket} />
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
                {c.clear}
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
        <p className="text-label tabular-nums text-subtle">
          <span className="text-sky">{String(visible.length).padStart(2, "0")}</span> / {String(projects.length).padStart(2, "0")} {c.results}
        </p>
      </div>

      <p aria-live="polite" className="sr-only">
        {visible.length} / {projects.length}
      </p>

      <ul className="grid grid-cols-1 gap-y-24 md:grid-cols-12 md:gap-x-8 md:gap-y-40">
        {visible.map((project, i) => {
          const layout = rhythm[i % rhythm.length];
          return (
            <li key={project.slug} className={layout.className}>
              <ProjectCard project={project} layout={{ ...layout, className: "" }} preload={i === 0} />
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? (
        <p className="text-muted">
          {c.empty}{" "}
          <button type="button" onClick={clear} className="text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
            {c.clear}
          </button>
        </p>
      ) : null}
    </>
  );
}
