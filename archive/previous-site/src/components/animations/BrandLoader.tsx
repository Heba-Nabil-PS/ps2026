"use client";

import { DrawableLogo } from "@/components/brand/DrawableLogo";
import { LOGO_PATHS, LOGO_PORTAL, LOGO_VIEWBOX } from "@/components/brand/logo-paths";
import { useContent } from "@/i18n/LocaleProvider";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { useEffect, useId, useRef } from "react";

const SEEN_KEY = "ps-intro";
/** Stop waiting for the page to load this long (ms) after navigation started, however slow the network. */
const MAX_WAIT = 4500;
/** Later loads in the same session play the rest of the intro faster. */
const REPEAT_SPEED = 1.8;
/** Stagger for the wordmark glyphs and tagline words (the intro keyframes live in globals.css). */
const GLYPH_DELAY = (i: number) => `${1.2 + i * 0.045}s`;
const WORD_DELAY = (i: number) => `${1.35 + i * 0.05}s`;

/** The portal point (see LOGO_PORTAL) as fractions of the full lockup; also the zoom pivot. */
const box = LOGO_VIEWBOX.full;
const PORTAL_X = (LOGO_PORTAL.x - box.x) / box.width;
const PORTAL_Y = (LOGO_PORTAL.y - box.y) / box.height;

let firstVisit: boolean | undefined;
/** Read once per page load, so re-running effects (Strict Mode) do not count as a second visit. */
function isFirstVisit() {
  if (firstVisit === undefined) {
    firstVisit = true;
    try {
      firstVisit = !sessionStorage.getItem(SEEN_KEY);
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {}
  }
  return firstVisit;
}

/** Resolves after a few smooth frames in a row (or 800ms), so the exit never starts on a busy main thread. */
function whenSettled() {
  return new Promise<void>((resolve) => {
    let last = performance.now();
    let calm = 0;
    const deadline = last + 800;
    const tick = (now: number) => {
      calm = now - last < 24 ? calm + 1 : 0;
      last = now;
      if (calm >= 3 || now > deadline) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/** Fonts in and the window load event fired (images, media posters). */
function pageLoaded() {
  const load =
    document.readyState === "complete"
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener("load", () => resolve(), { once: true }));
  return Promise.all([load, document.fonts?.ready]);
}

/**
 * Initial-load intro. The PSdigital mark draws itself as one continuous line,
 * the wordmark and tagline rise through masks, and once the page has loaded
 * the bowl of the logo opens into a window onto the site and the camera flies
 * through it: the logo itself opens the experience.
 *
 * - Build-up: CSS keyframes (globals.css, "Brand loader"), so it starts at
 *   first paint and keeps going while React hydrates.
 * - Hand-off, gate and exit: a GSAP timeline, played once the intro has
 *   finished and the page has loaded (or MAX_WAIT has passed).
 *
 * `onReveal` fires as the site becomes visible; entrance animations key off
 * it via usePageReady. Plays at full length once per session, faster after
 * that; reduced motion gets the finished logo and a short fade. A CSS
 * failsafe hides it if scripts never run.
 */
export function BrandLoader({ onReveal }: { onReveal: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const clipId = `${useId().replace(/[^\w-]/g, "")}-wordmark`;
  const { t } = useContent();
  const words = t.studio.preloaderTagline.split(" ");

  // Scroll stays locked until the site is revealed.
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const revealed = useRef(false);
  useEffect(() => {
    lenisRef.current = lenis;
    if (!revealed.current) lenis?.stop();
  }, [lenis]);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      const q = gsap.utils.selector(el);
      const block = (event: Event) => event.preventDefault();
      // Per-frame painter for the exit's window (set up with the full-motion exit).
      let paintPortal = () => {};

      // The site is told first, while the loader is still opaque: its hero entrances
      // (and WebGL warm-up, which can block a frame) start behind the logo.
      let notified = false;
      const notifySite = () => {
        if (notified) return;
        notified = true;
        onReveal();
      };
      // Scroll and clicks come back mid-flight, once the site is showing.
      const unlock = () => {
        if (revealed.current) return;
        revealed.current = true;
        el.style.pointerEvents = "none";
        el.removeEventListener("wheel", block);
        el.removeEventListener("touchmove", block);
        lenisRef.current?.start();
      };
      const finish = () => {
        notifySite();
        unlock();
        gsap.ticker.remove(paintPortal);
        el.style.display = "none";
      };

      // Scripts arrived after the CSS failsafe had already hidden the loader.
      if (getComputedStyle(el).visibility === "hidden") {
        finish();
        return;
      }
      el.dataset.live = "";
      el.addEventListener("wheel", block, { passive: false });
      el.addEventListener("touchmove", block, { passive: false });

      const zoom = q("[data-loader-zoom]");
      const float = q("[data-loader-float]");
      const glyphs = q("[data-loader-glyph]");
      const tagline = q("[data-loader-word]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // The CSS intro may be mid-way (or done) by now. Repeat visits play the rest faster.
      const intro = el.getAnimations({ subtree: true }).filter((a) => a.effect?.getTiming().iterations !== Infinity);
      if (!isFirstVisit()) intro.forEach((a) => (a.playbackRate = REPEAT_SPEED));

      // GSAP takes over from CSS: cancel the finished keyframes (their end state is
      // the untransformed one) and freeze the breathing where it is.
      const takeOver = () => {
        const breathing = getComputedStyle(float[0]).transform;
        [...zoom, ...float, ...glyphs, ...tagline].forEach((node) => node.getAnimations().forEach((a) => a.cancel()));
        gsap.set(float, { transform: breathing });
      };

      const exit = gsap.timeline({ paused: true, onComplete: finish });

      if (reduced) {
        exit.add(unlock).to(el, { autoAlpha: 0, duration: 0.4, ease: "none" });
      } else {
        // The empty centre of the bowl becomes a window onto the site: a hole in
        // the backdrop pinned to the portal point, sized from the live zoom scale.
        const bg = q("[data-loader-bg]")[0] as HTMLElement;
        const portal = { x: 0, y: 0, radius: 0, reach: 0, open: 0 };
        const openPortal = () => {
          // The stage is never transformed, and the portal is the zoom's transform
          // origin, so its screen position stays fixed for the whole flight.
          const stage = q("[data-loader-stage]")[0].getBoundingClientRect();
          portal.x = stage.left + stage.width * PORTAL_X;
          portal.y = stage.top + stage.height * PORTAL_Y;
          portal.radius = (LOGO_PORTAL.radius / box.width) * stage.width;
          portal.reach = Math.hypot(
            Math.max(portal.x, window.innerWidth - portal.x),
            Math.max(portal.y, window.innerHeight - portal.y),
          );
          const hole = `radial-gradient(circle at ${portal.x}px ${portal.y}px, transparent var(--portal-r), #000 calc(var(--portal-r) + 1.5px))`;
          bg.style.setProperty("--portal-r", "0px");
          bg.style.setProperty("-webkit-mask-image", hole);
          bg.style.setProperty("mask-image", hole);
          gsap.ticker.add(paintPortal);
        };
        paintPortal = () => {
          const scale = gsap.getProperty(zoom[0], "scale") as number;
          bg.style.setProperty("--portal-r", `${portal.open * portal.radius * 0.96 * scale}px`);
        };

        exit
          .add(() => {
            takeOver();
            openPortal();
          }, 0)
          .to(float, { y: 0, rotation: 0, duration: 0.5, ease: "power2.inOut" }, 0)
          .to(tagline, { yPercent: -110, duration: 0.45, ease: "circ.in", stagger: 0.02 }, 0)
          .to(glyphs, { y: -150, duration: 0.5, ease: "circ.in", stagger: 0.02 }, 0)
          // Anticipation: a small breath in while the window opens inside the bowl.
          .to(zoom, { scale: 0.94, rotation: -4, duration: 0.5, ease: "power2.inOut" }, 0.05)
          .to(portal, { open: 1, duration: 0.6, ease: "power3.inOut" }, 0.15)
          // Fully drawn: drop the masks so the zoom scales two plain paths.
          .add(() => gsap.set(q("[data-logo-part]"), { attr: { mask: "none" } }), 0.4)
          // Launch: fly through the bowl until the window clears every corner of the viewport.
          .to(zoom, { scale: () => (portal.reach / portal.radius) * 1.1, rotation: 16, duration: 1.5, ease: "expo.inOut" }, 0.45)
          .add(unlock, 0.7)
          .to(zoom, { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, 1.6);
      }

      // Leave only when the intro has played and the page is ready (or MAX_WAIT passed).
      let introDone = false;
      let ready = false;
      let disposed = false;
      const tryExit = () => {
        if (disposed || notified || !introDone || !ready) return;
        notifySite();
        whenSettled().then(() => {
          if (!disposed) exit.play();
        });
      };
      Promise.all(intro.map((a) => a.finished)).then(
        () => {
          introDone = true;
          tryExit();
        },
        () => {}, // Cancelled: the loader unmounted.
      );
      const release = () => {
        ready = true;
        tryExit();
      };
      pageLoaded().then(release);
      const cap = window.setTimeout(release, MAX_WAIT - performance.now());

      return () => {
        disposed = true;
        window.clearTimeout(cap);
        gsap.ticker.remove(paintPortal);
        el.removeEventListener("wheel", block);
        el.removeEventListener("touchmove", block);
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden
      className="preloader fixed inset-0 z-[95] flex items-center justify-center overflow-hidden text-fg"
    >
      <div data-loader-bg className="absolute inset-0 bg-surface" />

      <div className="relative flex flex-col items-center">
        <div data-loader-stage className="w-[min(62vw,380px)]">
          <div
            data-loader-zoom
            className="will-change-transform"
            style={{ transformOrigin: `${PORTAL_X * 100}% ${PORTAL_Y * 100}%` }}
          >
            <div data-loader-float>
              <DrawableLogo
                variant="full"
                className="block h-auto w-full"
                renderStroke={(stroke) => <path {...stroke} pathLength={1} strokeDasharray="1 2" strokeDashoffset={1} />}
              >
                <clipPath id={clipId}>
                  <rect x={470} y={775} width={580} height={140} />
                </clipPath>
                <g clipPath={`url(#${clipId})`} fill="currentColor">
                  {LOGO_PATHS.wordmark.map((d, i) => (
                    <path key={d} d={d} data-loader-glyph style={{ animationDelay: GLYPH_DELAY(i) }} />
                  ))}
                </g>
              </DrawableLogo>
            </div>
          </div>
        </div>

        <p className="text-label mt-10 text-center text-muted md:mt-12">
          {words.map((word, i) => (
            <span key={i}>
              <span className="inline-block overflow-hidden pb-[0.2em] align-top">
                <span data-loader-word className="inline-block" style={{ animationDelay: WORD_DELAY(i) }}>
                  {word}
                </span>
              </span>{" "}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
