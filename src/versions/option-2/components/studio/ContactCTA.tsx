"use client";

import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { useSound } from "@/versions/option-2/components/sound/SoundProvider";
import { SplitReveal } from "@/versions/option-2/components/studio/SplitReveal";
import { useSectionTheme } from "@/versions/option-2/components/studio/useSectionTheme";
import { hasWebGL, useCanvasActive } from "@/versions/option-2/components/studio/webgl/useCanvasActive";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const BlobScene = dynamic(() => import("@/versions/option-2/components/studio/webgl/BlobScene"), { ssr: false });

type ContactCTAProps = {
  /** Small line above the headline. */
  label?: string;
  /** One entry per line; the second line is set in the italic accent face. */
  title?: readonly string[];
  button?: string;
  /** Destination of the round button — defaults to the studio inbox. */
  href?: string;
  /** Skip the anchor id so a page can host its own #contact target. */
  anchor?: boolean;
};

/** Closing call to action: shader blob behind giant type and a magnetic round button. */
export function ContactCTA({ label, title, button, href, anchor = true }: ContactCTAProps = {}) {
  const defaults = useContent().studioHome.cta;
  const cta = { label: label ?? defaults.label, title: title ?? defaults.title, button: button ?? defaults.button, email: defaults.email };
  const section = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const energy = useRef(0);
  const active = useCanvasActive(section);
  const reduced = usePrefersReducedMotion();
  const lite = useMediaQuery("(max-width: 767px)");
  const [webgl, setWebgl] = useState(false);
  const { play } = useSound();

  useSectionTheme(section, "dark");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setWebgl(hasWebGL());
  }, []);

  useGSAP(
    () => {
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: section.current, start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.from("[data-cta-fade]", {
        y: 30,
        opacity: 0,
        duration: 1.2,
        stagger: 0.1,
        scrollTrigger: { trigger: section.current, start: "top 60%", once: true },
      });
    },
    { scope: section },
  );

  const excite = (on: boolean) => {
    energy.current = on ? 1 : 0;
  };

  return (
    <section
      ref={section}
      id={anchor ? "contact" : undefined}
      aria-labelledby="cta-title"
      className="relative flex min-h-[85svh] flex-col items-center justify-center overflow-hidden bg-[#07121f] px-4 py-32 text-center text-[#f2f3f5] md:px-8"
    >
      <div aria-hidden className="absolute inset-0">
        {webgl ? (
          <BlobScene active={active} energy={energy} progress={progress} lite={lite} reduced={reduced} />
        ) : (
          <div className="absolute left-1/2 top-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#16304f,#07121f_65%)] shadow-[0_0_120px_20px_rgba(136,187,216,0.15)]" />
        )}
      </div>

      <p data-cta-fade className="text-label relative mb-10 text-white/60">
        {cta.label}
      </p>

      <SplitReveal
        as="h2"
        id="cta-title"
        type="chars"
        stagger={0.02}
        className="relative font-medium tracking-[-0.055em] mix-blend-difference text-[clamp(2.75rem,7.5vw,8rem)] leading-[0.94]"
      >
        {cta.title.map((line, index) => (
          <span key={line} className={cn("block", index === 1 && "font-serif font-light italic")}>
            {line}
          </span>
        ))}
      </SplitReveal>

      <div data-cta-fade className="relative mt-10 md:mt-14">
        <Magnetic strength={0.35}>
          <a
            href={href ?? `mailto:${defaults.email}`}
            onPointerEnter={() => {
              play("hover");
              excite(true);
            }}
            onPointerLeave={() => excite(false)}
            onFocus={() => excite(true)}
            onBlur={() => excite(false)}
            className="group relative grid size-40 place-items-center overflow-hidden rounded-full bg-[#f2f3f5] text-[#07121f] md:size-48"
          >
            <span
              aria-hidden
              className="absolute inset-0 origin-bottom scale-y-0 rounded-full bg-[#88bbd8] transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-y-100"
            />
            <span className="relative flex flex-col items-center gap-2 text-base font-medium">
              <ArrowUpRight aria-hidden className="size-6 transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45" />
              {cta.button}
            </span>
          </a>
        </Magnetic>
      </div>

      <a
        data-cta-fade
        href={`mailto:${cta.email}`}
        className="relative mt-12 text-lg text-white/70 underline decoration-white/25 underline-offset-8 transition-colors hover:text-white hover:decoration-[#88bbd8] md:text-2xl"
      >
        {cta.email}
      </a>
    </section>
  );
}
