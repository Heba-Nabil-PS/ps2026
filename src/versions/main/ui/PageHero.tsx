import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Opening of every inner page: the page's light source behind reeded glass,
 * the stretched title and a short intro. One shell for About,
 * Services, Work, Team, Careers and Contact keeps the pages consistent.
 */
export function PageHero({
  title,
  intro,
  children,
  image = "/images/site/cover.webp",
  className,
  titleClassName,
  footer,
  heading,
}: {
  title: readonly string[];
  intro: string;
  /** Extra content under the intro (actions, counts). */
  children?: ReactNode;
  /** `null` leaves the hero clear, for a backdrop behind the page to show through (e.g. the particle logo). */
  image?: string | null;
  className?: string;
  /** Classes for the title (e.g. a smaller size). */
  titleClassName?: string;
  /** Full-width content under the intro. */
  footer?: ReactNode;
  /** A custom h1 in place of the stretched title (e.g. the Projects ripple title). */
  heading?: ReactNode;
}) {
  return (
    <section data-page-hero className={cn("relative isolate flex min-h-[46svh] flex-col justify-end overflow-hidden pb-10 pt-28 md:min-h-[68svh] md:pb-16 md:pt-48", className)}>
      {/* Masked to transparent at the foot so the backdrop dissolves into the page below, whatever its colour, instead of ending on a seam. */}
      <div aria-hidden className="absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000_0%,#000_55%,transparent_100%)]">
        {image ? (
          <>
            <Image src={image} alt="" fill priority sizes="100vw" quality={70} className="object-cover opacity-55" />
            <PointerLight className="opacity-70" />
            <FlutedGlass className="absolute inset-0" flute={34} />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-900)_20%,transparent)_0%,color-mix(in_srgb,var(--color-ink-900)_55%,transparent)_55%,var(--color-ink-900)_100%)]" />
          </>
        ) : (
          /* Readability: a soft dark pool behind the type, fading out before the edges so the page below follows on without a seam. */
          <div className="absolute inset-0 bg-[radial-gradient(70%_55%_at_32%_82%,color-mix(in_srgb,var(--color-ink-900)_72%,transparent),transparent_75%)]" />
        )}
      </div>

      <div className="gutter">
        {heading ?? (
          <StretchHeading as="h1" lines={title} immediate delay={0.35} className={titleClassName ?? "text-display"} lineClassNames={titleClassName ? undefined : [undefined, "md:ps-[8vw]"]} />
        )}
        <Reveal immediate delay={0.9} className="mt-6 grid gap-8 md:mt-7">
          {/* Sized in em so the measure tracks the fluid type: every intro (up to ~180 characters) sets on two balanced lines from md up. */}
          <p data-reveal-item className="text-lead max-w-xl text-balance text-muted md:max-w-[46em]">
            {intro}
          </p>
          {children ? (
            <div data-reveal-item className="max-w-xl">
              {children}
            </div>
          ) : null}
        </Reveal>
      </div>
      {footer}
    </section>
  );
}
