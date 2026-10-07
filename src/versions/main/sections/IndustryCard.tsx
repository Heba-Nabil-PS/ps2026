import type { Industry } from "@/data/industries";
import { cn } from "@/lib/utils";
import { industryHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * An industry card. Same behaviour as a case study card: the image is
 * monochrome at rest and turns to colour on hover or keyboard focus, and the
 * whole card is one link with a "View" lens.
 */
export function IndustryCard({
  industry,
  index,
  count,
  flag,
  viewLabel,
  tall = false,
  sizes = "(min-width: 768px) 50vw, 100vw",
  frame,
}: {
  industry: Industry;
  index: number;
  /** "3 projects", already localised. */
  count: string;
  /** Flagship label, shown only on the flagship industry. */
  flag?: string;
  viewLabel: string;
  tall?: boolean;
  sizes?: string;
  /** Wraps the media (e.g. FrameRise). */
  frame?: (media: ReactNode) => ReactNode;
}) {
  const media = (
    <div className={cn("relative overflow-hidden rounded-card bg-navy-800", tall ? "aspect-[4/5] md:aspect-[16/12]" : "aspect-[4/5] md:aspect-[16/11]")}>
      <Image
        src={industry.image}
        alt=""
        fill
        sizes={sizes}
        quality={75}
        className="object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.04]"
      />
      <div className="absolute inset-x-5 top-5 flex flex-wrap items-center gap-2">
        <span className="text-label rounded-full bg-ink-950/60 px-3 py-2 text-paper backdrop-blur-md">{count}</span>
        {industry.flagship && flag ? <span className="text-label rounded-full bg-sky px-3 py-2 text-ink-900">{flag}</span> : null}
      </div>
    </div>
  );

  return (
    <AppLink href={industryHref(industry.slug)} transitionLabel={industry.title} data-cursor={viewLabel} className="group block focus-visible:outline-offset-8">
      {frame ? frame(media) : media}
      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span className="text-label tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="text-title font-medium">{industry.title}</h3>
            <p className="mt-1 max-w-md text-sm text-muted">{industry.short}</p>
          </div>
        </div>
        <span aria-hidden className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </AppLink>
  );
}
