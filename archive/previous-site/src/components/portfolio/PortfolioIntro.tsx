"use client";

import { FlowField } from "@/components/brand/FlowField";
import { useContent } from "@/i18n/LocaleProvider";
import { usePrefersReducedMotion, useRichInteractions } from "@/lib/hooks";
import { gsap, useGSAP } from "@/lib/gsap";
import { useRef } from "react";

type PortfolioIntroProps = {
  title: string;
  count: number;
  range: string;
};

/** Listing hero: oversized letters that ripple toward the cursor over drifting light. */
export function PortfolioIntro({ title, count, range }: PortfolioIntroProps) {
  const root = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const rich = useRichInteractions();
  const { locale, t } = useContent();
  // Arabic letters join, so the ripple moves whole words there instead of single letters.
  const letters = locale === "ar" ? title.split(" ").flatMap((word, i) => (i ? [" ", word] : [word])) : Array.from(title);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      if (reduced) {
        gsap.from(q("[data-fade]"), { opacity: 0, duration: 0.5 });
        return;
      }

      gsap
        .timeline({ delay: 0.15 })
        .from(q("[data-char]"), { yPercent: 120, rotate: 6, duration: 1.5, stagger: 0.045, ease: "expo.out" })
        .from(q("[data-fade]"), { y: 30, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out" }, 0.5)
        .from(q("[data-glow]"), { opacity: 0, scale: 0.6, duration: 2.4, ease: "expo.out" }, 0);

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
    <section ref={root} data-pf-exit aria-labelledby="portfolio-title" className="relative flex min-h-[100svh] flex-col overflow-hidden">
      <div
        data-glow
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[70vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_18%,transparent),transparent_70%)] blur-2xl"
      />
      <FlowField className="absolute inset-0 h-full w-full" />

      <div className="gutter relative flex flex-1 flex-col justify-between pb-10 pt-28 md:pb-12 md:pt-36">
        <div className="text-label flex items-center justify-between text-muted">
          <p data-fade>
            <span className="text-accent">({String(count).padStart(2, "0")})</span> {t.common.caseStudies}
          </p>
          <p data-fade>{range}</p>
        </div>

        <div data-title className="origin-bottom-left rtl:origin-bottom-right">
          <h1 id="portfolio-title" className="font-extrabold uppercase leading-[0.8] tracking-[-0.04em] text-[clamp(3.5rem,17.5vw,20rem)]">
            <span className="sr-only">{title}</span>
            <span aria-hidden className="flex">
              {letters.map((char, i) => (
                <span key={i} data-char-wrap className="inline-block will-change-transform">
                  <span className="inline-block overflow-hidden pb-[0.04em]">
                    <span data-char className="inline-block">
                      {char}
                    </span>
                  </span>
                </span>
              ))}
            </span>
          </h1>
        </div>

        <div className="grid grid-cols-1 items-end gap-8 border-t border-line pt-6 md:grid-cols-12">
          <p data-fade className="text-lead font-medium md:col-span-6">
            {t.portfolio.lead}{" "}
            <span className="font-serif font-medium italic text-accent">{t.portfolio.leadAccent}</span> {t.portfolio.leadEnd}
          </p>
          <div data-fade className="flex items-center gap-4 md:col-span-6 md:justify-end">
            <span className="text-label text-muted">{t.common.scrollToExplore}</span>
            <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-0 animate-[scroll-line_2.2s_var(--ease-quart)_infinite] bg-accent" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
