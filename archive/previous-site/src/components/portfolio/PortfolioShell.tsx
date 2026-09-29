"use client";

import { soundManager } from "@/audio/SoundManager";
import { PortfolioTransitionProvider } from "@/components/portfolio/PortfolioTransition";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Portfolio-wide runtime: keeps GSAP ScrollTrigger in sync with Lenis,
 * recalculates triggers after navigation, and requests the ambient sound bed
 * (which only plays if the visitor has switched sound on).
 */
export function PortfolioShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useLenis(() => ScrollTrigger.update());

  useEffect(() => {
    soundManager.startAmbient();
    return () => soundManager.stopAmbient();
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    const onLoad = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onLoad);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return <PortfolioTransitionProvider>{children}</PortfolioTransitionProvider>;
}
