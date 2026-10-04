"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useRef } from "react";
import { ReelSlides } from "./ReelSlides";
import { REEL_START_RADIUS, REEL_START_SIZE } from "./reelHandoff";

type ShowreelProps = {
  label: string;
  year: string;
  play: string;
  reel: string;
  /** Add a video path (e.g. "/videos/reel.webm") to replace the slideshow. */
  video?: string;
  slides: readonly { image: string; alt: string }[];
};

const insetFor = (w: number, h: number, radius: number) => {
  const x = ((1 - w) / 2) * 100;
  const y = ((1 - h) / 2) * 100;
  return `inset(${y.toFixed(3)}% ${x.toFixed(3)}% ${y.toFixed(3)}% ${x.toFixed(3)}% round ${radius.toFixed(1)}px)`;
};

/**
 * The showreel, pulled open by the scroll. It overlaps the positioning section's
 * last screen and takes over the moment that section's frame lands on its opening
 * rectangle (the same share of the screen, the same crop, the same slide), so the
 * frame the visitor followed down is the one that opens. Held in place, it opens
 * to the full screen on an eased curve, the media growing with it, while "Play" /
 * "Reel" come in beside it and part to the edges; then the page moves on.
 */
export function Showreel({ label, year, play, reel, video, slides }: ShowreelProps) {
  const track = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = track.current;
      const screen = stage.current;
      const box = frame.current;
      const inner = media.current;
      if (!section || !screen || !box || !inner) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          phone: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { phone } = context.conditions as { phone: boolean; wide: boolean };
          const start = phone ? REEL_START_SIZE.phone : REEL_START_SIZE.wide;
          const shape = { w: start.w, h: start.h, radius: REEL_START_RADIUS };
          // The media grows with the frame: at any size it shows the whole picture, as the positioning frame did.
          const apply = () => {
            box.style.clipPath = insetFor(shape.w, shape.h, shape.radius);
            // Scaled to cover the frame, as the positioning frame shows it.
            inner.style.transform = `scale(${Math.max(shape.w, shape.h).toFixed(4)})`;
          };
          apply();

          // Hidden until the handoff: until then the positioning frame is the reel.
          const handover = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: "max",
            onToggle: (self) => gsap.set(screen, { autoAlpha: self.isActive ? 1 : 0 }),
          });
          if (!handover.isActive) gsap.set(screen, { autoAlpha: 0 });

          // From the handoff to the end of the hold. No smoothing (Lenis smooths the scroll), so the first frame matches exactly.
          gsap
            .timeline({
              defaults: { ease: "none" },
              onUpdate: apply,
              scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true },
            })
            // "Play" / "Reel" come in beside the frame.
            .fromTo("[data-reel-label]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0)
            // The pull into the reel: it opens straight away, quick at first, easing into the full screen.
            .to(shape, { w: 1, h: 1, radius: 0, duration: 1.1, ease: "power2.out" }, 0.1)
            .fromTo("[data-reel-shade]", { opacity: 0 }, { opacity: 1, duration: 0.9 }, 0.1)
            .fromTo("[data-reel-label='left']", { xPercent: 0 }, { xPercent: -40, duration: 1.1, ease: "power2.in" }, 0.1)
            .fromTo("[data-reel-label='right']", { xPercent: 0 }, { xPercent: 40, duration: 1.1, ease: "power2.in" }, 0.1)
            .to("[data-reel-label]", { opacity: 0, duration: 0.6 }, 0.7)
            // Hold the full screen a moment before the page moves on.
            .to({}, { duration: 0.6 });

          return () => {
            handover.kill();
            gsap.set(screen, { clearProps: "visibility,opacity" });
            inner.style.removeProperty("transform");
          };
        },
      );
      mm.add("(prefers-reduced-motion: reduce)", () => {
        box.style.clipPath = insetFor(1, 1, 0);
      });

      return () => mm.revert();
    },
    { scope: track },
  );

  return (
    // Pulled up over the positioning section's last screen, where its frame hands over (only when that section animates).
    <section aria-label={label} ref={track} className="relative h-[200vh] motion-safe:mt-[-100svh]">
      <div ref={stage} className="sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <div ref={frame} className="absolute inset-0 overflow-hidden bg-ink-950" style={{ clipPath: insetFor(REEL_START_SIZE.wide.w, REEL_START_SIZE.wide.h, REEL_START_RADIUS) }}>
          <div ref={media} className="absolute inset-0 will-change-transform">
            {video ? (
              <video
                className="absolute inset-0 size-full object-cover"
                src={video}
                poster={slides[0]?.image}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <ReelSlides slides={slides} sizes="100vw" />
            )}
          </div>
          <div data-reel-shade aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-ink-950/10" />
        </div>

        <div
          aria-hidden
          className="gutter pointer-events-none relative flex w-full items-center justify-between font-display font-medium tracking-[-0.05em] text-white mix-blend-difference text-[clamp(1.8rem,6vw,6.5rem)]"
        >
          <span data-reel-label="left">{play}</span>
          <span data-reel-label="right">{reel}</span>
        </div>

        <p className="text-label absolute bottom-6 start-4 text-white/80 md:start-8">
          {label} — {year}
        </p>
      </div>
    </section>
  );
}
