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

type Shape = { w: number; h: number; radius: number };

/**
 * The frame as a share (w, h) of the screen with corners of `radius`, in transforms alone, which
 * every browser moves on its compositor: the screen-sized box is scaled down to the frame (its
 * corners rounded so they come out at `radius` once scaled) and the media inside scaled back up
 * to cover it, so the picture sits at the showreel's own scale whatever the frame's shape.
 */
const frameStyle = ({ w, h, radius }: Shape) => {
  const k = Math.max(w, h);
  return {
    box: { transform: `scale(${w.toFixed(4)}, ${h.toFixed(4)})`, borderRadius: `${(radius / w).toFixed(2)}px / ${(radius / h).toFixed(2)}px` },
    media: { transform: `scale(${(k / w).toFixed(4)}, ${(k / h).toFixed(4)})` },
  };
};

const opening = frameStyle({ ...REEL_START_SIZE.wide, radius: REEL_START_RADIUS });

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

      const shape = (next: Shape) => {
        const style = frameStyle(next);
        Object.assign(box.style, style.box);
        Object.assign(inner.style, style.media);
      };

      const mm = gsap.matchMedia();
      mm.add(
        {
          phone: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { phone } = context.conditions as { phone: boolean; wide: boolean };
          const start = phone ? REEL_START_SIZE.phone : REEL_START_SIZE.wide;
          const current: Shape = { w: start.w, h: start.h, radius: REEL_START_RADIUS };
          const apply = () => shape(current);
          apply();

          // Hidden until the handoff: until then the positioning frame is the reel. Shown to the end of the page,
          // spelt out: "max" reads as a clamp keyword and falls back to the section's own end.
          const handover = ScrollTrigger.create({
            trigger: section,
            start: "top top",
            end: () => ScrollTrigger.maxScroll(window),
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
            .to(current, { w: 1, h: 1, radius: 0, duration: 1.1, ease: "power2.out" }, 0.1)
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
        shape({ w: 1, h: 1, radius: 0 });
      });

      return () => mm.revert();
    },
    { scope: track },
  );

  return (
    // Pulled up over the positioning section's last screen, where its frame hands over (only when that section animates).
    // Until then it must not come between the pointer and that frame: only the stage, once shown, meets the pointer.
    <section aria-label={label} ref={track} className="pointer-events-none relative h-[200vh] motion-safe:mt-[-100svh]">
      <div ref={stage} className="pointer-events-auto sticky top-0 flex h-svh items-center justify-center overflow-hidden">
        <div ref={frame} className="absolute inset-0 overflow-hidden bg-ink-950 will-change-transform" style={opening.box}>
          <div ref={media} className="absolute inset-0 will-change-transform" style={opening.media}>
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
