"use client";

import { clientMarks } from "@/data/client-marks";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { motionGate, showNow } from "@/versions/main/motion/useMotionGate";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";
import { useRef, type CSSProperties } from "react";

export type ClientLogo = { name: string; file: string };

/**
 * Depth planes, far → near. Every mark is the same size and brightness on every plane, so
 * the wall reads as one even set; depth comes only from nearer lanes drifting faster and
 * answering the scroll more. Distances are px for a 100px mark and scale with the mark size.
 */
const PLANES = [
  { speed: 9, travel: 70, lift: 16 },
  { speed: 15, travel: 130, lift: 36 },
  { speed: 23, travel: 210, lift: 62 },
] as const;
/** Resting brightness of every mark. */
const REST = 0.86;
/** Slot per mark in mark sizes: the widest mark (weight 2.3) plus the gap to its neighbour. */
const SLOT = 3;
/** The plane of each lane, top to bottom, so neighbouring lanes never share a depth. */
const LANE_PLANES = [1, 2, 0, 2] as const;

/** The motion states a mark moves between. */
const MOTION = {
  /** Waiting out of view: sunk and unseen. (No blur: filters on moving marks repaint every frame.) */
  hidden: { autoAlpha: 0, y: 48, scale: 0.94 },
  /** Entrance: each mark rises into view, one after the other. */
  reveal: { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: "expo.out", stagger: 0.08 },
  /** Exit: the marks dissolve towards the edge the section leaves by. */
  conceal: { autoAlpha: 0, y: 32, duration: 0.7, ease: "power2.inOut", stagger: 0.02 },
  /** Hover: the chosen mark grows and goes full white, the rest fall back, the drift all but holds. */
  hover: { scale: 1.1, dim: 0.45, hold: 0.06 },
  /** How much a resting mark's brightness swells and fades. */
  breath: 0.1,
} as const;

/** Lane pitch in mark sizes (matches .client-field's height) and the clear band kept above and below the lanes. */
const PITCH = 1.7;
const EDGE = 0.35;

/** Equal optical weight: wide wordmarks and tall emblems cover a similar area. */
const weight = ({ width, height }: { width: number; height: number }) => Math.round(Math.min(2.3, Math.max(0.72, Math.sqrt(width / height))) * 1000) / 1000;

/** Repeatable noise in 0–1, so every mark keeps its own place and rhythm between visits. */
const noise = (index: number, salt: number) => {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

const wrap = (value: number, length: number) => ((value % length) + length) % length;

type Plane = (typeof PLANES)[number];
type Lane = { plane: Plane; direction: 1 | -1; length: number; pad: number; spacing: number; offset: number };
type Mark = { el: HTMLElement; lane: Lane; base: number; top: number; phase: number; rate: number; x: number; opacity: number; scale: number };

/**
 * Clients as floating brand marks: no cells, no frames. White marks drift on three
 * depth lanes in alternating directions and feather out at the edges.
 *
 * - Entrance: once the field scrolls into view each mark rises out of a blur, one by
 *   one across the screen; scrolling away dissolves them, scrolling back resolves them.
 * - Always: every mark bobs and breathes at its own rhythm.
 * - Scroll: nearer lanes travel further than far ones as the section passes (parallax).
 * - Hover: the mark under the pointer brightens, grows, glows and catches a sweep of
 *   light while the others fall back and the drift holds.
 *
 * One ticker writes a transform and an opacity per mark, and only while the field is on
 * screen. With reduced motion or without JS the marks sit as a still, centred cluster.
 */
export function ClientLogoSection({ label, title, intro, clients, row }: { label?: string; title?: readonly string[]; intro?: string; clients: readonly ClientLogo[]; /** A single lane, for tucking under a hero. */ row?: boolean }) {
  const field = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const root = field.current;
      if (!root) return;
      const els = Array.from(root.querySelectorAll<HTMLElement>("[data-mark]"));
      const layers = els.map((el) => el.firstElementChild as HTMLElement);

      return motionGate(
        () => {
          let lanes: Lane[] = [];
          let marks: Mark[] = [];
          let unit = 1;
          let focus: Mark | null = null;
          let hold = 1;
          let last = 0;
          const scroll = { progress: 0 };

          /** Deals the marks onto lanes and spaces each lane to loop wider than the field. */
          const layout = () => {
            const laneCount = Math.max(1, Math.round(Number(getComputedStyle(root).getPropertyValue("--lanes"))) || 3);
            // `--slot` on the field overrides the default slot, for a tighter single row.
            const slotSize = Number(getComputedStyle(root).getPropertyValue("--slot")) || SLOT;
            // `--edge` overrides the clear band, for a single row that hugs its marks.
            const edgeValue = getComputedStyle(root).getPropertyValue("--edge").trim();
            const edge = edgeValue ? Number(edgeValue) : EDGE;
            const pitch = root.clientHeight / (laneCount + edge * 2);
            const offsets = new Map(lanes.map((lane, index) => [index, lane.offset / lane.length]));
            unit = pitch / PITCH / 100;
            const slot = pitch / PITCH * slotSize;
            const counts = Array.from({ length: laneCount }, (_, index) => Math.ceil((els.length - index) / laneCount));
            // Every lane is split into equal slots and is at least one field plus a slot long, so a mark only wraps out of sight.
            lanes = Array.from({ length: laneCount }, (_, index) => {
              const length = Math.max(counts[index] * slot, root.clientWidth + slot * 1.5);
              return {
                plane: PLANES[LANE_PLANES[index % LANE_PLANES.length]],
                direction: index % 2 ? -1 : 1,
                length,
                pad: slot,
                spacing: length / counts[index],
                offset: (offsets.get(index) ?? noise(index, 5)) * length,
              };
            });

            marks = els.map((el, index) => {
              const laneIndex = index % laneCount;
              const lane = lanes[laneIndex];
              const previous = marks[index];
              return {
                el,
                lane,
                // Centred in its slot, and on its lane's centre line, so every mark lines up with its neighbours.
                base: Math.floor(index / laneCount) * lane.spacing + (lane.spacing - el.offsetWidth) / 2,
                top: (edge + laneIndex + 0.5) * pitch - el.offsetHeight / 2,
                phase: noise(index, 3) * Math.PI * 2,
                rate: 0.34 + noise(index, 4) * 0.3,
                x: 0,
                opacity: previous?.opacity ?? REST,
                scale: previous?.scale ?? 1,
              };
            });
            frame(last);
          };

          const frame = (time: number) => {
            const delta = Math.min(Math.max(time - last, 0), 0.05);
            last = time;
            const ease = 1 - Math.exp(-delta * 6);
            hold += ((focus ? MOTION.hover.hold : 1) - hold) * ease;
            for (const lane of lanes) lane.offset += lane.direction * lane.plane.speed * unit * hold * delta;

            const passed = scroll.progress - 0.5;
            for (const mark of marks) {
              const { lane } = mark;
              const { plane } = lane;
              const swing = time * mark.rate + mark.phase;
              mark.x = wrap(mark.base + lane.offset + lane.direction * plane.travel * unit * passed, lane.length) - lane.pad;
              // A single row stays level; stacked lanes answer the scroll, a whole lane at a time so its marks stay in line.
              const y = lanes.length === 1 ? mark.top : mark.top - passed * plane.lift * unit;

              const resting = REST * (1 - MOTION.breath * (0.5 + 0.5 * Math.sin(swing * 1.3 + mark.phase)));
              const opacity = !focus ? resting : focus === mark ? 1 : REST * MOTION.hover.dim;
              mark.opacity += (opacity - mark.opacity) * ease;
              mark.scale += ((focus === mark ? MOTION.hover.scale : 1) - mark.scale) * ease;

              mark.el.style.transform = `translate3d(${mark.x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${mark.scale.toFixed(4)})`;
              mark.el.style.opacity = mark.opacity.toFixed(3);
            }
          };

          /** One by one in reading order, from wherever the drift has carried them. */
          const inOrder = () => {
            const rtl = getComputedStyle(root).direction === "rtl";
            return [...marks].sort((a, b) => (rtl ? b.x - a.x : a.x - b.x)).map((mark) => mark.el.firstElementChild);
          };
          const reveal = () => {
            gsap.to(inOrder(), { ...MOTION.reveal, overwrite: true });
          };
          const conceal = (direction: 1 | -1) => {
            gsap.to(inOrder(), { ...MOTION.conceal, y: MOTION.conceal.y * direction, overwrite: true });
          };

          const setFocus = (mark: Mark | null) => {
            if (mark === focus) return;
            focus?.el.removeAttribute("data-active");
            mark?.el.setAttribute("data-active", "");
            focus = mark;
          };
          const onOver = (event: PointerEvent) => {
            if (event.pointerType !== "mouse") return;
            const el = (event.target as Element).closest("[data-mark]");
            setFocus(marks.find((mark) => mark.el === el) ?? null);
          };
          const onLeave = () => setFocus(null);

          // Claims the stage layout even if the page's `.js` flag was dropped before the app started.
          root.setAttribute("data-live", "");
          gsap.set(root, { autoAlpha: 1 });
          gsap.set(layers, MOTION.hidden);
          layout();

          const resize = new ResizeObserver(layout);
          resize.observe(root);
          root.addEventListener("pointerover", onOver);
          root.addEventListener("pointerleave", onLeave);

          // The whole pass through the viewport: scrubs the parallax and runs the ticker only while the field is on screen.
          const pass = gsap.to(scroll, {
            progress: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.9,
              onToggle: (self) => (self.isActive ? gsap.ticker.add(frame) : gsap.ticker.remove(frame)),
            },
          });
          if (pass.scrollTrigger?.isActive) gsap.ticker.add(frame);
          ScrollTrigger.create({
            trigger: root,
            start: "top 82%",
            end: "bottom 18%",
            onEnter: reveal,
            onEnterBack: reveal,
            onLeave: () => conceal(-1),
            onLeaveBack: () => conceal(1),
          });

          return () => {
            gsap.ticker.remove(frame);
            resize.disconnect();
            root.removeEventListener("pointerover", onOver);
            root.removeEventListener("pointerleave", onLeave);
            setFocus(null);
            root.removeAttribute("data-live");
            els.forEach((el) => {
              el.style.transform = "";
              el.style.opacity = "";
            });
          };
        },
        () => {
          showNow(root);
          showNow(layers);
        },
      );
    },
    { scope: field, dependencies: [clients] },
  );

  return (
    <section data-thread-hidden data-thread-faint={row || undefined} className={row ? "mt-4 md:mt-6" : "section-y"}>
      {label && title ? <SectionHead className="gutter" label={label} title={title} intro={intro} /> : null}
      <ul ref={field} data-reveal className={row ? "client-field client-field-row" : "client-field mt-12 md:mt-16"}>
        {clients.map((client) => {
          const size = clientMarks[client.file];
          if (!size) return null;
          const src = `/images/clients/marks/${client.file}.webp`;
          return (
            <li
              key={client.file}
              data-mark
              className="client-mark"
              style={{ "--w": weight(size), "--mark-src": `url(${src})`, aspectRatio: `${size.width} / ${size.height}` } as CSSProperties}
            >
              <div className="client-mark-body">
                {/* Served as is: the same file masks the shimmer, so the browser fetches it once. */}
                <Image src={src} alt={client.name} width={size.width} height={size.height} unoptimized draggable={false} />
                <span aria-hidden className="client-mark-shine" />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
