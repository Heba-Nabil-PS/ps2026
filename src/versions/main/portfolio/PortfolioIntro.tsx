"use client";

import { FlowField } from "@/versions/main/portfolio/ui/FlowField";
import { useContent } from "@/versions/main/portfolio/content";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { PULL, StretchLetter, stretchLetterOf, stretchTo } from "@/versions/main/motion/StretchLetter";
import { useRef, type ReactNode } from "react";

type PortfolioIntroProps = {
  title: string;
  /** Full-width content under the hero, e.g. the client logos. */
  footer?: ReactNode;
};

/** Listing hero: oversized letters that ripple toward the cursor over drifting light. */
export function PortfolioIntro({ title, footer }: PortfolioIntroProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const rich = useRichInteractions();
  const { locale } = useContent();
  // Arabic letters join, so the ripple moves whole words there instead of single letters.
  const letters = locale === "ar" ? title.split(" ").flatMap((word, i) => (i ? [" ", word] : [word])) : Array.from(title);
  /** The letter that stretches, as in every banner title (see StretchLetter). */
  const stretch = locale === "ar" ? undefined : stretchLetterOf(title);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const stretchLetters = q("[data-stretch-letter]");
      if (reduced) {
        gsap.from(q("[data-fade]"), { opacity: 0, duration: 0.5 });
        if (stretchLetters.length) gsap.set(stretchLetters, { "--x": stretchTo("[data-chars]") });
        return;
      }

      const intro = gsap
        .timeline({ delay: 0.15 })
        .from(q("[data-char]"), { yPercent: 120, rotate: 6, duration: 1.5, stagger: 0.045, ease: "expo.out" })
        .from(q("[data-fade]"), { y: 30, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out" }, 0.5)
        .from(q("[data-glow]"), { opacity: 0, scale: 0.6, duration: 2.4, ease: "expo.out" }, 0);
      if (stretchLetters.length) intro.to(stretchLetters, { "--x": stretchTo("[data-chars]"), ...PULL }, 0.9);

      // Scroll: the title recedes as the work comes forward.
      gsap.to(q("[data-title]"), {
        yPercent: 30,
        scale: 0.92,
        opacity: 0.15,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });

      if (!rich) return;
      const chars = q("[data-char-wrap]");
      const charY = chars.map((el) => gsap.quickTo(el, "y", { duration: 1, ease: "power3" }));
      const glowX = gsap.quickTo(q("[data-glow]"), "x", { duration: 1.6, ease: "power3" });
      const glowY = gsap.quickTo(q("[data-glow]"), "y", { duration: 1.6, ease: "power3" });

      const onMove = (event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth;
        glowX((nx - 0.5) * window.innerWidth * 0.5);
        glowY((event.clientY / window.innerHeight - 0.5) * window.innerHeight * 0.4);
        chars.forEach((el, i) => {
          const center = (i + 0.5) / chars.length;
          const proximity = Math.max(0, 1 - Math.abs(center - nx) * 3.2);
          charY[i](-proximity * 26);
        });
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: root, dependencies: [reduced, rich], revertOnUpdate: true },
  );

  return (
    <section ref={root} data-pf-exit aria-labelledby="portfolio-title" className="relative flex min-h-[60svh] flex-col justify-end overflow-hidden pb-2 pt-28 md:min-h-svh md:pb-4 md:pt-32">
      <div
        data-glow
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_70%)] blur-2xl"
      />
      <div className="gutter relative flex flex-col">
        <div data-title className="origin-bottom-left rtl:origin-bottom-right">
          <h1
            id="portfolio-title"
            className={cn(
              "stretch",
              locale === "ar" ? "text-[clamp(1.25rem,5vw,5.5rem)]" : "text-[clamp(1.2rem,6vw,6.5rem)]",
              "leading-[0.88]",
            )}
          >
            <span className="sr-only">{title}</span>
            <span aria-hidden data-chars className="flex">
              {letters.map((char, i) => (
                <span key={i} data-char-wrap className="inline-block will-change-transform">
                  <span className="inline-block overflow-hidden pb-[0.04em]">
                    <span data-char className="inline-block">
                      {char.toLowerCase() === stretch ? <StretchLetter>{char}</StretchLetter> : char}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </h1>
        </div>
      </div>
      {footer ? (
        // The lines run level behind the logo row, centred on it and spilling a little past it.
        <div data-fade className="relative">
          <FlowField center={0.5} amplitude={0.45} className="pointer-events-none absolute inset-x-0 -inset-y-1/3 h-[166%] w-full" />
          <div className="relative">{footer}</div>
        </div>
      ) : (
        <FlowField className="absolute inset-0 h-full w-full" />
      )}
    </section>
  );
}
