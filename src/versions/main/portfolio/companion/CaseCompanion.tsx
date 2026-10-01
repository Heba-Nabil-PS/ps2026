"use client";

import { usePrefersReducedMotion } from "@/lib/hooks";
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
 * `data-companion-emerge`; everything else drops out of the hero. Nothing is shown under
 * reduced motion or without WebGL — the page reads exactly as before.
 */
export function CaseCompanion({ slug }: { slug: string }) {
  const reduced = usePrefersReducedMotion();
  const [scene, setScene] = useState<ComponentProps<typeof CompanionScene> | null>(null);
  const key = companionOf[slug];

  useEffect(() => {
    if (!key || reduced) return;
    const spec = companions[key];
    const emerge = spec.motion === "swim" ? document.querySelector<HTMLElement>("[data-companion-emerge]") : null;
    const anchor = emerge ?? document.querySelector<HTMLElement>("[data-pf-hero-media]");
    const until = document.querySelector<HTMLElement>("[data-case-content]");
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
  }, [key, reduced]);

  return scene ? <CompanionScene {...scene} /> : null;
}
