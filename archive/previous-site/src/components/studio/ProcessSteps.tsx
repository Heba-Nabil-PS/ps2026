"use client";

import { SplitReveal } from "@/components/studio/SplitReveal";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type Step = { readonly title: string; readonly body: string };

type ProcessStepsProps = {
  label: string;
  /** One entry per line; the last line is set in the italic accent face. */
  title: readonly string[];
  steps: readonly Step[];
  tone?: "light" | "dark";
  id?: string;
};

/**
 * Numbered steps with a sticky headline. A hairline draws down the list as it
 * scrolls, each row rises in, and its number inks to the accent when reached.
 */
export function ProcessSteps({ label, title, steps, tone = "light", id = "process-title" }: ProcessStepsProps) {
  const section = useRef<HTMLElement>(null);
  const dark = tone === "dark";

  useSectionTheme(section, tone);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-progress]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: 0.5 },
          },
        );
        gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
          gsap.from(step.querySelectorAll("[data-step-fade]"), {
            y: 40,
            opacity: 0,
            duration: 1.1,
            stagger: 0.08,
            scrollTrigger: { trigger: step, start: "top 82%", once: true },
          });
          gsap.to(step.querySelector("[data-step-index]"), {
            color: "#88bbd8",
            duration: 0.6,
            scrollTrigger: { trigger: step, start: "top 60%", end: "bottom 60%", toggleActions: "play reverse play reverse" },
          });
        });
      });
    },
    { scope: section },
  );

  return (
    <section
      ref={section}
      aria-labelledby={id}
      className={cn("relative px-4 py-28 md:px-8 md:py-40", dark ? "bg-[#0b0c0e] text-[#f2f3f5]" : "bg-[#eceef2] text-[#0b0c0e]")}
    >
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-32">
            <p className={cn("text-label mb-8 flex items-center gap-2", dark ? "text-white/50" : "text-black/50")}>
              <span aria-hidden className={cn("size-1.5 rounded-full", dark ? "bg-[#88bbd8]" : "bg-[#0b0c0e]")} />
              {label}
            </p>
            <SplitReveal as="h2" id={id} type="lines" className="font-medium tracking-[-0.045em] text-[clamp(2.5rem,5.5vw,6rem)] leading-[0.95]">
              {title.map((line, index) => (
                <span
                  key={line}
                  className={cn("block", index === title.length - 1 && "font-serif font-light italic", index === title.length - 1 && dark && "text-[#88bbd8]")}
                >
                  {line}
                </span>
              ))}
            </SplitReveal>
          </div>
        </div>

        <div className="relative md:col-span-7">
          <div aria-hidden className={cn("absolute bottom-0 start-0 top-0 w-px", dark ? "bg-white/10" : "bg-black/10")}>
            <div data-progress className="h-full w-full origin-top bg-[#88bbd8]" />
          </div>
          <ol data-steps className="flex flex-col">
            {steps.map((step, index) => (
              <li
                key={step.title}
                data-step
                className={cn("grid grid-cols-[3.5rem_1fr] gap-4 border-b py-10 ps-6 md:grid-cols-[5rem_1fr] md:py-14 md:ps-10", dark ? "border-white/15" : "border-black/10")}
              >
                <span data-step-index data-step-fade className={cn("text-label pt-2 tabular-nums", dark ? "text-white/40" : "text-black/40")}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 data-step-fade className="text-3xl font-medium tracking-[-0.035em] md:text-5xl">
                    {step.title}
                  </h3>
                  <p data-step-fade className={cn("mt-4 max-w-lg text-base leading-relaxed md:text-lg", dark ? "text-white/55" : "text-black/60")}>
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
