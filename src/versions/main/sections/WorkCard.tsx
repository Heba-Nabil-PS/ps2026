import type { PortfolioProject } from "@/data/portfolio";
import { workHref } from "@/versions/main/data/work";
import { cn } from "@/lib/utils";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * A case study card. The image is monochrome at rest and turns to colour on
 * hover or keyboard focus (principle P5: the work "comes alive"). The whole
 * card is one link; the cursor opens a "View" lens over it.
 */
export function WorkCard({
  project,
  index,
  viewLabel,
  aspect = "landscape",
  sizes = "(min-width: 768px) 60vw, 100vw",
  priority,
  image,
  overlay = true,
  mono = true,
  frame,
}: {
  project: PortfolioProject;
  index: number;
  viewLabel: string;
  aspect?: "landscape" | "portrait" | "wide";
  sizes?: string;
  priority?: boolean;
  /** Card artwork, when it differs from the case-study hero. */
  image?: string;
  /** The gradient that darkens the foot of the image at rest. */
  overlay?: boolean;
  /** Monochrome at rest, colour on hover. Off shows the image in colour throughout. */
  mono?: boolean;
  /** Wraps the media (e.g. FrameRise). */
  frame?: (media: ReactNode) => ReactNode;
}) {
  const media = (
    <div
      className={cn(
        "relative overflow-hidden rounded-card bg-navy-800",
        aspect === "landscape" && "aspect-[16/11]",
        aspect === "portrait" && "aspect-[4/5]",
        aspect === "wide" && "aspect-[16/9]",
      )}
      style={{ backgroundColor: project.color }}
    >
      <Image
        src={image ?? project.heroImage}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        quality={75}
        className={cn(
          "object-cover transition-transform duration-[1.4s] ease-expo group-hover:scale-[1.04]",
          mono && "mono group-hover:[filter:none] group-focus-visible:[filter:none]",
        )}
      />
      {overlay && <div aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgb(3_7_13/0.55))] transition-opacity duration-700 group-hover:opacity-0" />}
      <span className="text-label absolute start-5 top-5 rounded-full bg-ink-950/60 px-3 py-2 text-paper backdrop-blur-md">{project.category}</span>
    </div>
  );

  return (
    <AppLink href={workHref(project.slug)} transitionLabel={project.title} data-cursor={viewLabel} className="group block focus-visible:outline-offset-8">
      {frame ? frame(media) : media}
      <div className="mt-5 flex items-start justify-between gap-6">
        <div className="flex items-baseline gap-4">
          <span className="text-label tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="text-title font-medium">{project.title}</h3>
            <p className="mt-1 max-w-md text-sm text-muted">{project.description}</p>
          </div>
        </div>
        <span aria-hidden className="mt-1 grid size-10 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-700 ease-expo group-hover:rotate-45 group-hover:border-sky group-hover:bg-sky group-hover:text-ink-900 rtl:-scale-x-100">
          <ArrowUpRight className="size-4" />
        </span>
      </div>
    </AppLink>
  );
}
