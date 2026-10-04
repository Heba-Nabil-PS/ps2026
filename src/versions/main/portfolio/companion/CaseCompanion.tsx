"use client";

import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import dynamic from "next/dynamic";
import { useEffect, useState, type ComponentProps } from "react";
import { companionOf, companions } from "./registry";

// three.js is only downloaded on a case study that has a companion, once its artwork is near.
const CompanionScene = dynamic(() => import("./CompanionScene"), { ssr: false });

function supportsWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/**
 * The project's 3D companion (see registry). A swimmer starts on the artwork marked
 * `data-companion-emerge`; everything else rises from below as the story starts. Nothing is shown under
 * reduced motion, without WebGL or below 64rem (where the copy spans the screen, so the companion could only
 * float over it, and phones are spared the three.js download) — the page reads exactly as before.
 */
export function CaseCompanion({ slug }: { slug: string }) {
  const reduced = usePrefersReducedMotion();
  const wide = useMediaQuery("(min-width: 64rem)");
  const [scene, setScene] = useState<ComponentProps<typeof CompanionScene> | null>(null);
  const key = companionOf[slug];

  useEffect(() => {
    if (!key || reduced || !wide) return;
    const spec = companions[key];
    const emerge = spec.motion === "swim" ? document.querySelector<HTMLElement>("[data-companion-emerge]") : null;
    const until = document.querySelector<HTMLElement>("[data-case-content]");
    // A tumbler rises from below as the story starts, so its scroll path begins at the story.
    const anchor = emerge ?? until;
    if (!anchor || !until) return;

    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !supportsWebGL()) return;
        observer.disconnect();
        spec.load().then(({ default: build }) => {
          if (cancelled) return;
          setScene({
            build,
            motion: emerge ? spec.motion : "tumble",
            mood: spec.mood,
            anchor,
            veil: emerge?.querySelector<HTMLElement>("[data-companion-veil]") ?? null,
            until,
          });
        });
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(anchor);
    return () => {
      cancelled = true;
      observer.disconnect();
      setScene(null);
    };
  }, [key, reduced, wide]);

  return scene ? <CompanionScene {...scene} /> : null;
}
