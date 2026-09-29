"use client";

import { RevealText } from "@/components/animations/RevealText";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { MediaRef } from "@/data/portfolio";
import { useContent } from "@/i18n/LocaleProvider";
import { useRichInteractions } from "@/lib/hooks";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// three.js is only downloaded when this block is about to be seen on a capable device.
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

type Project3DProps = { eyebrow?: string; title: string; body: string; poster: MediaRef; tone: string };

function supportsWebGL() {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch {
    return false;
  }
}

/** Real-time 3D on desktop; a still poster on touch devices, reduced motion or without WebGL. */
export function Project3D({ eyebrow, title, body, poster, tone }: Project3DProps) {
  const frame = useRef<HTMLDivElement>(null);
  const rich = useRichInteractions();
  const { t } = useContent();
  const [near, setNear] = useState(false);
  const [accent, setAccent] = useState("#ff5b2e");

  useEffect(() => {
    const el = frame.current;
    if (!el || !rich) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !supportsWebGL()) return;
        setAccent(getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim() || "#ff5b2e");
        setNear(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rich]);

  const live = rich && near;

  return (
    <section className="gutter grid grid-cols-1 items-center gap-12 py-24 md:grid-cols-12 md:py-40">
      <div className="md:col-span-4">
        {eyebrow ? <SectionLabel className="mb-6">{eyebrow}</SectionLabel> : null}
        <RevealText as="h2" mode="words" className="text-headline font-medium">
          {title}
        </RevealText>
        <p className="mt-6 text-muted">{body}</p>
        <p className="text-label mt-8 text-muted">{live ? t.blocks.interact : t.blocks.interactiveDesktop}</p>
      </div>
      <ScrollReveal variant="scale" className="md:col-span-8">
        <div
          ref={frame}
          className="relative aspect-square overflow-hidden sm:aspect-[4/3]"
          style={{ background: `radial-gradient(circle at 50% 45%, color-mix(in oklab, ${tone} 60%, #222), ${tone} 70%)` }}
        >
          {!live ? <Image src={poster.src} alt={poster.alt} fill sizes="(min-width: 768px) 66vw, 100vw" className="object-cover" /> : null}
          {live ? <Scene3D accent={accent} tone={tone} /> : null}
          <span className="text-label absolute bottom-4 start-4 bg-bg/60 px-3 py-2 backdrop-blur-md">{t.blocks.realtime3d}</span>
        </div>
      </ScrollReveal>
    </section>
  );
}
