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
 * One quote at a time in a glass card: the client's words and who said them on the start side,
 * the result in its own panel on the end side. Client marks under the card are the navigation;
 * the active one carries a thin line that shows the rotation.
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
        {/* The card: quote and who said it on the start side, the result in its own panel on the end side. */}
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-glass">
          <div aria-hidden className="pointer-events-none absolute -top-48 -z-10 size-[36rem] rounded-full bg-sky/10 blur-3xl end-[-12%]" />
          <span
            aria-hidden
            className="pointer-events-none absolute top-2 start-5 -z-10 select-none font-serif text-[10rem] leading-[0.8] text-sky/20 md:top-6 md:start-12 md:text-[13rem]"
          >
            &ldquo;
          </span>

          {/* One cell for all quotes, so the card is as tall as the longest and never shifts. */}
          <div className="grid touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
            {items.map((item, index) => {
              const on = index === active;
              return (
                <figure key={index} aria-hidden={!on} inert={!on} className={cn("col-start-1 row-start-1 grid md:grid-cols-12", fade(on))}>
                  <div className="flex flex-col justify-between gap-10 p-7 pt-24 sm:p-10 sm:pt-28 md:col-span-8 md:p-14 md:pt-32">
                    <blockquote
                      className={cn(
                        "max-w-[26ch] text-[clamp(1.25rem,2.8vw,2.5rem)] leading-[1.2] tracking-[-0.015em] text-balance",
                        item.pending ? "text-fg/70" : "text-fg",
                      )}
                    >
                      <p>{item.quote}</p>
                    </blockquote>

                    <figcaption className="flex flex-wrap items-center gap-4">
                      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-sky/30 bg-sky/10 text-sm font-medium text-sky">
                        {initials(item.name)}
                      </span>
                      <span className="flex flex-col text-sm">
                        <cite className="font-medium not-italic text-fg">{item.name}</cite>
                        <span className="text-muted">{item.role}</span>
                      </span>
                      {item.pending ? (
                        <span className="text-label ms-auto rounded-full border border-dashed border-sky/40 px-3 py-1 text-sky/80">{section.pending}</span>
                      ) : null}
                    </figcaption>
                  </div>

                  <p className="flex flex-col justify-end gap-3 border-t border-line bg-sky/[0.04] p-7 sm:p-10 md:col-span-4 md:border-t-0 md:border-s md:p-14">
                    <span className="stretch text-[clamp(2.8rem,7vw,6.5rem)] leading-[0.9] text-sky" style={{ ["--wdth" as string]: 112 }}>
                      {item.result.value}
                    </span>
                    <span className="max-w-[18ch] text-muted">{item.result.caption}</span>
                  </p>
                </figure>
              );
            })}
          </div>
        </div>

        {/* Under the card: client marks as tabs (the active one carries the rotation line), controls at the end. */}
        <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-center md:justify-between">
          <div role="group" aria-label={section.clients} className="-mx-2 flex flex-wrap items-center gap-1">
            {items.map((item, index) => {
              const on = index === active;
              const mark = clientMarks[item.client];
              return (
                <button
                  key={index}
                  type="button"
                  aria-label={item.clientName}
                  aria-current={on ? "true" : undefined}
                  onClick={() => go(index)}
                  className={cn(
                    "relative grid h-14 place-items-center px-4 transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky",
                    on ? "opacity-100 light:opacity-80" : "opacity-35 hover:opacity-70",
                  )}
                >
                  {mark ? (
                    <Image
                      src={`/images/clients/marks/${item.client}.webp`}
                      alt=""
                      width={mark.width}
                      height={mark.height}
                      className="h-7 w-auto max-w-28 object-contain light:brightness-0"
                    />
                  ) : (
                    <span className="text-sm font-medium text-fg">{item.clientName}</span>
                  )}
                  <span className="absolute inset-x-4 bottom-1 h-0.5 overflow-hidden rounded-full bg-line">
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

          <div className="flex items-center gap-2 self-end md:self-auto">
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
