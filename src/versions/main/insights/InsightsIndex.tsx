"use client";

import { formatDate } from "@/versions/main/copy";
import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { InsightCard } from "@/versions/main/sections/InsightCard";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

/**
 * Every article, filterable by topic. Same chips and reflow as the work
 * index; the choice is kept in the URL (?topic=…) so a view can be shared.
 */
export function InsightsIndex() {
  const { copy, insights, topics, locale } = useCopy();
  const params = useSearchParams();
  const pathname = usePathname();
  const initial = params.get("topic");
  const [topic, setTopic] = useState<string | null>(topics.includes(initial ?? "") ? initial : null);

  const visible = useMemo(() => (topic ? insights.filter((insight) => insight.topic === topic) : insights), [topic, insights]);

  const choose = (value: string | null) => {
    setTopic(value);
    window.history.replaceState(null, "", value ? `${pathname}?topic=${encodeURIComponent(value)}` : pathname);
  };

  const chips = [{ value: null, title: copy.ui.all, count: insights.length }, ...topics.map((value) => ({ value, title: value, count: insights.filter((insight) => insight.topic === value).length }))];

  return (
    <div className="gutter pb-[clamp(5.5rem,12vw,11rem)] pt-10 md:pt-14">
      <LayoutGroup>
        <div role="group" aria-label={copy.insights.filterLabel} className="-mx-1 mb-14 flex gap-2 overflow-x-auto px-1 py-2 md:flex-wrap">
          {chips.map((chip) => {
            const active = topic === chip.value;
            return (
              <button
                key={chip.value ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => choose(chip.value)}
                className={cn(
                  "glass relative flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm transition-colors duration-500",
                  active ? "text-ink-900" : "text-muted hover:text-fg",
                )}
              >
                {active ? <motion.span layoutId="insight-chip" className="absolute inset-0 rounded-full bg-sky" transition={{ type: "spring", stiffness: 380, damping: 34 }} /> : null}
                <span className="relative">{chip.title}</span>
                <span className={cn("relative text-xs tabular-nums", active ? "text-ink-900/70" : "text-subtle")}>{chip.count}</span>
              </button>
            );
          })}
        </div>

        <p aria-live="polite" className="sr-only">
          {visible.length} / {insights.length}
        </p>

        <motion.ul layout className="grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((insight, index) => (
              <motion.li
                key={insight.slug}
                layout
                initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
                transition={{ duration: 0.9, ease: ease.expo, delay: Math.min(index, 6) * 0.05 }}
              >
                <InsightCard insight={insight} date={formatDate(locale, insight.date)} viewLabel={copy.ui.readMore} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </LayoutGroup>
    </div>
  );
}
