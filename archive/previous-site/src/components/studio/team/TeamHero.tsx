"use client";

import { PillButton } from "@/components/studio/PillButton";
import { useStudio } from "@/components/studio/StudioProvider";
import { TeamBackdrop } from "@/components/studio/team/TeamBackdrop";
import { useSectionTheme } from "@/components/studio/useSectionTheme";
import { useContent, useDirectionSign } from "@/i18n/LocaleProvider";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";

/* Resting fan of the three hero cards: horizontal offset (%), rotation, lift (%). */
const fan = [
  { x: -34, rotate: -9, y: 6 },
  { x: 0, rotate: 2, y: -4 },
  { x: 34, rotate: 11, y: 8 },
];

/**
 * Scene 1 — opening. After the preloader leaves: the headline's words rise
 * out of masks one by one, three photo cards are dealt into a fan, the flow
 * line draws itself and the floating shapes pop in. Scrolling away splits
 * the fan apart at different speeds while the headline sinks and softens.
 */
export function TeamHero() {
  const { teamPage, site } = useContent();
  const { hero } = teamPage;
  const { introDone } = useStudio();
  const rich = useRichInteractions();
  const sign = useDirectionSign();
  const section = useRef<HTMLElement>(null);
  const played = useRef(false);

  useSectionTheme(section, "light");

  // Entrance: holds everything hidden until the preloader is gone, then plays once.
  useGSAP(
    () => {
      const title = section.current?.querySelector<HTMLElement>("[data-hero-title]");
      if (!title) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set(title, { autoAlpha: 1 });
        gsap.set("[data-hero-card]", { xPercent: (i) => fan[i].x * sign, yPercent: (i) => fan[i].y, rotate: (i) => fan[i].rotate * sign });
        return;
      }

      const split = SplitText.create(title, {
        type: "lines,words",
        mask: "words",
        linesClass: "split-line",
        autoSplit: true,
        onSplit(self) {
          gsap.set(title, { autoAlpha: 1 });
          if (played.current) return;
          const from = { yPercent: 118, rotate: 8 * sign, transformOrigin: sign > 0 ? "0% 100%" : "100% 100%" };
          if (!introDone) {
            gsap.set(self.words, from);
            return;
          }
          return gsap.from(self.words, { ...from, duration: 1.5, ease: "expo.out", stagger: 0.07, delay: 0.1 });
        },
      });

      const hidden = { yPercent: 160, xPercent: 0, rotate: 0, autoAlpha: 0 };
      const paths = gsap.utils.toArray<SVGPathElement>("[data-draw]").slice(0, 1);
      const lengths = paths.map((path) => path.getTotalLength());

      if (!introDone) {
        gsap.set("[data-hero-card]", hidden);
        gsap.set("[data-float]", { scale: 0, autoAlpha: 0 });
        gsap.set("[data-hero-fade]", { y: 30, autoAlpha: 0 });
        paths.forEach((path, i) => gsap.set(path, { strokeDasharray: lengths[i], strokeDashoffset: lengths[i] }));
        return () => split.revert();
      }

      if (played.current) {
        gsap.set("[data-hero-card]", { xPercent: (i) => fan[i].x * sign, yPercent: (i) => fan[i].y, rotate: (i) => fan[i].rotate * sign });
      } else {
        const tl = gsap.timeline({ onComplete: () => void (played.current = true) });
        tl.fromTo(
          "[data-hero-card]",
          hidden,
          {
            xPercent: (i) => fan[i].x * sign,
            yPercent: (i) => fan[i].y,
            rotate: (i) => fan[i].rotate * sign,
            autoAlpha: 1,
            duration: 1.8,
            ease: "expo.out",
            stagger: 0.12,
          },
          0.45,
        )
          .fromTo(paths, { strokeDashoffset: (i) => lengths[i] }, { strokeDashoffset: 0, duration: 2.4, ease: "power2.inOut" }, 0.2)
          .fromTo(
            "[data-float]",
            { scale: 0, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 1.2, ease: "back.out(1.6)", stagger: { each: 0.08, from: "random" } },
            0.9,
          )
          .fromTo("[data-hero-fade]", { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.3, ease: "expo.out", stagger: 0.08 }, 1);
      }

      // Idle life on inner wrappers, so it never fights the fan or scroll transforms.
      gsap.utils.toArray<HTMLElement>("[data-hero-card-inner]").forEach((card, i) => {
        gsap.to(card, {
          y: i % 2 ? 10 : -10,
          rotate: i % 2 ? -1.2 : 1.2,
          duration: 3.2 + i * 0.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });

      return () => split.revert();
    },
    { scope: section, dependencies: [introDone, sign], revertOnUpdate: true },
  );

  // Scroll exit: scrubbed, so it reads as the camera pulling away.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: section.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
        tl.to("[data-hero-content]", { yPercent: 18, scale: 0.94, autoAlpha: 0.2, transformOrigin: "50% 0%" }, 0)
          .to("[data-hero-stack]", { yPercent: -12 }, 0)
          .to("[data-hero-card-exit]", { yPercent: (i) => [-40, -80, -55][i], rotate: (i) => [-10, 6, 16][i] * sign, xPercent: (i) => [-18, 0, 18][i] * sign }, 0)
          .to("[data-float]", { yPercent: (_i, el) => -120 * Number((el as HTMLElement).dataset.depth ?? 1) }, 0);
      });
    },
    { scope: section, dependencies: [sign], revertOnUpdate: true },
  );

  // Pointer parallax on the floating shapes and the card stack (fine pointers only).
  useGSAP(
    (_context, contextSafe) => {
      if (!rich || !contextSafe) return;
      const floats = gsap.utils.toArray<HTMLElement>("[data-float]").map((el) => ({
        depth: Number(el.dataset.depth ?? 1),
        x: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3.out" }),
        y: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3.out" }),
      }));
      const stack = section.current?.querySelector("[data-hero-stack-tilt]");
      const tiltX = stack ? gsap.quickTo(stack, "rotationY", { duration: 1.4, ease: "power3.out" }) : null;
      const tiltY = stack ? gsap.quickTo(stack, "rotationX", { duration: 1.4, ease: "power3.out" }) : null;

      const onMove = contextSafe((event: PointerEvent) => {
        const nx = event.clientX / window.innerWidth - 0.5;
        const ny = event.clientY / window.innerHeight - 0.5;
        floats.forEach((f) => {
          f.x(nx * 60 * f.depth);
          f.y(ny * 60 * f.depth);
        });
        tiltX?.(nx * 14);
        tiltY?.(ny * -10);
      });
      window.addEventListener("pointermove", onMove, { passive: true });
      return () => window.removeEventListener("pointermove", onMove);
    },
    { scope: section, dependencies: [rich] },
  );

  // Hovering the stack spreads the fan wider; leaving settles it back.
  const spread = (open: boolean) => {
    const cards = section.current?.querySelectorAll("[data-hero-card]");
    if (!rich || !played.current || !cards) return;
    gsap.to(cards, {
      xPercent: (i) => fan[i].x * (open ? 1.45 : 1) * sign,
      rotate: (i) => fan[i].rotate * (open ? 1.6 : 1) * sign,
      yPercent: (i) => fan[i].y + (open && i === 1 ? -6 : 0),
      duration: 1,
      ease: "expo.out",
      overwrite: "auto",
    });
  };

  return (
    <section
      ref={section}
      aria-labelledby="team-title"
      className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-[radial-gradient(120%_90%_at_70%_20%,#ffffff_0%,#eceef2_45%,#dfe2e8_100%)] text-[#0b0c0e]"
    >
      <TeamBackdrop tone="light" />

      <div className="relative grid grid-cols-1 items-end gap-10 px-4 pb-8 pt-32 md:grid-cols-12 md:px-8 md:pb-10 md:pt-40">
        <div data-hero-content className="md:col-span-7">
          <p data-hero-fade className="text-label mb-8 flex items-center gap-2 text-black/50 md:mb-12">
            <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
            {hero.label}
          </p>
          <h1
            id="team-title"
            data-hero-title
            className="split-reveal font-medium tracking-[-0.055em] text-[clamp(3rem,8.4vw,9.5rem)] leading-[0.88]"
          >
            {hero.title.map((line, index) => (
              <span key={line} className={cn("block", index === 1 && "ps-[0.8em] font-serif font-light italic text-[#122443]")}>
                {line}
              </span>
            ))}
          </h1>
        </div>

        <div
          data-hero-stack
          className="relative mx-auto h-[46vw] max-h-[30rem] w-full max-w-[34rem] md:col-span-5 md:h-[34vw] [perspective:1200px]"
          onPointerEnter={() => spread(true)}
          onPointerLeave={() => spread(false)}
        >
          <div data-hero-stack-tilt className="absolute inset-0 [transform-style:preserve-3d]">
            {hero.cards.map((src, index) => (
              <div key={src} data-hero-card-exit className="absolute inset-0 grid place-items-center" style={{ zIndex: index === 1 ? 3 : 1 }}>
                <div data-hero-card className="w-[42%] will-change-transform">
                  <div
                    data-hero-card-inner
                    className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-[#dfe2e8] shadow-[0_30px_60px_-20px_rgba(11,12,14,0.35)]"
                  >
                    <Image src={src} alt="" fill loading="eager" fetchPriority={index === 1 ? "high" : "auto"} sizes="(min-width: 768px) 16vw, 40vw" className="object-cover" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative mx-4 grid grid-cols-1 items-end gap-6 border-t border-black/10 pb-8 pt-5 md:mx-8 md:grid-cols-12 md:pb-10">
        <p data-hero-fade className="text-label text-black/50 md:col-span-3">
          {hero.meta} ·{" "}
          <a href={`mailto:${site.email}`} className="link-underline text-black/80">
            {hero.hello}
          </a>
        </p>
        <p data-hero-fade className="max-w-md text-base leading-snug text-black/70 md:col-span-5 md:text-lg">
          {hero.intro}
        </p>
        <div data-hero-fade className="flex items-center gap-3 md:col-span-4 md:justify-end">
          <PillButton href="#crew" icon={<ArrowDown aria-hidden className="size-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0.5" />}>
            {hero.action}
          </PillButton>
        </div>
      </div>
    </section>
  );
}
