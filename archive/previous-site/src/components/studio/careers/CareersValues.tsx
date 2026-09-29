"use client";

import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef } from "react";

/**
 * Dark sheet that rises over the page: what the studio believes, as a
 * numbered grid, followed by the perks as a row of pills.
 */
export function CareersValues() {
  const { careersPage, t } = useContent();
  const { values } = careersPage;
  const section = useRef<HTMLElement>(null);
  useSectionTheme(section, "dark");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          section.current,
          { borderTopLeftRadius: "4rem", borderTopRightRadius: "4rem" },
          {
            borderTopLeftRadius: "0rem",
            borderTopRightRadius: "0rem",
            ease: "none",
            scrollTrigger: { trigger: section.current, start: "top bottom", end: "top top", scrub: true },
          },
        );
        gsap.from("[data-value]", {
          y: 50,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-values]", start: "top 80%", once: true },
        });
        gsap.from("[data-perk]", {
          y: 20,
          opacity: 0,
          scale: 0.9,
          duration: 0.9,
          stagger: 0.05,
          scrollTrigger: { trigger: "[data-perks]", start: "top 88%", once: true },
        });
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} aria-labelledby="values-title" className="relative overflow-hidden rounded-t-[4rem] bg-[#0b0c0e] px-4 pb-28 pt-28 text-[#f2f3f5] md:px-8 md:pb-40 md:pt-40">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <p className="text-label mb-8 flex items-center gap-2 text-white/50">
              <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8]" />
              {values.label}
            </p>
            <SplitReveal as="h2" id="values-title" type="lines" className="font-medium tracking-[-0.045em] text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95]">
              {values.title.map((line, index) => (
                <span key={line} className={cn("block", index === 1 && "font-serif font-light italic text-[#88bbd8]")}>
                  {line}
                </span>
              ))}
            </SplitReveal>
          </div>
        </div>

        <ol data-values className="grid grid-cols-1 gap-x-8 gap-y-12 md:col-span-7 md:grid-cols-2">
          {values.items.map((item, index) => (
            <li key={item.title} data-value className="border-t border-white/15 pt-6">
              <span className="text-label tabular-nums text-white/40">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="mt-6 text-2xl font-medium tracking-[-0.03em] md:text-3xl">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/55 md:text-base">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>

      <ul data-perks aria-label={t.studio.perks} className="mt-24 flex flex-wrap gap-3 border-t border-white/15 pt-10 md:mt-36">
        {values.perks.map((perk) => (
          <li key={perk} data-perk className="rounded-full border border-white/20 px-5 py-3 text-sm font-medium transition-colors duration-500 hover:border-[#88bbd8] hover:text-[#88bbd8]">
            {perk}
          </li>
        ))}
      </ul>
    </section>
  );
}
