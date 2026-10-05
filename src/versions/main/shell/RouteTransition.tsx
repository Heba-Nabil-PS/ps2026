"use client";

import { gsap, useGSAP } from "@/lib/gsap";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { stripLocale } from "@/i18n/config";
import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { LOGO_DRAW, LOGO_PATHS, LOGO_VIEWBOX } from "@/shared/brand/logo-paths";
import { replayIntro } from "@/versions/main/intro/intro-signal";
import { useLenis } from "lenis/react";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useRef, useState, useTransition, type ReactNode } from "react";

type Navigate = (href: string, label?: string) => void;

const TransitionContext = createContext<Navigate>(() => {});

export const useRouteTransition = () => useContext(TransitionContext);

type State = { phase: "idle" } | { phase: "covering" | "covered"; href: string; from: string };

/**
 * Page transitions: a dark curtain fades in and the logo draws itself (the home
 * intro without its flow lines), the route changes while it is covered, then the
 * stem's line cuts the curtain open onto the new page. Reduced motion navigates directly.
 */
export function RouteTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = usePrefersReducedMotion();
  const lenis = useLenis();
  const [state, setState] = useState<State>({ phase: "idle" });
  const fallback = useRef<number | undefined>(undefined);
  // True from the router.push until the new route has committed, however long the server takes.
  const [navigating, startNavigation] = useTransition();

  const navigate = useCallback<Navigate>(
    (href) => {
      const target = new URL(href, window.location.href);
      const samePage = target.pathname === window.location.pathname;
      if (samePage && target.hash) {
        const el = document.getElementById(decodeURIComponent(target.hash.slice(1)));
        window.history.pushState(null, "", target.hash);
        if (el && lenis) lenis.scrollTo(el, { offset: -96 });
        else el?.scrollIntoView({ behavior: "smooth" });
        return;
      }
      if (samePage) {
        lenis?.scrollTo(0);
        return;
      }
      if (reduced) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      // The home always opens the way it does on first load: the full intro plays again and lands on the hero.
      if (stripLocale(target.pathname).pathname === "/") {
        const played = replayIntro(() => {
          lenis?.scrollTo(0, { immediate: true, force: true });
          window.scrollTo(0, 0);
          startNavigation(() => router.push(href, { scroll: false }));
        });
        if (played) return;
      }
      setState({ phase: "covering", href, from: window.location.pathname });
    },
    [router, lenis, reduced],
  );

  const onCovered = useCallback(() => {
    if (state.phase !== "covering") return;
    lenis?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    setState({ ...state, phase: "covered" });
    startNavigation(() => router.push(state.href, { scroll: false }));
    // A slow route keeps the cover up until it lands. Opening it early would reveal the page
    // we just left (often the home), so a stuck navigation finishes as a full page load instead.
    window.clearTimeout(fallback.current);
    fallback.current = window.setTimeout(() => window.location.assign(state.href), 15000);
  }, [state, lenis, router]);

  useEffect(() => () => window.clearTimeout(fallback.current), []);

  // The new route has rendered once the pathname differs from where we started.
  const arrived = state.phase === "covered" && pathname !== state.from;

  // The client navigation settled without changing the page (e.g. an error): load the target directly.
  const stalled = state.phase === "covered" && !navigating && !arrived;
  useEffect(() => {
    if (!stalled || state.phase !== "covered") return;
    window.clearTimeout(fallback.current);
    window.location.assign(state.href);
  }, [stalled, state]);
  const targetHash = state.phase === "covered" ? new URL(state.href, "http://x").hash : "";

  // Deep links such as /services#branding land on their anchor behind the cover.
  useEffect(() => {
    if (!arrived || !targetHash) return;
    const el = document.getElementById(decodeURIComponent(targetHash.slice(1)));
    if (el) lenis?.scrollTo(el, { immediate: true, force: true, offset: -96 });
  }, [arrived, targetHash, lenis]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      {state.phase !== "idle" ? (
        <LogoCurtain
          arrived={arrived}
          onCovered={onCovered}
          onDone={() => {
            window.clearTimeout(fallback.current);
            setState({ phase: "idle" });
          }}
        />
      ) : null}
    </TransitionContext.Provider>
  );
}

/*
 * The seam runs along the logo's own stem (LOGO_DRAW.stem), extended across the
 * screen, so the line that opens the page passes exactly over the drawn stem.
 */
const [stemX1, stemY1, stemX2, stemY2] = (LOGO_DRAW.stem.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
const STEM = { x: stemX2 - stemX1, y: stemY2 - stemY1 };
const STEM_LENGTH = Math.hypot(STEM.x, STEM.y);
const STEM_MID = { x: (stemX1 + stemX2) / 2, y: (stemY1 + stemY2) / 2 };
/** Angle of the seam, in degrees. */
const SEAM_ANGLE = (Math.atan2(STEM.y, STEM.x) * 180) / Math.PI;
/** Horizontal shift of the seam per pixel down the screen. */
const SEAM_LEAN = STEM.x / STEM.y;
/** Unit normal pointing into the left-hand panel; each half slides away along it. */
const NORMAL = { x: -STEM.y / STEM_LENGTH, y: STEM.x / STEM_LENGTH };

/**
 * The home intro's draw-and-split without its flow lines: the dark curtain fades
 * in, the mark draws itself stroke by stroke like the header logo, and once both the
 * drawing and the next route are ready, the stem's line cuts across the screen
 * and the curtain opens along it.
 */
function LogoCurtain({ arrived, onCovered, onDone }: { arrived: boolean; onCovered: () => void; onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const callbacks = useRef({ onCovered, onDone });
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    callbacks.current = { onCovered, onDone };
  });

  useGSAP(
    () => {
      // Drawn like the header's DrawLogo (same stroke order, timings and easing), once the curtain is up.
      const at = 0.35;
      gsap
        .timeline({ onComplete: () => setDrawn(true) })
        // Played faster than authored: a visitor moving between pages should not wait on the drawing.
        .timeScale(1.8)
        .fromTo(root.current, { opacity: 0 }, { opacity: 1, duration: at, ease: "power2.out" }, 0)
        .call(() => callbacks.current.onCovered(), [], at)
        .to("[data-draw='main']", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" }, at)
        .to("[data-draw='stem']", { strokeDashoffset: 0, duration: 0.55, ease: "power2.inOut" }, at + 0.5)
        .to("[data-draw='inner']", { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut" }, at + 0.85)
        .to("[data-glyph]", { opacity: 1, duration: 0.7, ease: "power1.out", stagger: 0.05 }, at + 1.5)
        .fromTo("[data-glyph]", { y: 24 }, { y: 0, duration: 0.9, ease: "power2.inOut", stagger: 0.05 }, at + 1.5);
    },
    { scope: root },
  );

  // Opens the curtain once the logo is drawn and the next page has rendered.
  useGSAP(
    () => {
      const el = root.current;
      const svg = el?.querySelector("[data-curtain-logo] svg");
      if (!el || !svg || !drawn || !arrived) return;

      // Where the stem's midpoint sits on screen; the seam passes through it.
      const rect = svg.getBoundingClientRect();
      const box = LOGO_VIEWBOX.full;
      const scale = rect.width / box.width;
      const px = rect.left + (STEM_MID.x - box.x) * scale;
      const py = rect.top + (STEM_MID.y - box.y) * scale;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const top = px - py * SEAM_LEAN;
      const bottom = px + (h - py) * SEAM_LEAN;
      // Far enough that each half clears every corner of the viewport.
      const travel = Math.hypot(w, h);

      // Cut the two halves along the seam (1px overlap hides the cut).
      gsap.set(el, { pointerEvents: "none" });
      gsap.set("[data-panel='a']", { clipPath: `polygon(0px 0px, ${top + 1}px 0px, ${bottom + 1}px ${h}px, 0px ${h}px)` });
      gsap.set("[data-panel='b']", { clipPath: `polygon(${top - 1}px 0px, ${w}px 0px, ${w}px ${h}px, ${bottom - 1}px ${h}px)` });
      gsap.set("[data-seam]", { left: px, top: py, x: 0, y: 0, xPercent: -50, yPercent: -50, rotation: SEAM_ANGLE, scaleX: 0 });

      gsap
        .timeline({ onComplete: () => callbacks.current.onDone() })
        .timeScale(1.3)
        .to("[data-seam]", { scaleX: 1, duration: 0.5, ease: "power3.inOut" }, 0)
        .to("[data-curtain-logo]", { scale: 0.92, opacity: 0, filter: "blur(10px)", duration: 0.55, ease: "power3.in" }, 0.2)
        .to("[data-panel='a']", { x: NORMAL.x * travel, y: NORMAL.y * travel, duration: 1.15, ease: "expo.inOut" }, 0.45)
        .to("[data-panel='b']", { x: -NORMAL.x * travel, y: -NORMAL.y * travel, duration: 1.15, ease: "expo.inOut" }, 0.45)
        .to("[data-seam]", { opacity: 0, duration: 0.4, ease: "power2.out" }, 0.65);
    },
    { scope: root, dependencies: [drawn, arrived] },
  );

  return (
    <div ref={root} aria-hidden className="pointer-events-auto fixed inset-0 z-80 overflow-hidden opacity-0">
      <div data-panel="a" className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-navy-700),var(--color-ink-900))] will-change-transform" />
      <div data-panel="b" className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-navy-700),var(--color-ink-900))] will-change-transform" />

      <div className="absolute inset-0 grid place-items-center">
        <div data-curtain-logo className="text-paper">
          <DrawableLogo
            variant="full"
            className="h-auto w-[min(32.5vw,12.3rem)]"
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
        className="absolute left-1/2 top-1/2 h-[1.5px] w-[300vmax] bg-[linear-gradient(90deg,transparent,var(--color-sky)_35%,var(--color-sky-200)_50%,var(--color-sky)_65%,transparent)] shadow-[0_0_18px_var(--color-sky)]"
        style={{ transform: `translate(-50%, -50%) rotate(${SEAM_ANGLE}deg) scaleX(0)` }}
      />
    </div>
  );
}
