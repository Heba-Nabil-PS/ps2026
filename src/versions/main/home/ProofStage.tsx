"use client";

import { clientMarks } from "@/data/client-marks";
import { useDirectionSign } from "@/i18n/locale-context";
import { cn } from "@/lib/utils";
import { Counter } from "@/versions/main/motion/Counter";
import { Reveal } from "@/versions/main/motion/Reveal";
import type { SiteCopy } from "@/versions/main/copy";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

type Section = SiteCopy["home"]["proof"];

/** How long each result holds before the next one, in ms (matches the progress rail). */
const HOLD = 7000;
/** Horizontal travel, in px, that counts as a swipe. */
const SWIPE = 48;

/** Splits "1 → 15" or "16×" around its last number, so only that number counts up. */
function splitFigure(value: string) {
  const match = value.match(/^(.*?)(\d+)(\D*)$/);
  return match ? { prefix: match[1], number: Number(match[2]), suffix: match[3] } : null;
}

/**
 * The ledger of results is the navigation: each figure is a tab, and the active one lights up
 * under a sliding beam that drops into the quote card below, where its client says it in their
 * own words. The figure echoes as an outlined watermark behind the quote, tying the two together.
 *
 * - Rotation: advances every HOLD ms along a rail on the active figure. It holds while the
 *   pointer or focus is on it or it is off screen, and stops once the visitor picks a result.
 *   The pause button keeps it in the visitor's hands (WCAG 2.2.2).
 * - Tabs follow the ARIA tabs pattern: arrow keys, Home and End move and select.
 * - Every quote sits in the same grid cell, so switching never shifts the page.
 * - Swipe the card on touch screens. Reduced motion: no rotation, no movement.
 */
export function ProofStage({ section }: { section: Section }) {
  const items = section.items;
  const count = items.length;
  const sign = useDirectionSign();
  const id = useId();
  const stage = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
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

  /** Rotation is on; it only advances while nothing holds it. Holding pauses the rail in place. */
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

  const onTabKey = (event: KeyboardEvent) => {
    const step = { ArrowRight: sign, ArrowLeft: -sign, ArrowDown: 1, ArrowUp: -1 }[event.key];
    let next: number | null = null;
    if (step) next = (active + step + count) % count;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = count - 1;
    if (next === null) return;
    event.preventDefault();
    go(next);
    tabs.current[next]?.focus();
  };

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

  /** Where the beam sits: a 2×2 grid on small screens, one row of four from lg. */
  const beam = {
    "--dir": sign,
    "--col2": active % 2,
    "--row2": Math.floor(active / 2),
    "--col4": active,
  } as CSSProperties;

  return (
    <div
      ref={stage}
      role="region"
      aria-roledescription="carousel"
      aria-label={section.label}
      className="mt-10 md:mt-14"
      onPointerEnter={(event) => event.pointerType === "mouse" && setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setHeld(false)}
    >
      {/* The ledger: four figures as tabs, with one beam (last, so it keeps out of the column selectors) that slides to the active one. */}
      <div role="tablist" aria-label={section.clients} onKeyDown={onTabKey} className="relative isolate grid grid-cols-2 border-t border-line lg:grid-cols-4" style={beam}>
        {items.map((item, index) => {
          const on = index === active;
          const figure = splitFigure(item.value);
          const mark = clientMarks[item.mark];
          return (
            <button
              key={item.client}
              ref={(el) => {
                tabs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${id}-tab-${index}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => go(index)}
              className={cn(
                "group relative flex min-w-0 flex-col items-start gap-3 border-b border-line px-4 py-6 text-start even:border-s sm:gap-4 sm:px-6 sm:py-8 lg:border-b-0 lg:[&:not(:first-child)]:border-s",
                "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-sky",
              )}
            >
              {/* The rotation rail: fills across the top of the active figure over one hold. */}
              <span aria-hidden className="absolute inset-x-0 -top-px h-px overflow-hidden">
                {on && rotating ? (
                  <span
                    key={`${active}-${rotating}`}
                    className="absolute inset-0 origin-left animate-[testimonial-progress_linear_forwards] bg-sky rtl:origin-right"
                    style={{ animationDuration: `${HOLD}ms`, animationPlayState: advancing ? "running" : "paused" }}
                    onAnimationEnd={() => go(active + 1, false)}
                  />
                ) : null}
              </span>

              <span
                className={cn(
                  "stretch text-grain text-[clamp(1.28rem,7vw,2.6rem)] leading-none text-sky transition-[opacity,translate] duration-500 ease-out-strong lg:text-[clamp(2.08rem,4.6vw,4.4rem)] motion-reduce:transition-none",
                  on ? "opacity-100" : "opacity-40 group-hover:opacity-70 motion-safe:translate-y-1",
                )}
                style={{ ["--wdth" as string]: 112 }}
              >
                {figure ? (
                  <>
                    {figure.prefix}
                    <Counter value={figure.number} suffix={figure.suffix} />
                  </>
                ) : (
                  item.value
                )}
              </span>
              <span className={cn("text-sm leading-snug transition-colors duration-500 sm:text-base", on ? "text-fg" : "text-muted")}>{item.caption}</span>
              <span className={cn("mt-auto flex h-8 items-center transition-opacity duration-500 sm:h-10", on ? "opacity-100" : "opacity-50 group-hover:opacity-80")}>
                {mark ? (
                  <Image
                    src={`/images/clients/marks/${item.mark}.webp`}
                    alt={item.client}
                    width={mark.width}
                    height={mark.height}
                    className="h-6 w-auto max-w-24 object-contain sm:h-8 sm:max-w-32 light:brightness-0"
                  />
                ) : (
                  <span className="text-label text-sky">{item.client}</span>
                )}
              </span>
            </button>
          );
        })}

        <span
          aria-hidden
          className="proof-beam pointer-events-none absolute top-0 start-0 -z-10 h-1/2 w-1/2 lg:h-full lg:w-1/4"
        >
          <span className="absolute inset-0 bg-linear-to-b from-sky/[0.09] via-sky/[0.04] to-transparent" />
          <span className="absolute inset-x-0 -top-px h-px bg-sky/50 shadow-[0_0_24px_2px] shadow-sky/40" />
        </span>
      </div>

      {/* The card: the active client's words, with its figure echoed behind them. */}
      <Reveal className="relative mt-6 md:mt-8">
        <div
          data-reveal-item
          id={`${id}-panel`}
          role="tabpanel"
          aria-labelledby={`${id}-tab-${active}`}
          className="relative isolate overflow-hidden rounded-[2rem] border border-line bg-glass"
          style={beam}
        >
          {/* A notch on the card's top edge, under the active figure: where the beam lands. */}
          <span aria-hidden className="proof-notch pointer-events-none absolute top-0 start-0 hidden w-1/4 lg:block">
            <span className="mx-auto block h-px w-24 bg-linear-to-r from-transparent via-sky to-transparent" />
            <span className="mx-auto block h-24 w-40 bg-[radial-gradient(ellipse_at_top,var(--color-sky)_0%,transparent_70%)] opacity-15" />
          </span>
          <span
            aria-hidden
            className="pointer-events-none absolute top-2 start-5 -z-10 select-none font-serif text-[9rem] leading-[0.8] text-sky/20 md:top-6 md:start-12 md:text-[12rem]"
          >
            &ldquo;
          </span>

          <div className="grid touch-pan-y" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)}>
            {items.map((item, index) => {
              const on = index === active;
              const words = item.quote.text.split(/\s+/);
              return (
                <figure key={item.client} aria-hidden={!on} inert={!on} className={cn("relative col-start-1 row-start-1", !on && "pointer-events-none")}>
                  {/* The figure, outlined and oversized, drifting in from the end edge. */}
                  <span
                    aria-hidden
                    className={cn(
                      "proof-echo stretch pointer-events-none absolute hidden lg:block -bottom-[0.18em] end-[-0.04em] -z-10 select-none text-[clamp(10rem,20vw,20rem)] leading-none whitespace-nowrap",
                      "transition-[opacity,translate,filter] ease-expo motion-reduce:transition-none",
                      on ? "translate-x-0 opacity-100 blur-0 duration-[1400ms]" : "translate-x-[calc(var(--dir)*8%)] opacity-0 blur-sm duration-300",
                    )}
                    style={{ ["--wdth" as string]: 112 }}
                  >
                    {item.value}
                  </span>

                  <div className="flex min-h-full flex-col justify-between gap-10 p-7 pt-24 sm:p-10 sm:pt-28 md:p-14 md:pt-32 lg:pe-[38%]">
                    <blockquote
                      className={cn(
                        "max-w-[28ch] text-[clamp(1.25rem,2.8vw,2.5rem)] leading-[1.2] tracking-[-0.015em] text-balance",
                        item.quote.pending ? "text-fg/70" : "text-fg",
                      )}
                    >
                      <p>
                        {/* Word by word, the incoming quote comes into focus; the outgoing one leaves at once. */}
                        {words.map((word, w) => (
                          <span
                            key={w}
                            className={cn(
                              "inline-block transition-[opacity,translate,filter] motion-reduce:transition-none",
                              on ? "translate-y-0 opacity-100 blur-0 duration-700 ease-expo" : "translate-y-2 opacity-0 blur-[6px] duration-200 ease-out",
                            )}
                            style={on ? { transitionDelay: `${150 + w * 28}ms` } : undefined}
                          >
                            {word}
                            {w < words.length - 1 ? " " : null}
                          </span>
                        ))}
                      </p>
                    </blockquote>

                    <figcaption
                      className={cn(
                        "flex flex-wrap items-center gap-4 transition-[opacity,translate] motion-reduce:transition-none",
                        on ? "translate-y-0 opacity-100 duration-700 ease-expo" : "translate-y-2 opacity-0 duration-200",
                      )}
                      style={on ? { transitionDelay: `${250 + words.length * 28}ms` } : undefined}
                    >
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
                </figure>
              );
            })}
          </div>

          {/* Controls, pinned to the card's top end so they never move with the quote. */}
          <div className="absolute top-5 end-5 flex items-center gap-2 sm:top-7 sm:end-7 md:top-10 md:end-10">
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
      </Reveal>

      <p className="sr-only" aria-live="polite">
        {announce ? `${active + 1} / ${count}: ${items[active].client}` : ""}
      </p>
    </div>
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
        "grid size-11 place-items-center rounded-full text-fg backdrop-blur-sm transition-[background-color,border-color,color,scale] duration-300 ease-out-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky active:scale-95",
        quiet ? "text-muted hover:text-fg" : "border border-line-strong hover:border-sky/60 hover:bg-sky/10",
      )}
    >
      <span aria-hidden className="contents">
        {children}
      </span>
    </button>
  );
}
