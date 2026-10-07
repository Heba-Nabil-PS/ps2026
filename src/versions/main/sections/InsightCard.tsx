import type { Insight } from "@/data/insights";
import { insightHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";

/**
 * An article card: the blue motion-blurred cover drifting in on hover or
 * focus, the topic and publish date, then the title. One link, "Read" lens.
 */
export function InsightCard({ insight, date, viewLabel, sizes = "(min-width: 768px) 33vw, 100vw" }: { insight: Insight; date: string; viewLabel: string; sizes?: string }) {
  return (
    <AppLink href={insightHref(insight.slug)} transitionLabel={insight.title} data-cursor={viewLabel} className="group block focus-visible:outline-offset-8">
      <div className="relative aspect-[16/11] overflow-hidden rounded-card bg-navy-800">
        <Image
          src={insight.cover}
          alt=""
          fill
          sizes={sizes}
          quality={75}
          className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.04] group-focus-visible:scale-[1.04]"
        />
        <span className="text-label absolute start-5 top-5 rounded-full bg-ink-950/60 px-3 py-2 text-paper backdrop-blur-md">{insight.topic}</span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <time dateTime={insight.date} className="text-label block tabular-nums text-subtle">{date}</time>
          <h3 className="text-lead mt-2 line-clamp-3 font-normal transition-colors duration-500 group-hover:text-sky">{insight.title}</h3>
        </div>
        <span aria-hidden className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </AppLink>
  );
}
