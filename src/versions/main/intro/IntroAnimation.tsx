"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { LOGO_DRAW, LOGO_PATHS } from "@/shared/brand/logo-paths";
import { INTRO_CLASS, signalIntroReveal } from "@/versions/main/intro/intro-signal";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

/*
 * The seam the page splits along is the logo's own stem (LOGO_DRAW.stem), carried
 * across the whole screen: same angle, through the centre.
 */
const [stemX1, stemY1, stemX2, stemY2] = (LOGO_DRAW.stem.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
const STEM = { x: stemX2 - stemX1, y: stemY2 - stemY1 };
const STEM_LENGTH = Math.hypot(STEM.x, STEM.y);
/** Angle of the drawn seam line, in degrees. */
const SEAM_ANGLE = (Math.atan2(STEM.y, STEM.x) * 180) / Math.PI;
/** How far the seam sits from the centre at the top and bottom edges, in vh (it leans down to the left). */
const SEAM_EDGE = Math.abs(STEM.x / STEM.y) * 50;
/** Unit normal pointing into the left-hand panel; each half slides away along it. */
const NORMAL = { x: -STEM.y / STEM_LENGTH, y: STEM.x / STEM_LENGTH };

/**
 * Step one: fine lines streaming across the dark, like the pen stroke the logo is
 * made of. Deterministic curves (no randomness) so server and client markup match.
 */
const FLOW_LINES = Array.from({ length: 15 }, (_, i) => {
  const y = 450 + (i - 7) * 36;
  const lift = (((i * 37) % 11) - 5) * 10;
  const swell = (60 + ((i * 53) % 7) * 16) * (i % 2 ? 1 : -1);
  return {
    d: `M-60 ${y + lift} C 380 ${y - swell}, 1060 ${y + swell}, 1500 ${y - lift}`,
    opacity: i === 7 ? 1 : 0.3 + ((i * 29) % 5) * 0.1,
  };
});

/**
 * Home intro — the brand drawing itself, then opening the page.
 *
 * 1. Lines stream across the dark canvas (the "connected flow").
 * 2. They converge and the PSdigital mark draws from the blur, one pen line at a
 *    time, and the wordmark rises under it.
 * 3. The stem's line cuts across the screen and the page splits open along it,
 *    revealing the hero, which starts its own entrance (see intro-signal).
 * 4. The overlay unmounts.
 *
 * It plays on every full load of the home page, not on client-side visits (the head
 * script in the main layout decides before first paint), never with reduced motion,
 * and any key, click or tap skips straight to the reveal.
 */
export function IntroAnimation() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);
  const lenis = useLenis();

  // Hold the page still while the intro plays.
  useEffect(() => {
    if (done || !document.documentElement.classList.contains(INTRO_CLASS)) return;
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, [lenis, done]);

  useGSAP(
    () => {
      const html = document.documentElement;
      const finish = () => {
        html.classList.remove(INTRO_CLASS);
        signalIntroReveal();
        setDone(true);
      };

      if (!html.classList.contains(INTRO_CLASS) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      window.scrollTo(0, 0);
      // Far enough that each half clears every corner of the viewport.
      const travel = Math.hypot(window.innerWidth, window.innerHeight);

      gsap.set("[data-seam]", { xPercent: -50, yPercent: -50, rotation: SEAM_ANGLE, scaleX: 0 });
      const tl = gsap.timeline({ onComplete: finish });
      tl
        // 1 — the lines stream in from the centre outwards
        .fromTo("[data-flow]", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, ease: "power3.inOut", stagger: { each: 0.035, from: "center" } }, 0)
        // 2 — they gather into a single point as the mark takes shape
        .to("[data-flow-group]", { scaleY: 0.04, opacity: 0, duration: 0.9, ease: "power4.in", transformOrigin: "50% 50%" }, 0.75)
        .fromTo(
          "[data-intro-logo]",
          { scale: 1.3, rotation: -12, opacity: 0, filter: "blur(16px)" },
          { scale: 1, rotation: 0, opacity: 1, filter: "blur(0px)", duration: 1.5, ease: "power4.out" },
          0.9,
        )
        .to("[data-draw='main']", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, 0.95)
        .to("[data-draw='stem']", { strokeDashoffset: 0, duration: 0.45, ease: "power2.inOut" }, 1.35)
        .to("[data-draw='inner']", { strokeDashoffset: 0, duration: 1, ease: "power2.inOut" }, 1.5)
        .fromTo("[data-glyph]", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.04 }, 1.9)
        // 3 — the stem's line crosses the screen and the page opens along it
        .addLabel("split", 2.7)
        .fromTo("[data-seam]", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, "split-=0.45")
        .to("[data-intro-logo]", { scale: 0.92, opacity: 0, filter: "blur(10px)", duration: 0.55, ease: "power3.in" }, "split-=0.25")
        .call(signalIntroReveal, [], "split+=0.15")
        .to("[data-panel='a']", { x: NORMAL.x * travel, y: NORMAL.y * travel, duration: 1.15, ease: "expo.inOut" }, "split")
        .to("[data-panel='b']", { x: -NORMAL.x * travel, y: -NORMAL.y * travel, duration: 1.15, ease: "expo.inOut" }, "split")
        .to("[data-seam]", { opacity: 0, duration: 0.4, ease: "power2.out" }, "split+=0.2");

      // Any key, click or tap skips to the seam.
      const skipAt = (tl.labels.split ?? 0) - 0.45;
      const skip = () => {
        if (tl.time() < skipAt) tl.seek(skipAt);
      };
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
      };
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div ref={root} aria-hidden className="intro fixed inset-0 z-90 overflow-hidden">
      {/* The two halves of the curtain, cut along the stem's angle (1px overlap hides the seam). */}
      <div
        data-panel="a"
        className="absolute inset-0 bg-ink-950 will-change-transform"
        style={{ clipPath: `polygon(0 0, calc(50% + ${SEAM_EDGE}vh + 1px) 0, calc(50% - ${SEAM_EDGE}vh + 1px) 100%, 0 100%)` }}
      />
      <div
        data-panel="b"
        className="absolute inset-0 bg-ink-950 will-change-transform"
        style={{ clipPath: `polygon(calc(50% + ${SEAM_EDGE}vh - 1px) 0, 100% 0, 100% 100%, calc(50% - ${SEAM_EDGE}vh - 1px) 100%)` }}
      />

      <svg data-flow-group viewBox="0 0 1440 900" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
        <defs>
          <linearGradient id="intro-flow" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="var(--color-sky)" stopOpacity="0" />
            <stop offset="0.5" stopColor="var(--color-sky)" />
            <stop offset="1" stopColor="var(--color-sky)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {FLOW_LINES.map((line) => (
          <path
            key={line.d}
            data-flow
            d={line.d}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1}
            stroke="url(#intro-flow)"
            strokeOpacity={line.opacity}
            strokeWidth={1.25}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>

      <div className="absolute inset-0 grid place-items-center">
        <div data-intro-logo className="text-paper opacity-0">
          <DrawableLogo
            variant="full"
            className="h-auto w-[min(58vw,22rem)]"
            renderStroke={(stroke) => <path {...stroke} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />}
          >
            <g fill="currentColor">
              {LOGO_PATHS.wordmark.map((d) => (
                <path key={d} d={d} data-glyph opacity={0} />
              ))}
            </g>
          </DrawableLogo>
        </div>
      </div>

      <div
        data-seam
        className="absolute left-1/2 top-1/2 h-[1.5px] w-[180vmax] origin-center bg-[linear-gradient(90deg,transparent,var(--color-sky)_35%,var(--color-sky-200)_50%,var(--color-sky)_65%,transparent)] shadow-[0_0_18px_var(--color-sky)]"
        style={{ transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE}deg) scaleX(0)` }}
      />
    </div>
  );
}
