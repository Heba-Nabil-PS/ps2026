"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { LOGO_DRAW, LOGO_PATHS, LOGO_VIEWBOX } from "@/shared/brand/logo-paths";
import { INTRO_CLASS, carryIntroMark, introCarriesMark, onIntroReplay, signalIntroReveal } from "@/versions/main/intro/intro-signal";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

/*
 * The seam the page splits along is the logo's own stem (LOGO_DRAW.stem), carried
 * across the whole screen: same angle, through the drawn stem.
 */
const [stemX1, stemY1, stemX2, stemY2] = (LOGO_DRAW.stem.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
const STEM = { x: stemX2 - stemX1, y: stemY2 - stemY1 };
const STEM_LENGTH = Math.hypot(STEM.x, STEM.y);
const STEM_MID = { x: (stemX1 + stemX2) / 2, y: (stemY1 + stemY2) / 2 };
/** Angle of the drawn seam line, in degrees. */
const SEAM_ANGLE = (Math.atan2(STEM.y, STEM.x) * 180) / Math.PI;
/** Horizontal shift of the seam per pixel down the screen. */
const SEAM_LEAN = STEM.x / STEM.y;
/** Unit normal pointing into the left-hand panel; each half slides away along it. */
const NORMAL = { x: -STEM.y / STEM_LENGTH, y: STEM.x / STEM_LENGTH };
/** Width of the stem's ribbon in viewBox units: the seam is drawn this thick, so it reads as the stem carried on. */
const STEM_RIBBON = 30;

/** When the pen starts, in seconds. */
const DRAW_AT = 0.25;
/** When the drawn logo moves on: it is drawn (as in the header) by then. */
const OPEN_AT = DRAW_AT + 2.45;
/** Played a third faster than authored: the same choreography, but the page opens in about 3 s instead of 4. */
const SPEED = 1.35;
/** How long, in seconds, a replay holds the drawn logo for the home to render underneath before opening anyway. */
const HOME_WAIT = 8;

/**
 * Loading intro — the brand drawing itself, then opening the page.
 *
 * 1. The PSdigital logo draws itself exactly like the header's DrawLogo (same stroke
 *    order, timings and easing), and the wordmark rises under it.
 * 2. On the home page, the wordmark lets go and the mark rises and shrinks into the
 *    hero, landing on the hero's own mark, which it then becomes, while the curtain
 *    fades away and the hero plays its entrance (see intro-signal).
 *    On every other page, the stem's line cuts across the screen and the curtain
 *    splits open along it onto the page (as page transitions do, see RouteTransition).
 *
 * It plays on the first full load of a session (the head script in the main layout
 * decides before first paint) and again on every client-side visit to the home (see
 * replayIntro), never with reduced motion, and any key, click or tap skips straight
 * to the opening.
 */
export function IntroAnimation() {
  const [run, setRun] = useState<{ id: number; onCovered?: () => void }>({ id: 0 });
  const [done, setDone] = useState(false);

  // A visit to the home from another page plays it again, from the start.
  useEffect(
    () =>
      onIntroReplay((onCovered) => {
        setRun((current) => ({ id: current.id + 1, onCovered }));
        setDone(false);
      }),
    [],
  );

  if (done) return null;
  return <IntroPlay key={run.id} onCovered={run.onCovered} onDone={() => setDone(true)} />;
}

/** One playing of the intro. On a replay, `onCovered` runs once the curtain is up so the route can change under it. */
function IntroPlay({ onCovered, onDone }: { onCovered?: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onCovered, onDone });
  const lenis = useLenis();

  // Hold the page still while the intro plays.
  useEffect(() => {
    if (!document.documentElement.classList.contains(INTRO_CLASS)) return;
    lenis?.stop();
    return () => {
      lenis?.start();
    };
  }, [lenis]);

  useGSAP(
    () => {
      const html = document.documentElement;
      const finish = () => {
        html.classList.remove(INTRO_CLASS);
        carryIntroMark(false);
        signalIntroReveal();
        callbacks.current.onDone();
      };

      if (!html.classList.contains(INTRO_CLASS) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        finish();
        return;
      }

      window.scrollTo(0, 0);
      // On a replay the curtain is up from the first paint: the home can load underneath it now.
      callbacks.current.onCovered?.();
      // Once a session: later full loads open straight onto the page (see the head script in the main layout).
      try {
        sessionStorage.setItem("ps-intro", "1");
      } catch {}

      // On the home page the logo lands on the hero mark; it stays hidden until the logo arrives and takes its place.
      // On a replay the home is still loading underneath, so the mark is looked up again when the logo moves on.
      const introSvg = root.current?.querySelector<SVGSVGElement>("[data-intro-logo] svg");
      const findHero = () => {
        const heroMark = document.querySelector<HTMLElement>("[data-hero-mark]");
        const heroSvg = heroMark?.querySelector<SVGSVGElement>("svg");
        return heroMark && heroSvg && introSvg ? { heroMark, heroSvg } : undefined;
      };
      const heroNow = findHero();
      if (heroNow) {
        carryIntroMark();
        gsap.set(heroNow.heroMark, { autoAlpha: 0 });
      }

      gsap.set("[data-seam]", { xPercent: -50, yPercent: -50, rotation: SEAM_ANGLE, scaleX: 0 });
      const tl = gsap.timeline();
      tl.timeScale(SPEED);
      // 1 — drawn like the header's DrawLogo.
      tl.to("[data-draw='main']", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, DRAW_AT)
        .to("[data-draw='stem']", { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, DRAW_AT + 0.5)
        .to("[data-draw='inner']", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, DRAW_AT + 0.85)
        // The wordmark is drawn by the same pen: each glyph's outline traces itself, then fills in.
        .to("[data-glyph-line]", { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.06 }, DRAW_AT + 1.1)
        .to("[data-glyph]", { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.06 }, DRAW_AT + 1.6)
        .to("[data-glyph-line]", { opacity: 0, duration: 0.4, ease: "power1.out", stagger: 0.06 }, DRAW_AT + 1.8)
        .call(open, [], OPEN_AT);

      let waited = 0;
      let opening: gsap.core.Animation | undefined;

      /** 2 — the drawn logo moves on: into the hero on the home, or the curtain splits open anywhere else. */
      function open() {
        const hero = findHero();
        // A replay whose home has not rendered yet holds the drawn logo until it has.
        if (!hero && introCarriesMark() && waited < HOME_WAIT) {
          waited += 0.1;
          opening = gsap.delayedCall(0.1, open);
          return;
        }
        const ot = gsap.timeline({ onComplete: finish }).timeScale(SPEED).addLabel("open", 0);
        opening = ot;
        if (hero) flyIntoHero(ot, hero.heroMark, hero.heroSvg);
        else splitOpen(ot);
      }

      /** 2a — the mark rises and shrinks into the hero, where it stays as the hero's own mark. */
      function flyIntoHero(ot: gsap.core.Timeline, heroMark: HTMLElement, heroSvg: SVGSVGElement) {
        carryIntroMark();
        gsap.set(heroMark, { autoAlpha: 0 });
        // Both artworks start at the same corner and share a width (the intro's adds the wordmark
        // below), so lining up their top-left corners and widths lines up the marks.
        let flight: { x: number; y: number; scale: number } | undefined;
        const flightTo = () => {
          if (!flight) {
            const from = introSvg!.getBoundingClientRect();
            const to = heroSvg.getBoundingClientRect();
            flight = { x: to.left - from.left, y: to.top - from.top, scale: to.width / from.width };
          }
          return flight;
        };
        ot.to("[data-glyph], [data-glyph-line]", { opacity: 0, y: 14, duration: 0.4, ease: "power2.in", stagger: 0.02 }, "open")
          .to(
            introSvg!,
            {
              x: () => flightTo().x,
              y: () => flightTo().y,
              scale: () => flightTo().scale,
              transformOrigin: "0 0",
              duration: 1.3,
              ease: "expo.inOut",
            },
            "open+=0.15",
          )
          // The home comes through behind it and the hero starts its entrance as the mark settles.
          .to("[data-panel]", { opacity: 0, duration: 1, ease: "power2.inOut" }, "open+=0.55")
          .call(signalIntroReveal, [], "open+=0.6")
          .set(heroMark, { autoAlpha: 1 })
          .set("[data-intro-logo]", { autoAlpha: 0 });
      }

      /** 2b — the stem's line crosses the screen and the page opens along it. */
      function splitOpen(ot: gsap.core.Timeline) {
        carryIntroMark(false);
        ot.call(splitAlongStem, [], "open")
          .to("[data-seam]", { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, "open")
          .to("[data-intro-logo]", { scale: 0.92, opacity: 0, filter: "blur(10px)", duration: 0.55, ease: "power3.in" }, "open+=0.2")
          .call(signalIntroReveal, [], "open+=0.45")
          .addLabel("split", "open+=0.45")
          .to("[data-panel='a']", { x: () => NORMAL.x * travel(), y: () => NORMAL.y * travel(), duration: 1.15, ease: "expo.inOut" }, "split")
          .to("[data-panel='b']", { x: () => -NORMAL.x * travel(), y: () => -NORMAL.y * travel(), duration: 1.15, ease: "expo.inOut" }, "split")
          .to("[data-seam]", { opacity: 0, duration: 0.4, ease: "power2.out" }, "split+=0.2");
      }

      // Any key, click or tap skips to the opening.
      const skip = () => {
        if (tl.time() < OPEN_AT) tl.seek(OPEN_AT - 0.01);
      };
      window.addEventListener("keydown", skip);
      window.addEventListener("pointerdown", skip);
      return () => {
        window.removeEventListener("keydown", skip);
        window.removeEventListener("pointerdown", skip);
        opening?.kill();
      };

      /** Far enough that each half clears every corner of the viewport. */
      function travel() {
        return Math.hypot(window.innerWidth, window.innerHeight);
      }

      /** Cuts the curtain in two along the line through the drawn stem (1px overlap hides the cut). */
      function splitAlongStem() {
        if (!introSvg) return;
        const rect = introSvg.getBoundingClientRect();
        const box = LOGO_VIEWBOX.full;
        const scale = rect.width / box.width;
        const px = rect.left + (STEM_MID.x - box.x) * scale;
        const py = rect.top + (STEM_MID.y - box.y) * scale;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const top = px - py * SEAM_LEAN;
        const bottom = px + (h - py) * SEAM_LEAN;
        gsap.set("[data-panel='a']", { clipPath: `polygon(0px 0px, ${top + 1}px 0px, ${bottom + 1}px ${h}px, 0px ${h}px)` });
        gsap.set("[data-panel='b']", { clipPath: `polygon(${top - 1}px 0px, ${w}px 0px, ${w}px ${h}px, ${bottom - 1}px ${h}px)` });
        gsap.set("[data-seam]", { left: px, top: py, height: STEM_RIBBON * scale });
      }
    },
    { scope: root },
  );

  return (
    <div ref={root} aria-hidden className="intro fixed inset-0 z-90 overflow-hidden">
      {/* The curtain, in two halves that are cut along the stem only when a page splits it open. */}
      <div data-panel="a" className="absolute inset-0 bg-navy-700 will-change-transform" />
      <div data-panel="b" className="absolute inset-0 bg-navy-700 will-change-transform" />

      <div className="absolute inset-0 grid place-items-center">
        <div data-intro-logo className="text-paper">
          <DrawableLogo
            variant="full"
            className="h-auto w-[min(32.5vw,12.3rem)]"
            renderStroke={(stroke) => <path {...stroke} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />}
          >
            <g fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinejoin="round">
              {LOGO_PATHS.wordmark.map((d) => (
                <path key={d} d={d} data-glyph-line pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />
              ))}
            </g>
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
        className="absolute left-1/2 top-1/2 h-[7px] w-[300vmax] bg-[linear-gradient(90deg,transparent,var(--color-paper)_30%,var(--color-paper)_70%,transparent)]"
        style={{ transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE}deg) scaleX(0)` }}
      />
    </div>
  );
}
