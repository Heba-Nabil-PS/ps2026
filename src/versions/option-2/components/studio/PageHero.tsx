"use client";

import { SplitReveal } from "@/versions/option-2/components/studio/SplitReveal";
import { useStudio } from "@/versions/option-2/components/studio/StudioProvider";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import { useRef, type ReactNode } from "react";

type PageHeroProps = {
  /** Small line above the title, e.g. "Services". */
  label: string;
  /** One entry per line; `accentLine` picks which one is set in the italic accent face. */
  title: readonly string[];
  accentLine?: number;
  intro: string;
  /** Left-hand meta text on the bottom row, e.g. "6 disciplines · Alexandria — Dubai". */
  meta?: string;
  /** Right-hand slot on the bottom row; defaults to the scroll hint. */
  aside?: ReactNode;
  id?: string;
  className?: string;
};

/**
 * Inner-page hero on the light studio canvas: label, character-split title that
 * plays once the preloader leaves, and a meta row that fades up after it.
 * Content parallaxes away as the page scrolls, like the home hero.
 */
export function PageHero({ label, title, accentLine = 1, intro, meta, aside, id = "page-title", className }: PageHeroProps) {
  const section = useRef<HTMLElement>(null);
  const { introDone } = useStudio();
  const { t } = useContent();

  useSectionTheme(section, "light");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to("[data-hero-content]", {
          yPercent: -20,
          opacity: 0,
          ease: "none",
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: section },
  );

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.from("[data-hero-fade]", { y: 30, opacity: 0, duration: 1.4, stagger: 0.08, delay: 0.6, ease: "expo.out" });
    },
    { scope: section, dependencies: [introDone] },
  );

  return (
    <section
      ref={section}
      aria-labelledby={id}
      className={cn(
        "relative flex min-h-[88svh] flex-col justify-end overflow-hidden bg-[radial-gradient(120%_90%_at_70%_20%,#ffffff_0%,#eceef2_45%,#dfe2e8_100%)] text-[#07121f]",
        className,
      )}
    >
      <div data-hero-content className="relative px-4 pb-8 pt-36 md:px-8 md:pb-10 md:pt-32">
        <p data-hero-fade className="text-label mb-8 flex items-center gap-2 text-[#07121f]/50 md:mb-12">
          <span aria-hidden className="size-1.5 rounded-full bg-[#07121f]" />
          {label}
        </p>

        <SplitReveal
          as="h1"
          id={id}
          type="chars"
          trigger="manual"
          play={introDone}
          delay={0.2}
          stagger={0.03}
          duration={1.6}
          className="max-w-[13ch] font-medium tracking-[-0.055em] text-[clamp(2.75rem,6.5vw,7rem)] leading-[0.94]"
        >
          {title.map((line, index) => (
            <span key={line} className={cn("block", index === accentLine && "ps-[0.6em] font-serif font-light italic")}>
              {line}
            </span>
          ))}
        </SplitReveal>

        <div className="mt-10 grid grid-cols-1 items-end gap-6 border-t border-[#07121f]/10 pt-5 md:mt-14 md:grid-cols-12">
          <p data-hero-fade className="text-label text-[#07121f]/50 md:col-span-3">
            {meta}
          </p>
          <p data-hero-fade className="max-w-md text-base leading-snug text-[#07121f]/70 md:col-span-5 md:text-lg">
            {intro}
          </p>
          <div data-hero-fade className="flex items-center gap-3 md:col-span-4 md:justify-end">
            {aside ?? (
              <>
                <span className="text-label text-[#07121f]/50">{t.common.scrollToExplore}</span>
                <span className="grid size-11 place-items-center rounded-full border border-[#07121f]/15">
                  <ArrowDown aria-hidden className="size-4 animate-[bob_2.4s_ease-in-out_infinite]" />
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
