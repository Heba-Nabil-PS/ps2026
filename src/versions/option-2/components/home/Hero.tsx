"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { FlowField } from "@/versions/option-2/components/brand/FlowField";
import { HeroMediaCycle } from "@/versions/option-2/components/home/HeroMediaCycle";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

export function Hero() {
  const { projects, t } = useContent();
  const cycle = projects.slice(0, 4).map((project) => ({ src: project.heroImage, alt: project.title }));
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] flex-col overflow-hidden" aria-labelledby="hero-title">
      {/* The brand cover art, sunk into the navy, with the identity's flowing lines over it */}
      <div aria-hidden className="absolute inset-0">
        <Image src="/images/site/cover.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/60 to-bg" />
      </div>
      <FlowField className="absolute inset-0 h-full w-full" />

      <motion.div
        className="gutter relative flex flex-1 flex-col justify-end pb-8 pt-32 md:pb-10"
        style={reduced ? undefined : { y, opacity, scale }}
      >
        {/* Mobile: the work leads — a full-width cycling visual instead of the inline frame */}
        <HeroMediaCycle images={cycle} sizes="(min-width: 768px) 0px, 90vw" className="mb-10 aspect-[4/3] w-full md:hidden" />

        <div className="mb-8 flex items-center justify-between md:mb-12">
          <RevealText as="p" immediate delay={0.1} className="text-label text-muted">
            {t.site.heroEyebrow}
          </RevealText>
          <RevealText as="p" immediate delay={0.15} className="text-label hidden text-muted md:block">
            {t.site.heroLocation}
          </RevealText>
        </div>

        <h1 id="hero-title" className="text-mega font-extrabold uppercase">
          <RevealText as="span" immediate delay={0.2} className="block">
            {t.site.heroConnected}
          </RevealText>
          <span className="flex items-center gap-[0.15em] md:ps-[12vw]">
            <HeroMediaCycle images={cycle} sizes="(min-width: 768px) 22vw, 0px" className="hidden h-[0.72em] w-[1.6em] md:inline-block" />
            <RevealText as="span" immediate delay={0.3} className="block font-serif font-medium italic tracking-[-0.02em] text-accent">
              {t.site.heroFlow}
            </RevealText>
          </span>
          <RevealText as="span" immediate delay={0.4} className="block" lineClassName="nth-2:ps-[4vw]">
            {t.site.heroInfinite}
          </RevealText>
        </h1>

        <div className="mt-10 grid grid-cols-1 items-end gap-8 border-t border-line pt-6 md:mt-14 md:grid-cols-12">
          <RevealText
            as="p"
            mode="words"
            immediate
            delay={0.6}
            className="text-lead max-w-xl text-fg/90 md:col-span-6"
          >
            {t.site.heroIntro}
          </RevealText>

          <div className="hidden items-center justify-end gap-4 md:col-span-6 md:flex">
            <span className="text-label text-muted">{t.common.scrollToExplore}</span>
            <span aria-hidden className="relative block h-12 w-px overflow-hidden bg-line">
              <span className="absolute inset-0 animate-[scroll-line_2.2s_var(--ease-quart)_infinite] bg-accent" />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
