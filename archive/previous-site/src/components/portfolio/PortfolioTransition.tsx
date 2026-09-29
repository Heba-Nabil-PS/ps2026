"use client";

import { soundManager } from "@/audio/SoundManager";
import { portfolioHref, type PortfolioProject } from "@/data/portfolio";
import { useLocalizeHref } from "@/i18n/LocaleProvider";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { gsap } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { getImageProps } from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

/** Transition types understood by the <ViewTransition> boundaries and globals.css. */
export const PF_OPEN = "pf-open";
export const PF_BACK = "pf-back";

type PortfolioTransitionValue = {
  /** Morph `media` (the clicked card visual) into the project's case-study hero. */
  open: (project: PortfolioProject, media: HTMLElement | null) => void;
  /** Warm the hero image cache before a likely click. */
  warm: (project: PortfolioProject) => void;
};

const PortfolioTransitionContext = createContext<PortfolioTransitionValue>({ open: () => {}, warm: () => {} });

/** Must mirror the hero <Image> props so the browser reuses the exact same file. */
export const HERO_IMAGE = { width: 2400, height: 1500, sizes: "100vw" } as const;

const warmed = new Set<string>();
let arrivingSlug: string | null = null;

/** True once for the hero that is the destination of a card transition (skips its own entrance). */
export function consumeArrival(slug: string) {
  const match = arrivingSlug === slug;
  if (match) arrivingSlug = null;
  return match;
}

function warmImage(src: string) {
  if (warmed.has(src) || typeof window === "undefined") return;
  warmed.add(src);
  const { props } = getImageProps({ src, alt: "", ...HERO_IMAGE });
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

async function heroReady(timeout = 900) {
  const img = document.querySelector<HTMLImageElement>("[data-pf-hero-media] img");
  if (!img) return;
  await Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, timeout))]);
}

/**
 * Cinematic card → case-study transitions.
 *
 * 1. Browsers with the View Transitions API: navigate with the `pf-open` type — React <ViewTransition>
 *    pairs the card media/title with the hero (shared names) and the list exits via CSS.
 * 2. Other browsers: a GSAP "flight" — a fixed clone of the card grows to the viewport,
 *    the route changes underneath, then the clone dissolves into the real hero.
 * 3. Reduced motion: a direct navigation.
 */
export function PortfolioTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const lenis = useLenis();
  const reduced = usePrefersReducedMotion();
  const flight = useRef<{ el: HTMLElement; href: string } | null>(null);
  const busy = useRef(false);
  const localize = useLocalizeHref();

  const warm = useCallback((project: PortfolioProject) => {
    warmImage(project.heroImage);
    router.prefetch(localize(portfolioHref(project.slug)));
  }, [router, localize]);

  const open = useCallback(
    (project: PortfolioProject, media: HTMLElement | null) => {
      const href = localize(portfolioHref(project.slug));
      if (busy.current || href === pathname) return;
      warmImage(project.heroImage);
      soundManager.playTransition();

      if (reduced || !media) {
        router.push(href);
        return;
      }

      arrivingSlug = project.slug;

      // TS's DOM lib assumes the API always exists, so check at runtime without narrowing `document`.
      const supportsViewTransitions = typeof (document as { startViewTransition?: unknown }).startViewTransition === "function";
      if (supportsViewTransitions) {
        router.push(href, { transitionTypes: [PF_OPEN] });
        return;
      }

      // --- GSAP fallback flight ---
      busy.current = true;
      lenis?.stop();
      const rect = media.getBoundingClientRect();
      const source = media.querySelector("img");
      const clone = document.createElement("div");
      Object.assign(clone.style, {
        position: "fixed",
        zIndex: "85",
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        backgroundColor: project.color,
        backgroundImage: source?.currentSrc ? `url("${source.currentSrc}")` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        pointerEvents: "none",
      } satisfies Partial<CSSStyleDeclaration>);
      document.body.appendChild(clone);

      gsap.to("[data-pf-exit]", { opacity: 0, y: -40, duration: 0.5, ease: "power2.in", stagger: 0.02 });
      gsap.to(clone, {
        left: 0,
        top: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        duration: 0.95,
        ease: "expo.inOut",
        onComplete: () => {
          flight.current = { el: clone, href };
          window.scrollTo(0, 0);
          router.push(href, { scroll: true });
        },
      });
    },
    [lenis, pathname, reduced, router, localize],
  );

  // Land the flight once the destination has rendered.
  useEffect(() => {
    const current = flight.current;
    if (!current || pathname !== current.href) return;
    flight.current = null;
    let cancelled = false;
    heroReady().then(() => {
      if (cancelled) return;
      gsap.to(current.el, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => {
          current.el.remove();
          busy.current = false;
          lenis?.start();
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, lenis]);

  const value = useMemo(() => ({ open, warm }), [open, warm]);
  return <PortfolioTransitionContext.Provider value={value}>{children}</PortfolioTransitionContext.Provider>;
}

export function usePortfolioTransition() {
  return useContext(PortfolioTransitionContext);
}
