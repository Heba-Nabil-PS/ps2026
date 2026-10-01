"use client";

import { PortfolioTransitionProvider } from "@/versions/main/portfolio/PortfolioTransition";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Portfolio-wide runtime: keeps GSAP ScrollTrigger in sync with Lenis and
 * recalculates triggers after navigation.
 */
export function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onLoad);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <PortfolioTransitionProvider>{children}</PortfolioTransitionProvider>;
}
