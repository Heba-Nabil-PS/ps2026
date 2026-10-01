"use client";

import { clientMarks } from "@/data/client-marks";
import { useDirectionSign } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import type { SiteCopy } from "@/versions/main/copy";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";

type Section = SiteCopy["home"]["testimonials"];

/** How long each quote holds before the next one, in ms (matches the progress line). */
const HOLD = 7000;
/** Horizontal travel, in px, that counts as a swipe. */
const SWIPE = 48;

/**
 * One big quote at a time, open on the page and on the section grid: the client's mark and their words,
 * the result beside them, then a closing rule with who said it. Thin lines on that rule show
 * the rotation and double as navigation.
 *
 * - Rotation: advances every HOLD ms. It holds while the pointer or focus is on
 *   it or it is off screen, and stops once the visitor picks a quote. The pause
 *   button keeps it in the visitor's hands (WCAG 2.2.2).
 * - Every quote sits in the same grid cell, so switching never shifts the page.
 * - Swipe on touch screens. Reduced motion: no rotation, no transitions.
 */
export function TestimonialStage({ section }: { section: Section }) {
  const items = section.items;
  const count = items.length;
  const sign = useDirectionSign();
  const stage = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [held, setHeld] = useState(false);
  const [visible, setVisible] = useState(false);
  const [calm, setCalm] = useState(true);
  /** Announce changes only when the visitor made them, never on auto-rotation. */
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
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && document.visibilityState === "visible"), { threshold: 0.35 });
    const onVisibility = () => document.visibilityState === "hidden" && setVisible(false);
    observer.observe(el);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  /** Rotation is on; it only advances while nothing holds it. Holding pauses the line in place. */
  const rotating = count > 1 && !calm && !paused;
  const advancing = rotating && !held && visible;

  const go = useCallback(
    (index: number, byVisitor = true) => {
      setActive(((index % count) + count) % count);
      if (byVisitor) {
        setAnnounce(true);
        setPaused(true);
      }
    },
    [count],
  );

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
        onPointerEnter={(event) => event.pointerType === "mouse" && setHeld(true)}
        onPointerLeave={() => setHeld(false)}
        onFocus={() => setHeld(true)}
        onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setHeld(false)}
      >
        {/* Mark + quote: one cell for all, so the block is as tall as the longest and never shifts. */}
        <div className="grid touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
          {items.map((item, index) => {
            const on = index === active;
            const mark = clientMarks[item.client];
            return (
              <figure key={index} aria-hidden={!on} inert={!on} className={cn("col-start-1 row-start-1 grid gap-10 md:grid-cols-12 md:items-end md:gap-8", fade(on))}>
                {/* Same 12 columns as SectionHead: the quote under the title, the result under the intro. */}
                <div className="md:col-span-8">
                  <div className="flex min-h-12 items-center gap-5">
                    {mark ? (
                      <Image
                        src={`/images/clients/marks/${item.client}.webp`}
                        alt={item.clientName}
                        width={mark.width}
                        height={mark.height}
                        className="h-9 w-auto max-w-36 object-contain object-left rtl:object-right md:h-11"
                      />
                    ) : null}
                    {item.pending ? <span className="text-label rounded-full border border-dashed border-sky/50 px-3 py-1 text-sky">{section.pending}</span> : null}
                  </div>

                  <blockquote
                    className={cn(
                      "mt-8 max-w-[24ch] text-[clamp(1.9rem,4.2vw,3.75rem)] leading-[1.12] tracking-[-0.02em] text-balance md:mt-10",
                      item.pending ? "text-fg/70" : "text-fg",
                    )}
                  >
                    {/* Hanging quote marks: the first letter, not the mark, lines up with the title above. */}
                    <p className="relative">
                      <span aria-hidden className="absolute -translate-x-full text-sky rtl:translate-x-full">
                        &ldquo;
                      </span>
                      {item.quote}
                      <span aria-hidden className="text-sky">
                        &rdquo;
                      </span>
                    </p>
                  </blockquote>
                </div>

                <p className="flex flex-col gap-3 md:col-span-4 md:pb-2">
                  <span className="stretch text-[clamp(3rem,6vw,5.5rem)] leading-[0.9] text-sky" style={{ ["--wdth" as string]: 112 }}>
                    {item.result.value}
                  </span>
                  <span className="max-w-[24ch] text-muted">{item.result.caption}</span>
                </p>
              </figure>
            );
          })}
        </div>

        {/* Closing rule: who said it on the start side, controls on the end side. */}
        <div className="mt-12 flex flex-col gap-6 border-t border-line pt-6 md:mt-16 md:flex-row md:items-center md:justify-between">
          <div className="grid">
            {items.map((item, index) => {
              const on = index === active;
              return (
                <p key={index} aria-hidden={!on} className={cn("col-start-1 row-start-1 text-sm", fade(on))}>
                  <cite className="font-medium not-italic text-fg">{item.name}</cite>
                  <span className="text-muted"> · {item.role}</span>
                </p>
              );
            })}
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <div role="group" aria-label={section.clients} className="me-auto flex items-center gap-1 md:me-2">
              {items.map((item, index) => {
                const on = index === active;
                return (
                  <button
                    key={index}
                    type="button"
                    aria-label={item.clientName}
                    aria-current={on ? "true" : undefined}
                    onClick={() => go(index)}
                    className="group grid h-11 place-items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky"
                  >
                    <span
                      className={cn(
                        "relative block h-0.5 overflow-hidden rounded-full bg-line-strong transition-[width] duration-500 ease-expo",
                        on ? "w-12" : "w-5 group-hover:w-8",
                      )}
                    >
                      {on ? (
                        <span
                          key={`${active}-${rotating}`}
                          className={cn("absolute inset-0 origin-left bg-sky rtl:origin-right", rotating ? "animate-[testimonial-progress_linear_forwards]" : "scale-x-100")}
                          style={
                            rotating
                              ? {
                                  animationDuration: `${HOLD}ms`,
                                  animationPlayState: advancing ? "running" : "paused",
                                }
                              : undefined
                          }
                          onAnimationEnd={() => go(active + 1, false)}
                        />
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {count > 1 && !calm ? (
              <ControlButton label={paused ? section.play : section.pause} onClick={() => setPaused((value) => !value)} quiet>
                {paused ? <Play className="size-3 fill-current" /> : <Pause className="size-3 fill-current" />}
              </ControlButton>
            ) : null}
            <ControlButton label={section.previous} onClick={() => go(active - 1)}>
              <ArrowLeft className="size-4 rtl:-scale-x-100" />
            </ControlButton>
            <ControlButton label={section.next} onClick={() => go(active + 1)}>
              <ArrowRight className="size-4 rtl:-scale-x-100" />
            </ControlButton>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {announce ? `${active + 1} / ${count}: ${items[active].clientName}` : ""}
        </p>
      </div>
    </Reveal>
  );
}

function ControlButton({ label, onClick, quiet, children }: { label: string; onClick: () => void; quiet?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full text-fg transition-[background-color,border-color,color,scale] duration-300 ease-out-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky active:scale-95",
        quiet ? "text-muted hover:text-fg" : "border border-line-strong hover:border-sky/60 hover:bg-sky/10",
      )}
    >
      <span aria-hidden className="contents">
        {children}
      </span>
    </button>
  );
}

/** The swap between quotes: the outgoing one sinks and softens, the incoming one settles in. */
function fade(on: boolean) {
  return cn(
    "transition-[opacity,translate,filter] duration-700 ease-expo motion-reduce:transition-none",
    on ? "translate-y-0 opacity-100 blur-0 delay-150" : "pointer-events-none translate-y-4 opacity-0 blur-sm",
  );
}
