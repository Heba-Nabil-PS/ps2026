"use client";

import { clientMarks } from "@/data/client-marks";
import { useDirectionSign } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { Counter } from "@/versions/main/motion/Counter";
import { Reveal } from "@/versions/main/motion/Reveal";
import type { SiteCopy } from "@/versions/main/copy";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FocusEvent, type PointerEvent, type ReactNode } from "react";

type Section = SiteCopy["home"]["proof"];

/** How long each quote holds before the next one, in ms (matches the progress line). */
const HOLD = 8000;
/** Horizontal travel, in px, that counts as a swipe. */
const SWIPE = 48;

/**
 * Each testimonial carries its own result, drawn as well as stated: the figure counts up beside a
 * small glyph built for that metric (a return bar that outgrows the spend, rings of reach, a
 * calendar of days). Each quote opens with its own client's mark. Bare arrows sit in the result panel's corner with
 * the rotation beside them: one line per client, the current one filling.
 *
 * - Autoplay: advances every HOLD ms and keeps going after the visitor picks a quote (picking
 *   restarts the line). It holds only while the card is off screen or keyboard focus is inside
 *   it; the pause button keeps it in the visitor's hands (WCAG 2.2.2).
 * - Every quote sits in the same grid cell, so switching never shifts the page.
 * - Swipe on touch screens. Reduced motion: no rotation, glyphs shown complete.
 */
export function VoicesStage({ section }: { section: Section }) {
  const items = section.items;
  const count = items.length;
  const sign = useDirectionSign();
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  /** Glyphs draw only once the card has been seen, so the first one is not spent off screen. */
  const [seen, setSeen] = useState(false);
  const [calm, setCalm] = useState(true);
  /** Announce changes only when the visitor made them, never on autoplay. */
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setCalm(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const on = entry.isIntersecting && document.visibilityState === "visible";
        setVisible(on);
        if (on) setSeen(true);
      },
      { threshold: 0.35 },
    );
    const onVisibility = () => document.visibilityState === "hidden" && setVisible(false);
    observer.observe(el);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /** Autoplay is on; it only advances while nothing holds it. Holding pauses the line in place. */
  const rotating = count > 1 && !calm && !paused;
  const advancing = rotating && !held && visible;

  const go = useCallback(
    (index: number, byVisitor = true) => {
      setActive(((index % count) + count) % count);
      if (byVisitor) setAnnounce(true);
    },
    [count],
  );

  /** Keyboard focus holds the rotation so a quote never moves under someone reading it; a click does not. */
  const onFocus = (event: FocusEvent) => setHeld(event.target.matches(":focus-visible"));

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "mouse") swipe.current = { x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = event.clientX - start.x;
    if (Math.abs(dx) < SWIPE || Math.abs(dx) < Math.abs(event.clientY - start.y)) return;
    // Swiping towards the reading start moves forward, in either direction of text.
    go(active + (dx * sign < 0 ? 1 : -1));
  };

  return (
    <Reveal className="mt-12 md:mt-16">
      <div
        ref={stage}
        data-reveal-item
        role="region"
        aria-roledescription="carousel"
        aria-label={section.label}
        onFocus={onFocus}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setHeld(false)}
        className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-glass"
      >
        {/* Ambient light that drifts to a new spot for each client. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-56 end-[-10%] -z-10 size-[38rem] rounded-full bg-sky/10 blur-3xl transition-transform duration-[1600ms] ease-expo motion-reduce:transition-none"
          style={{ transform: `translate(${sign * -(active % 2) * 18}%, ${(active % 3) * 12}%)` }}
        />

        <div className="relative">
          {/* The result panel's surface, drawn once behind every quote so it never stacks. */}
          <div aria-hidden className="pointer-events-none absolute inset-y-0 end-0 -z-10 hidden w-5/12 border-s border-line bg-sky/[0.04] md:block" />

          <div className="grid touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
            {items.map((item, index) => {
              const on = index === active;
              const figure = splitFigure(item.value);
              const mark = clientMarks[item.mark];
              const words = item.quote.text.split(/\s+/);
              return (
                <figure key={item.client} aria-hidden={!on} inert={!on} className={cn("col-start-1 row-start-1 grid md:grid-cols-12", !on && "pointer-events-none")}>
                  {/* Start side: who it is, what they said, who said it. */}
                  <div className="flex flex-col gap-10 p-7 sm:p-10 md:col-span-7 md:p-14">
                    <div className={cn("flex h-10 items-center", enter(on))} style={delay(on, 0)}>
                      {mark ? (
                        <Image
                          src={`/images/clients/marks/${item.mark}.webp`}
                          alt={item.client}
                          width={mark.width}
                          height={mark.height}
                          className="h-9 w-auto max-w-36 object-contain light:brightness-0"
                        />
                      ) : (
                        <span className="text-label text-sky">{item.client}</span>
                      )}
                    </div>

                    <blockquote
                      className={cn(
                        "relative max-w-[26ch] text-[clamp(1.25rem,2.6vw,2.3rem)] leading-[1.22] tracking-[-0.015em] text-balance",
                        item.quote.pending ? "text-fg/70" : "text-fg",
                      )}
                    >
                      <span aria-hidden className="absolute -top-10 -start-1 select-none font-serif text-[5rem] md:-top-6 leading-none text-sky/25 md:-start-6">
                        &ldquo;
                      </span>
                      <p className="relative">
                        {/* Word by word, the incoming quote comes into focus; the outgoing one leaves at once. */}
                        {words.map((word, w) => (
                          <span
                            key={w}
                            className={cn(
                              "inline-block transition-[opacity,translate,filter] motion-reduce:transition-none",
                              on ? "translate-y-0 opacity-100 blur-0 duration-700 ease-expo" : "translate-y-2 opacity-0 blur-[6px] duration-200 ease-out",
                            )}
                            style={on ? { transitionDelay: `${200 + w * 28}ms` } : undefined}
                          >
                            {word}
                            {w < words.length - 1 ? " " : null}
                          </span>
                        ))}
                      </p>
                    </blockquote>

                    <figcaption className={cn("mt-auto flex flex-wrap items-center gap-4", enter(on))} style={delay(on, 300 + words.length * 28)}>
                      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-sky/30 bg-sky/10 text-sm font-medium text-sky">
                        {initials(item.quote.name)}
                      </span>
                      <span className="flex flex-col text-sm">
                        <cite className="font-medium not-italic text-fg">{item.quote.name}</cite>
                        <span className="text-muted">{item.quote.role}</span>
                      </span>
                      {item.quote.pending ? (
                        <span className="text-label rounded-full border border-dashed border-sky/40 px-3 py-1 text-sky/80">{section.pending}</span>
                      ) : null}
                    </figcaption>
                  </div>

                  {/* End side: the result, drawn and counted. */}
                  <div className={cn("relative mx-7 flex flex-col justify-end gap-5 border-t border-line pt-7 pb-20 sm:mx-10 sm:pt-10 sm:pb-24 md:col-span-5 md:mx-0 md:border-t-0 md:p-14", enter(on))}>
                    <div className="flex h-32 items-end sm:h-40 lg:h-48">
                      <ResultGlyph kind={item.viz} on={on && (seen || calm)} calm={calm} />
                    </div>
                    <p className="flex flex-col gap-2">
                      <span className="stretch text-grain text-[clamp(3rem,7vw,6.5rem)] leading-[0.9] text-sky" style={{ ["--wdth" as string]: 112 }}>
                        {on && figure && seen ? (
                          <>
                            {figure.prefix}
                            {/* Remounts on every switch, so each figure counts up as it arrives. */}
                            <Counter key={active} value={figure.number} suffix={figure.suffix} />
                          </>
                        ) : (
                          item.value
                        )}
                      </span>
                      <span className={cn("max-w-[22ch] text-muted", enter(on))} style={delay(on, 400)}>
                        {item.caption}
                      </span>
                    </p>
                  </div>
                </figure>
              );
            })}
          </div>
        </div>

        {/* Bare controls with the rotation beside them: one short line per client, the current one filling over its hold.
            The result panel's top corner on wide screens, the card's bottom corner on small ones. */}
        <div className="absolute bottom-4 end-4 flex items-center sm:bottom-6 sm:end-6 md:top-12 md:bottom-auto md:end-10">
          {count > 1 && !calm ? (
            <ControlButton label={paused ? section.play : section.pause} onClick={() => setPaused((value) => !value)}>
              {paused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
            </ControlButton>
          ) : null}
          <ControlButton label={section.previous} onClick={() => go(active - 1)} nudge={-1}>
            <ArrowLeft className="size-5 rtl:-scale-x-100" strokeWidth={1.5} />
          </ControlButton>
          <div role="group" aria-label={section.clients} className="flex items-center">
            {items.map((item, index) => {
              const on = index === active;
              return (
                <button
                  key={item.client}
                  type="button"
                  aria-label={item.client}
                  aria-current={on ? "true" : undefined}
                  onClick={() => go(index)}
                  className="group grid h-11 place-items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
                >
                  <span
                    className={cn(
                      "relative block h-0.5 overflow-hidden rounded-full transition-[width,background-color] duration-500 ease-expo",
                      on ? "w-10 bg-line-strong" : "w-4 bg-line-strong group-hover:bg-fg/40",
                      index < active && "bg-sky/50",
                    )}
                  >
                    {on ? (
                      <span
                        key={`${active}-${rotating}`}
                        className={cn("absolute inset-0 origin-left bg-sky rtl:origin-right", rotating ? "animate-[testimonial-progress_linear_forwards]" : "scale-x-100")}
                        style={rotating ? { animationDuration: `${HOLD}ms`, animationPlayState: advancing ? "running" : "paused" } : undefined}
                        onAnimationEnd={() => go(active + 1, false)}
                      />
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
          <ControlButton label={section.next} onClick={() => go(active + 1)} nudge={1}>
            <ArrowRight className="size-5 rtl:-scale-x-100" strokeWidth={1.5} />
          </ControlButton>
        </div>

        <p className="sr-only" aria-live="polite">
          {announce ? `${active + 1} / ${count}: ${items[active].client}` : ""}
        </p>
      </div>
    </Reveal>
  );
}

/** Splits "16×" or "10M" around its last number, so only that number counts up. */
function splitFigure(value: string) {
  const match = value.match(/^(.*?)(\d+)(\D*)$/);
  return match ? { prefix: match[1], number: Number(match[2]), suffix: match[3] } : null;
}

/** Up to two initials for the avatar beside the name. */
function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** A bare control: no box, just the glyph; arrows lean towards where they go on hover. */
function ControlButton({ label, onClick, nudge, children }: { label: string; onClick: () => void; nudge?: -1 | 1; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="group grid size-11 place-items-center rounded-full text-fg/60 transition-[color,scale] duration-200 ease-out-strong hover:text-sky focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky active:scale-90"
    >
      <span
        aria-hidden
        className={cn(
          "grid place-items-center transition-transform duration-300 ease-out-strong",
          nudge === 1 && "group-hover:translate-x-1 rtl:group-hover:-translate-x-1",
          nudge === -1 && "group-hover:-translate-x-1 rtl:group-hover:translate-x-1",
        )}
      >
        {children}
      </span>
    </button>
  );
}

/** Fades and lifts a block in when its quote becomes active; leaves fast. */
function enter(on: boolean) {
  return cn(
    "transition-[opacity,translate] motion-reduce:transition-none",
    on ? "translate-y-0 opacity-100 duration-700 ease-expo" : "translate-y-2 opacity-0 duration-200",
  );
}

function delay(on: boolean, ms: number): CSSProperties | undefined {
  return on ? { transitionDelay: `${ms}ms` } : undefined;
}

/**
 * A small drawing of the metric. Cells light in sequence when `on` and reset instantly when off,
 * so every arrival draws it fresh. Decorative: the figure and caption carry the meaning.
 */
function ResultGlyph({ kind, on, calm }: { kind: string; on: boolean; calm: boolean }) {
  const cell = (i: number, step: number, base = 0): CSSProperties | undefined => (on && !calm ? { transitionDelay: `${base + i * step}ms` } : undefined);
  const lit = (isOn: boolean) =>
    cn("transition-[background-color,opacity,scale,box-shadow] motion-reduce:transition-none", isOn ? "duration-500 ease-out-strong" : "duration-150");

  if (kind === "multiplier") {
    // One bar of spend beside the return it bought: sixteen segments stacking up.
    return (
      <div aria-hidden className="flex h-full items-end gap-3">
        <div className="flex flex-col items-center gap-2">
          <span className={cn("block h-[6%] min-h-1.5 w-7 rounded-[3px] sm:w-9 lg:w-14", lit(on), on ? "bg-fg/40" : "bg-fg/10")} />
          <span className="text-label text-muted">1</span>
        </div>
        <div className="flex h-full flex-col items-center gap-2">
          <div className="flex flex-1 flex-col-reverse gap-[3px]">
            {Array.from({ length: 16 }, (_, i) => (
              <span
                key={i}
                className={cn("block w-7 flex-1 rounded-[2px] sm:w-9 lg:w-14", lit(on), on ? "scale-x-100 bg-sky shadow-[0_0_12px] shadow-sky/30" : "scale-x-75 bg-sky/10")}
                style={cell(i, 45, 250)}
              />
            ))}
          </div>
          <span className="text-label text-sky">16</span>
        </div>
      </div>
    );
  }

  if (kind === "reach") {
    // Rings of reach spreading from one point, with a ripple that keeps travelling outward.
    return (
      <div aria-hidden className="relative aspect-square h-full">
        {[1, 0.75, 0.5, 0.25].map((size, i) => (
          <span
            key={size}
            className={cn("absolute inset-0 m-auto rounded-full border", lit(on), on ? "scale-100 border-sky/35 opacity-100" : "scale-75 border-sky/10 opacity-0")}
            style={{ width: `${size * 100}%`, height: `${size * 100}%`, ...cell(3 - i, 140, 200) }}
          />
        ))}
        {on && !calm ? <span className="absolute inset-0 m-auto size-full animate-[proof-ripple_2.6s_var(--ease-out-strong)_infinite] rounded-full border border-sky/60" /> : null}
        {REACH_DOTS.map(([x, y], i) => (
          <span
            key={i}
            className={cn("absolute size-1 rounded-full", lit(on), on ? "scale-100 bg-sky opacity-80" : "scale-0 bg-sky opacity-0")}
            style={{ left: `${x}%`, top: `${y}%`, ...cell(i, 35, 500) }}
          />
        ))}
        <span className="absolute inset-0 m-auto size-2.5 rounded-full bg-sky shadow-[0_0_16px_4px] shadow-sky/50" />
      </div>
    );
  }

  // days: fifty days as a calendar that fills in, one row for each of the five countries.
  return (
    <div aria-hidden className="grid grid-cols-10 gap-1 sm:gap-1.5 lg:gap-2">
      {Array.from({ length: 50 }, (_, i) => (
        <span
          key={i}
          className={cn("block size-2.5 rounded-[3px] sm:size-3.5 lg:size-5", lit(on), on ? "scale-100 bg-sky" : "scale-75 bg-sky/10", i === 49 && on && "shadow-[0_0_14px_2px] shadow-sky/60")}
          style={cell(i, 18, 200)}
        />
      ))}
    </div>
  );
}

/** Fixed, evenly spread points for the reach glyph (golden-angle spiral, so it is the same on server and client). */
const REACH_DOTS = Array.from({ length: 18 }, (_, i) => {
  const r = 18 + (i / 18) * 30;
  const a = i * 2.39996;
  return [Math.round((50 + r * Math.cos(a)) * 10) / 10, Math.round((50 + r * Math.sin(a)) * 10) / 10] as const;
});
