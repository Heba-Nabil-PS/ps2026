"use client";

import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useRef, type ReactNode } from "react";

type InkStatementProps = {
  label: string;
  children: string;
  /** Rendered under the statement, e.g. a PillButton. */
  action?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
};

/**
 * Editorial statement whose words ink in from grey to full colour as the
 * paragraph crosses the viewport — the studio's signature reading motion.
 */
export function InkStatement({ label, children, action, tone = "light", id = "statement-label", className }: InkStatementProps) {
  const section = useRef<HTMLElement>(null);
  const statement = useRef<HTMLParagraphElement>(null);

  useSectionTheme(section, tone);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(statement.current, { type: "words", autoSplit: true });
        gsap.fromTo(
          split.words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: statement.current, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.from("[data-ink-fade]", {
          y: 40,
          opacity: 0,
          duration: 1.2,
          stagger: 0.1,
          scrollTrigger: { trigger: section.current, start: "top 75%", once: true },
        });
        return () => split.revert();
      });
    },
    { scope: section },
  );

  const dark = tone === "dark";

  return (
    <section
      ref={section}
      aria-labelledby={id}
      className={cn("relative", dark ? "bg-[#07121f] text-[#f2f3f5]" : "bg-[#eceef2] text-[#07121f]", className)}
    >
      <div className="grid grid-cols-1 gap-10 px-4 py-28 md:grid-cols-12 md:px-8 md:py-28">
        <p id={id} data-ink-fade className={cn("text-label flex items-center gap-2 md:col-span-3", dark ? "text-white/50" : "text-[#07121f]/50")}>
          <span aria-hidden className={cn("size-1.5 rounded-full", dark ? "bg-[#88bbd8]" : "bg-[#07121f]")} />
          {label}
        </p>
        <div className="md:col-span-9">
          <p ref={statement} className="font-medium tracking-[-0.035em] text-[clamp(1.5rem,3vw,3.1rem)] leading-[1.12]">
            {children}
          </p>
          {action ? (
            <div data-ink-fade className="mt-12 md:mt-16">
              {action}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
