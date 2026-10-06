"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { distortion } from "@/versions/main/portfolio/fx/distortion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { WavePlane } from "./fx/wavePlane";
import { REEL_START_RADIUS, REEL_START_SIZE } from "./reelHandoff";

/** The element's offset inside an ancestor, ignoring transforms (so it can be measured mid-animation). */
function offsetWithin(el: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let top = 0;
  let node: HTMLElement | null = el;
  while (node && node !== ancestor) {
    left += node.offsetLeft;
    top += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { left, top };
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** The slide currently on top of the reel (the one to distort on hover). */
function visibleImage(layer: HTMLElement) {
  const slides = Array.from(layer.querySelectorAll<HTMLElement>("[data-slide]"));
  const shown = slides
    .filter((slide) => parseFloat(getComputedStyle(slide).opacity) > 0.5)
    .sort((a, b) => (parseInt(getComputedStyle(b).zIndex) || 0) - (parseInt(getComputedStyle(a).zIndex) || 0));
  return (shown[0] ?? slides[0] ?? layer).querySelector("img");
}

/**
 * The part of `image` (as u0, v0, u1, v1) seen through a window on a W × H layer that shows
 * it object-fit: cover, scaled by `zoom` about the layer's centre: what the DOM frame shows.
 */
function coverCrop(image: HTMLImageElement, W: number, H: number, ix: number, iy: number, zoom: number): [number, number, number, number] {
  const a = image.naturalWidth / image.naturalHeight;
  const b = W / H;
  const fx = b > a ? 1 : b / a;
  const fy = b > a ? a / b : 1;
  const u = (x: number) => (1 - fx) / 2 + ((W / 2 + (x - W / 2) / zoom) / W) * fx;
  const v = (y: number) => (1 - fy) / 2 + ((H / 2 + (y - H / 2) / zoom) / H) * fy;
  return [u(ix), v(iy), u(W - ix), v(H - iy)];
}

/**
 * The positioning section's scroll stage. The frame starts beside the statement,
 * then, as the page scrolls, it is pulled down into the room left below the
 * columns, drifting to the centre and reshaping until it sits exactly on the
 * showreel's opening frame. The showreel overlaps this section's last screen, so
 * at that moment it takes over from the same pixels: one frame, two sections.
 * While it grows it is drawn as a sheet riding a wave in depth (after lusion.co,
 * fx/wavePlane), flattening back into the frame before the handoff.
 *
 * The media is laid out at the screen's size and shown through a clip, scaled to
 * cover the frame, exactly as the showreel shows it, so the crop never jumps.
 * It enters and answers the pointer like a portfolio card (portfolio/ProjectCard):
 * the window opens from an inset, and on hover the frame is pulled toward the
 * pointer while the image zooms, drifts against it and ripples (fx/distortion).
 * With reduced motion (or without JavaScript) the layout simply stands.
 */
export function PositioningStage({ media, children }: { media: ReactNode; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const nudge = useRef<HTMLDivElement>(null);
  const flyer = useRef<HTMLDivElement>(null);
  const hover = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const screen = useRef<HTMLDivElement>(null);
  const quick = useRef<Record<string, gsap.QuickToFunc>>({});
  const rich = useRichInteractions();

  useGSAP(
    () => {
      if (!rich) return;
      const opts = { duration: 0.9, ease: "power3" };
      quick.current = {
        rootX: gsap.quickTo(nudge.current, "x", opts),
        rootY: gsap.quickTo(nudge.current, "y", opts),
        mediaX: gsap.quickTo(hover.current, "xPercent", opts),
        mediaY: gsap.quickTo(hover.current, "yPercent", opts),
      };
    },
    { scope: root, dependencies: [rich], revertOnUpdate: true },
  );

  const onEnter = (event: PointerEvent) => {
    if (!rich || event.pointerType !== "mouse" || !hover.current) return;
    gsap.to(hover.current, { scale: 1.07, duration: 1.4, ease: "expo.out" });
    distortion?.attach(hover.current, visibleImage(hover.current));
  };

  const onMove = (event: PointerEvent) => {
    const box = flyer.current;
    const layer = hover.current;
    if (!rich || event.pointerType !== "mouse" || !box || !layer) return;
    // The visible window is centred on the screen-sized layer behind the clip; measure from its centre.
    const area = layer.getBoundingClientRect();
    const slot = event.currentTarget as HTMLElement;
    const dx = gsap.utils.clamp(-0.5, 0.5, (event.clientX - (area.left + area.width / 2)) / slot.offsetWidth);
    const dy = gsap.utils.clamp(-0.5, 0.5, (event.clientY - (area.top + area.height / 2)) / slot.offsetHeight);
    const { rootX, rootY, mediaX, mediaY } = quick.current;
    rootX?.(dx * 14);
    rootY?.(dy * 10);
    mediaX?.(-dx * 3);
    mediaY?.(-dy * 3);
    distortion?.move((event.clientX - area.left) / area.width, (event.clientY - area.top) / area.height);
  };

  const onLeave = () => {
    if (!rich) return;
    Object.values(quick.current).forEach((to) => to(0));
    gsap.to(hover.current, { scale: 1, duration: 1.2, ease: "expo.out" });
    distortion?.leave();
  };

  useGSAP(
    () => {
      const section = root.current;
      const slot = frame.current;
      const wrap = nudge.current;
      const box = flyer.current;
      const layer = hover.current;
      const text = copy.current;
      const probe = screen.current;
      const pinned = stage.current;
      if (!section || !slot || !wrap || !box || !layer || !text || !probe || !pinned) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          phone: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { phone } = context.conditions as { phone: boolean; wide: boolean };
          const size = phone ? REEL_START_SIZE.phone : REEL_START_SIZE.wide;
          // Progress of each movement: down, across, reshape; the entrance (rv); the scroll's speed and the wave's phase.
          const state = { y: 0, x: 0, s: 0, rv: 0, speed: 0, phase: 0 };
          // Geometry, in the section's own coordinates. Re-measured on every refresh (resize, fonts, images).
          const geo = { W: 1, H: 1, left: 0, top: 0, cx0: 0, cy0: 0, w0: 1, h0: 1, r0: 0, cx1: 0, cy1: 0, w1: 1, h1: 1 };
          // The frame (and its wave) ride a sticky, screen-sized stage: the browser holds it on screen while the
          // section scrolls, so while the frame is held at the centre it does not move at all. Positioned by script
          // against the page instead, it trailed the scroll by a frame wherever scrolling runs off the main
          // thread (Safari, every touch screen) and shook as it went.
          pinned.appendChild(wrap);
          wrap.style.pointerEvents = "none";
          box.style.pointerEvents = "auto";
          const plane = new WavePlane(pinned);
          let image: HTMLImageElement | null = null;
          let frames = 0;

          box.style.left = "0px";
          box.style.top = "0px";
          box.style.right = "auto";
          box.style.bottom = "auto";
          box.style.borderRadius = "0px";

          const measure = () => {
            geo.W = section.clientWidth;
            geo.H = probe.offsetHeight || window.innerHeight;
            const { left, top } = offsetWithin(slot, section);
            geo.left = left;
            geo.top = top;
            geo.w0 = slot.offsetWidth || 1;
            geo.h0 = slot.offsetHeight || 1;
            geo.cx0 = left + geo.w0 / 2;
            geo.cy0 = top + geo.h0 / 2;
            geo.r0 = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 0;
            // The showreel's opening frame: centred in the section's last screen.
            geo.w1 = geo.W * size.w;
            geo.h1 = geo.H * size.h;
            geo.cx1 = geo.W / 2;
            geo.cy1 = section.offsetHeight - geo.H / 2;
            box.style.width = `${geo.W}px`;
            box.style.height = `${geo.H}px`;
          };

          const apply = () => {
            const cx = lerp(geo.cx0, geo.cx1, state.x);
            const top0 = section.getBoundingClientRect().top;
            // Where the sticky stage sits in the section right now (0 until it sticks): the frame is drawn relative to it.
            const held = pinned.getBoundingClientRect().top - top0;
            // Pulled to the centre of the screen and held there as the page scrolls (the same spot it lands on at the handoff).
            const view = -top0 + geo.H / 2;
            const w = lerp(geo.w0, geo.w1, state.s);
            const h = lerp(geo.h0, geo.h1, state.s);
            // On phones the frame sits under the pillars, so it only ever travels down: its top edge never rises over the copy.
            const cy = phone ? Math.max(lerp(geo.cy0, Math.min(view, geo.cy1), state.y), geo.top + h / 2) : lerp(geo.cy0, Math.min(view, geo.cy1), state.y);
            const r = lerp(geo.r0, REEL_START_RADIUS, state.s);
            // A screen-sized layer, scaled to cover the frame and clipped to it: the showreel's own crop.
            const k = Math.max(w / geo.W, h / geo.H);
            const tx = cx - (k * geo.W) / 2;
            const ty = cy - (k * geo.H) / 2 - held;
            // The entrance, as on the portfolio cards: the frame opens from a smaller, inset window.
            const rs = lerp(0.92, 1, state.rv);
            const vw = w * rs * lerp(0.82, 1, state.rv);
            const vh = h * rs * lerp(0.72, 1, state.rv);
            const ix = Math.max(0, (geo.W - vw / k) / 2);
            const iy = Math.max(0, (geo.H - vh / k) / 2);
            box.style.transform = `translate3d(${tx.toFixed(2)}px, ${ty.toFixed(2)}px, 0) scale(${k.toFixed(5)})`;
            box.style.clipPath = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${(r / k).toFixed(2)}px)`;

            // The wave: strongest halfway through the growth and gone at either end, deeper the faster the scroll.
            const growing = Math.sin(Math.PI * gsap.utils.clamp(0, 1, state.s));
            const amount = growing * (1 + Math.abs(state.speed) * 0.8);
            if (amount > 0.015) {
              if (!image || frames++ % 10 === 0) image = visibleImage(layer);
              const slide = image?.closest<HTMLElement>("[data-slide]");
              const media = layer.querySelector<HTMLElement>("[data-media]");
              const zoom =
                Number(gsap.getProperty(layer, "scale")) * Number(media ? gsap.getProperty(media, "scale") : 1) * Number(slide ? gsap.getProperty(slide, "scale") : 1);
              // A canvas one screen wide and a little over one tall, centred on the frame.
              const top = cy - held - geo.H * 0.65;
              plane.place(0, top, geo.W, Math.round(geo.H * 1.3));
              const drawn =
                image &&
                plane.draw(image, {
                  cx,
                  cy: cy - held - top,
                  w: vw,
                  h: vh,
                  radius: r,
                  crop: coverCrop(image, geo.W, geo.H, ix, iy, zoom || 1),
                  amp: amount * 0.12 * vh,
                  bend: growing * (0.05 + state.speed * 0.06),
                  phase: state.phase,
                });
              if (drawn) {
                layer.style.visibility = "hidden";
                return;
              }
            }
            plane.hide();
            layer.style.visibility = "";
          };

          measure();
          apply();

          // The handoff: the section's bottom one screen below the top, where the showreel's top meets the top of the screen.
          const handoff = () => `bottom ${geo.H}px`;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            onUpdate: apply,
            // No smoothing (Lenis already smooths the scroll), so the frame is exactly in place when the showreel takes over.
            scrollTrigger: {
              trigger: phone ? slot : section,
              start: phone ? "top 85%" : "top 10%",
              endTrigger: section,
              end: handoff,
              scrub: true,
              invalidateOnRefresh: true,
              onRefreshInit: measure,
            },
          });

          // Pulled down quickly to the centre of the screen, then held there until the showreel takes over.
          tl.to(state, { y: 1, duration: 0.6, ease: "power2.out" }, 0)
            // Drifting to the centre and growing early, so it reaches its full size well before it lands.
            .to(state, { x: 1, duration: 0.7, ease: "power2.out" }, 0)
            .to(state, { s: 1, duration: 0.6, ease: "power2.out" }, 0);
          // The statement stays readable while the frame is still beside it, then steps back.
          if (!phone) tl.to(text, { opacity: 0, y: -40, duration: 0.3, ease: "power1.out" }, 0.08);

          // The portfolio card's entrance: the window opens, the frame brightens and the media settles from a zoom.
          const media = box.querySelector<HTMLElement>("[data-media]");
          const reveal = gsap.timeline({ scrollTrigger: { trigger: slot, start: "top 90%", once: true } });
          reveal
            .fromTo(state, { rv: 0 }, { rv: 1, duration: 1.5, ease: "power2.out", onUpdate: apply }, 0)
            .fromTo(wrap, { opacity: 0.3 }, { opacity: 1, duration: 1.5 }, 0);
          if (media) reveal.fromTo(media, { scale: 1.35 }, { scale: 1, duration: 1.8 }, 0);

          // The wave keeps moving while the section is on screen: it travels with the scroll and drifts on its own.
          let lastY = window.scrollY;
          const wave = (_time: number, dt: number) => {
            const y = window.scrollY;
            const moved = y - lastY;
            lastY = y;
            const speed = (moved / Math.max(dt, 1)) * 1000;
            state.speed += (gsap.utils.clamp(-1, 1, speed / 2000) - state.speed) * 0.08;
            state.phase += dt * 0.0012 + moved * 0.006;
            if (state.s > 0 && state.s < 1) apply();
          };
          const waving = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? gsap.ticker.add(wave) : gsap.ticker.remove(wave)),
          });

          // Once the showreel holds the frame, this copy steps out (it would otherwise scroll away from under it).
          const handover = ScrollTrigger.create({
            trigger: section,
            start: handoff,
            end: "max",
            onToggle: (self) => gsap.set(box, { autoAlpha: self.isActive ? 0 : 1 }),
          });

          return () => {
            gsap.ticker.remove(wave);
            waving.kill();
            handover.kill();
            plane.destroy();
            layer.style.visibility = "";
            slot.appendChild(wrap);
            wrap.style.removeProperty("pointer-events");
            box.style.removeProperty("pointer-events");
            gsap.set(wrap, { clearProps: "opacity" });
            gsap.set(box, { clearProps: "visibility,opacity" });
            ["transform", "clipPath", "width", "height", "left", "top", "right", "bottom", "borderRadius"].forEach((prop) =>
              box.style.removeProperty(prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)),
            );
          };
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="section-y relative isolate overflow-x-clip">
      {/* Measures one screen (svh), the showreel stage's height. */}
      <div ref={screen} aria-hidden className="pointer-events-none invisible absolute top-0 h-svh w-0" />

      <div className="gutter">
        <div className="grid gap-12 md:grid-cols-12 md:gap-8">
          {/* On phones the statement comes first, so the frame below it has somewhere to travel. */}
          <div
            ref={frame}
            className="relative z-[2] order-last aspect-[4/5] rounded-card md:order-none md:col-span-5 md:aspect-auto md:min-h-[24rem]"
            onPointerEnter={onEnter}
            onPointerMove={onMove}
            onPointerLeave={onLeave}
          >
            {/* While the scroll drives it, this moves onto the sticky stage below (it is laid out here without motion). */}
            <div ref={nudge} className="absolute inset-0">
              <div ref={flyer} className="absolute inset-0 origin-top-left overflow-hidden rounded-card will-change-transform">
                <div ref={hover} className="absolute inset-0 will-change-transform">
                  {media}
                </div>
              </div>
            </div>
          </div>
          <div ref={copy} className="relative z-[1] flex flex-col md:col-span-6 md:col-start-7">
            {children}
          </div>
        </div>
      </div>

      {/* One screen, held by the browser from the moment the section reaches the top until the handoff. */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div ref={stage} className="sticky top-0 h-svh" />
      </div>

      {/* The room the frame is pulled down into. */}
      <div aria-hidden className="h-[40svh] md:h-[60svh] lg:h-[70svh] motion-reduce:hidden" />
    </section>
  );
}
