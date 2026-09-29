"use client";

import { useStudio } from "@/components/studio/StudioProvider";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { useRef } from "react";

const SEEN_KEY = "ps-studio-intro";

function hasSeenIntro() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}

/**
 * Full-screen counter that covers hydration and WebGL warm-up, then wipes up.
 * Plays in full once per session; later visits get a short fade. Rendered on
 * the server so the page never flashes unstyled, with a CSS failsafe that
 * hides it if scripts never run.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const { completeIntro } = useStudio();
  const { t } = useContent();
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      lenis?.stop();
      const finish = () => {
        lenis?.start();
        el.style.display = "none";
      };

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || hasSeenIntro()) {
        gsap.to(el, {
          autoAlpha: 0,
          duration: reduced ? 0.01 : 0.5,
          delay: 0.1,
          ease: "power2.out",
          onStart: completeIntro,
          onComplete: finish,
        });
        return;
      }

      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {}

      const progress = { value: 0 };
      const tl = gsap.timeline({ onComplete: finish });
      tl.to(progress, {
        value: 100,
        duration: 1.9,
        ease: "power3.inOut",
        onUpdate: () => {
          if (count.current) count.current.textContent = String(Math.round(progress.value)).padStart(3, "0");
          if (bar.current) bar.current.style.transform = `scaleX(${progress.value / 100})`;
        },
      })
        .to("[data-preloader-fade]", { yPercent: -120, opacity: 0, duration: 0.6, ease: "power3.in", stagger: 0.05 })
        .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.2")
        .call(completeIntro, [], "-=0.75");
    },
    { scope: root, dependencies: [lenis] },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[95] flex flex-col justify-between bg-[#0b0c0e] p-5 text-[#f2f3f5] md:p-8"
      style={{ clipPath: "inset(0% 0% 0% 0%)" }}
    >
      <div className="flex items-start justify-between overflow-hidden">
        <p data-preloader-fade className="text-label text-[#8a8f98]">
          {t.studio.preloaderStudio}
        </p>
        <p data-preloader-fade className="text-label text-[#8a8f98]">
          {t.studio.preloaderLoading}
        </p>
      </div>

      <div>
        <div className="flex items-end justify-between overflow-hidden">
          <p data-preloader-fade className="max-w-[16ch] text-lg leading-tight text-[#8a8f98] md:text-2xl">
            {t.studio.preloaderTagline}
          </p>
          <span
            ref={count}
            data-preloader-fade
            className="block font-medium tabular-nums leading-[0.8] tracking-[-0.06em] text-[clamp(5rem,18vw,16rem)]"
          >
            000
          </span>
        </div>
        <div className="mt-6 h-px w-full bg-white/15">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-white rtl:origin-right" />
        </div>
      </div>
    </div>
  );
}
