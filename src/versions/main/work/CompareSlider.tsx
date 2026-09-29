"use client";

import type { MediaRef } from "@/data/portfolio";
import { useDirectionSign } from "@/i18n/locale-context";
import Image from "next/image";
import { useId, useState } from "react";

/** Before / after, dragged or keyboard-driven (a native range input underneath). */
export function CompareSlider({ before, after }: { before: MediaRef & { label: string }; after: MediaRef & { label: string } }) {
  const [value, setValue] = useState(50);
  const id = useId();
  const sign = useDirectionSign();
  const clip = sign > 0 ? `inset(0 ${100 - value}% 0 0)` : `inset(0 0 0 ${100 - value}%)`;

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-card bg-navy-800">
      <Image src={after.src} alt={after.alt} fill sizes="(min-width: 768px) 80vw, 100vw" className="object-cover" />
      <div className="absolute inset-0" style={{ clipPath: clip }}>
        <Image src={before.src} alt={before.alt} fill sizes="(min-width: 768px) 80vw, 100vw" className="object-cover" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-px bg-paper" style={{ insetInlineStart: `${value}%` }}>
        <span className="glass absolute top-1/2 grid size-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-xs text-paper rtl:translate-x-1/2">↔</span>
      </div>
      <span className="text-label glass absolute start-4 top-4 rounded-full px-3 py-2">{before.label}</span>
      <span className="text-label glass absolute end-4 top-4 rounded-full px-3 py-2">{after.label}</span>
      <label htmlFor={id} className="sr-only">
        {before.label} / {after.label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="absolute inset-0 size-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
