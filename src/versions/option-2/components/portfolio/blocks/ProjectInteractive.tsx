"use client";

import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { ScrollReveal } from "@/versions/option-2/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import type { MediaRef } from "@/data/portfolio";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { MoveHorizontal } from "lucide-react";
import Image from "next/image";
import { useId, useRef } from "react";

type Side = MediaRef & { label: string };
type ProjectInteractiveProps = { eyebrow?: string; title: string; body: string; before: Side; after: Side };

/**
 * Before/after comparison. A native range input drives it, so it is keyboard and screen-reader
 * accessible; pointer dragging anywhere on the image updates the same input. No React re-renders while dragging.
 */
export function ProjectInteractive({ eyebrow, title, body, before, after }: ProjectInteractiveProps) {
  const frame = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const { t } = useContent();

  const apply = (percent: number) => {
    const value = Math.min(100, Math.max(0, percent));
    frame.current?.style.setProperty("--pos", `${value}%`);
    if (input.current) {
      input.current.value = String(Math.round(value));
      input.current.setAttribute("aria-valuetext", `${Math.round(value)}% ${before.label}`);
    }
  };

  const fromPointer = (event: React.PointerEvent) => {
    const rect = frame.current!.getBoundingClientRect();
    apply(((event.clientX - rect.left) / rect.width) * 100);
  };

  return (
    <section className="gutter py-24 md:py-28">
      <div className="mb-12 grid grid-cols-1 gap-6 md:mb-16 md:grid-cols-12">
        <div className="md:col-span-3">{eyebrow ? <SectionLabel>{eyebrow}</SectionLabel> : null}</div>
        <div className="md:col-span-8">
          <RevealText as="h2" mode="words" className="text-headline font-medium">
            {title}
          </RevealText>
          <p className="mt-6 max-w-xl text-muted">{body}</p>
        </div>
      </div>

      <ScrollReveal variant="scale">
        <div
          ref={frame}
          // The comparison is physical (pointer x → clip), so it stays left-to-right in every language.
          dir="ltr"
          className="relative aspect-[4/5] touch-pan-y select-none overflow-hidden bg-surface [--pos:50%] sm:aspect-[16/9]"
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            fromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
          }}
          data-cursor="view"
          data-cursor-label={t.common.drag}
        >
          <Image src={after.src} alt={after.alt} fill sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 [clip-path:inset(0_calc(100%-var(--pos))_0_0)]">
            <Image src={before.src} alt={before.alt} fill sizes="100vw" className="object-cover" />
          </div>

          <span className="text-label absolute left-4 top-4 bg-bg/60 px-3 py-2 backdrop-blur-md">{before.label}</span>
          <span className="text-label absolute right-4 top-4 bg-bg/60 px-3 py-2 backdrop-blur-md">{after.label}</span>

          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-[var(--pos)] w-px bg-fg">
            <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-fg text-bg shadow-[0_0_40px_rgba(3,7,13,0.4)]">
              <MoveHorizontal className="size-5" />
            </span>
          </div>

          <label htmlFor={id} className="sr-only">
            {t.blocks.compare.replace("{before}", before.label).replace("{after}", after.label)}
          </label>
          <input
            ref={input}
            id={id}
            type="range"
            min={0}
            max={100}
            defaultValue={50}
            onInput={(event) => apply(Number(event.currentTarget.value))}
            className="peer pointer-events-none absolute inset-0 h-full w-full opacity-0"
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 hidden outline outline-2 -outline-offset-2 outline-accent peer-focus-visible:block" />
        </div>
      </ScrollReveal>
    </section>
  );
}
