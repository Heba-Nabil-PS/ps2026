"use client";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useRichInteractions } from "@/lib/hooks";
import { distortion } from "@/versions/main/portfolio/fx/distortion";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { WavePlane, type WaveLayer } from "./fx/wavePlane";
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

/**
 * The slides on top of the reel right now: the one showing and, mid-crossfade, the one coming
 * in over it (`mix` of the way in). ReelSlides writes their opacity and stacking inline, so
 * this reads no computed style.
 */
function topSlides(layer: HTMLElement) {
  const slides = Array.from(layer.querySelectorAll<HTMLElement>("[data-slide]"), (el, index) => ({
    el,
    index,
    opacity: el.style.opacity === "" ? 1 : parseFloat(el.style.opacity) || 0,
    z: parseInt(el.style.zIndex) || 0,
  }))
    .filter((slide) => slide.opacity > 0.001)
    .sort((a, b) => b.z - a.z || b.index - a.index);
  const [top, beneath] = slides;
  if (!top) return null;
  if (top.opacity >= 0.999 || !beneath) return { under: top.el, over: null, mix: 0 };
  return { under: beneath.el, over: top.el, mix: top.opacity };
}

/** The slide on top of the reel (the one to distort on hover). */
function visibleImage(layer: HTMLElement) {
  const slides = topSlides(layer);
  return (slides?.over ?? slides?.under ?? layer).querySelector("img");
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
 * The positioning section's scroll stage. The frame starts beside the statement and rides
 * up with the page until its centre reaches the centre of the screen, where it is held while,
 * as the page scrolls on, it drifts to the middle and reshapes until it sits exactly on the
 * showreel's opening frame. The showreel overlaps this section's last screen, so at that
 * moment it takes over from the same pixels: one frame, two sections. While it grows it is
 * drawn as a sheet riding a wave in depth (after lusion.co, fx/wavePlane), flattening back
 * into the frame before the handoff.
 *
 * The hold is the browser's own: the frame rides a sticky holder the size of the showreel's
 * opening frame, laid over its slot, which the compositor carries and pins. Nothing here is
 * placed against the scroll position by script (that trailed the scroll by a frame wherever
 * scrolling runs off the main thread, Safari and every touch screen, and shook as it went):
 * the drift, the growth and the wave are shaped only by how far the section has scrolled.
 *
 * The media is laid out at the screen's size and shown through a clip, scaled to cover the
 * frame, exactly as the showreel shows it, so the crop never jumps. It enters and answers the
 * pointer like a portfolio card (portfolio/ProjectCard): the window opens from an inset, and
 * on hover the frame is pulled toward the pointer while the image zooms, drifts against it
 * and ripples (fx/distortion). With reduced motion (or without JavaScript) the layout simply stands.
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
      const holder = stage.current;
      if (!section || !slot || !wrap || !box || !layer || !text || !probe || !holder) return;

      const mm = gsap.matchMedia();
      mm.add(
        {
          phone: "(max-width: 767.98px) and (prefers-reduced-motion: no-preference)",
          wide: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const { phone } = context.conditions as { phone: boolean; wide: boolean };
          const size = phone ? REEL_START_SIZE.phone : REEL_START_SIZE.wide;
          // Progress of the drift across (x), the reshape (s) and, on phones, the settle to the centre afterwards;
          // the entrance (rv); the scroll's speed and the wave's phase.
          const state = { x: 0, s: 0, settle: 0, rv: 0, speed: 0, phase: 0 };
          // Geometry, in the section's own px. Re-measured on every refresh (resize, fonts, images).
          const geo = { W: 1, H: 1, cw: 1, ch: 1, w0: 1, h0: 1, r0: 0, cx0: 0, cy0: 0, w1: 1, h1: 1 };

          // The frame moves onto the holder: laid over its slot, carried up with the page and held by the browser
          // the moment its centre reaches the centre of the screen. Script only shapes what is inside it.
          holder.appendChild(wrap);
          wrap.style.pointerEvents = "none";
          box.style.pointerEvents = "auto";
          Object.assign(box.style, { right: "auto", bottom: "auto", borderRadius: "0px" });
          // The wave's WebGL (a context, its shaders, every slide decoded and uploaded) is set up only once the section
          // is within a screen of view, off the page's loading path: until then the DOM frame stands on its own, as
          // it does without WebGL. Set up a screen early, the slides are ready before the wave can start.
          let plane: WavePlane | null = null;
          const placement = { left: 0, top: 0, width: 1, height: 1, focal: 1 };
          const wake = () => {
            if (plane) return;
            plane = new WavePlane(wrap);
            plane.place(placement.left, placement.top, placement.width, placement.height, placement.focal);
            // Every slide decoded and uploaded now, in the background, so the wave never waits on one.
            plane.prepare(layer.querySelectorAll("img"));
          };
          const slideshow = box.querySelector<HTMLElement>("[data-media]");

          const measure = () => {
            geo.W = section.clientWidth;
            geo.H = probe.offsetHeight || window.innerHeight;
            const { left, top } = offsetWithin(slot, section);
            geo.w0 = slot.offsetWidth || 1;
            geo.h0 = slot.offsetHeight || 1;
            geo.cx0 = left + geo.w0 / 2;
            geo.cy0 = top + geo.h0 / 2;
            geo.r0 = parseFloat(getComputedStyle(slot).borderTopLeftRadius) || 0;
            // The showreel's opening frame, which the holder is the size of.
            geo.w1 = geo.W * size.w;
            geo.h1 = geo.H * size.h;
            // Centred on the slot to begin with; stuck once its centre is the screen's.
            Object.assign(holder.style, {
              width: `${geo.w1}px`,
              height: `${geo.h1}px`,
              top: `${(geo.H - geo.h1) / 2}px`,
              marginLeft: `${geo.cx0 - geo.w1 / 2}px`,
              marginTop: `${geo.cy0 - geo.h1 / 2}px`,
            });
            // A screen-sized layer centred in it, scaled to cover the frame and clipped to it: the showreel's own crop.
            Object.assign(box.style, {
              width: `${geo.W}px`,
              height: `${geo.H}px`,
              left: `${(geo.w1 - geo.W) / 2}px`,
              top: `${(geo.h1 - geo.H) / 2}px`,
            });
            // The wave's canvas, centred on the frame: the grown frame with room for the deepest wave and bend
            // (up to 0.22 and 0.11 of its height, seen from 2.8 heights away: 8% wider at most, and the bend below).
            geo.cw = Math.round(geo.w1 * 1.1 + 12);
            geo.ch = Math.round(geo.h1 * 1.34 + 12);
            Object.assign(placement, { left: (geo.w1 - geo.cw) / 2, top: (geo.h1 - geo.ch) / 2, width: geo.cw, height: geo.ch, focal: geo.H * 1.82 });
            plane?.place(placement.left, placement.top, placement.width, placement.height, placement.focal);
          };

          /** What the DOM frame shows of `slide`, for the wave to draw; null until its picture is uploaded. */
          const layerFor = (slide: HTMLElement, ix: number, iy: number): WaveLayer | null => {
            const image = slide.querySelector("img");
            if (!image || !plane?.ready(image)) return null;
            const zoom =
              Number(gsap.getProperty(layer, "scale")) *
              Number(slideshow ? gsap.getProperty(slideshow, "scale") : 1) *
              Number(gsap.getProperty(slide, "scale"));
            return { image, crop: coverCrop(image, geo.W, geo.H, ix, iy, zoom || 1) };
          };

          let applied = false;
          let waved = false;
          const written = { drift: "", transform: "", clip: "", w: 0, h: 0, ix: 0, iy: 0 };
          const apply = () => {
            applied = true;
            const w = lerp(geo.w0, geo.w1, state.s);
            const h = lerp(geo.h0, geo.h1, state.s);
            const r = lerp(geo.r0, REEL_START_RADIUS, state.s);
            // The layer scaled to cover the frame; the window on it, in layer px, inset from its edges.
            const k = Math.max(w / geo.W, h / geo.H);
            // The entrance, as on the portfolio cards: the frame opens from a smaller, inset window.
            const rs = lerp(0.92, 1, state.rv);
            const vw = w * rs * lerp(0.82, 1, state.rv);
            const vh = h * rs * lerp(0.72, 1, state.rv);
            const ix = Math.max(0, (geo.W - vw / k) / 2);
            const iy = Math.max(0, (geo.H - vh / k) / 2);
            // The drift across to the middle of the screen. On phones the frame sits under the pillars, so it grows from its
            // top edge (never rising over the copy) and only settles onto the centre once it is held there.
            const dx = lerp(0, geo.W / 2 - geo.cx0, state.x);
            const dy = phone ? (Math.max(0, h - geo.h0) / 2) * (1 - state.settle) : 0;
            const drift = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
            if (drift !== written.drift) holder.style.transform = written.drift = drift;

            // The wave: strongest halfway through the growth and gone at either end, deeper the faster the scroll.
            // Whether it shows depends on the scroll alone, so it never flickers on and off at the edges.
            const growing = Math.sin(Math.PI * gsap.utils.clamp(0, 1, state.s));
            let drawn = false;
            if (state.s > 0.002 && state.s < 0.998) {
              const slides = topSlides(layer);
              const under = slides && layerFor(slides.under, ix, iy);
              const amount = growing * (1 + Math.abs(state.speed) * 0.8);
              drawn =
                !!under &&
                !!plane &&
                plane.draw({
                  cx: geo.cw / 2,
                  cy: geo.ch / 2,
                  w: vw,
                  h: vh,
                  radius: r,
                  amp: amount * 0.12 * vh,
                  bend: growing * (0.05 + state.speed * 0.06),
                  phase: state.phase,
                  under,
                  over: slides.over && layerFor(slides.over, ix, iy),
                  mix: slides.mix,
                });
            }
            if (drawn !== waved) {
              waved = drawn;
              if (!drawn) plane?.hide();
              // All but faded out, never hidden: the slides stay drawn (and so kept rendered) behind the wave, so the swap
              // back costs nothing. Hidden, their layers were dropped and rendered afresh on the swap back, a long frame each time.
              layer.style.opacity = drawn ? "0.001" : "";
            }

            // The DOM frame is kept in step even while the wave stands in for it: it is what the pointer meets. While the wave
            // stands in it need only be near enough, so it is written every few px rather than every frame (its clip is
            // re-rendered on every change in some browsers); the moment the wave goes it is exact again.
            const near = drawn && Math.abs(w - written.w) < 4 && Math.abs(h - written.h) < 4 && Math.abs(ix - written.ix) < 4 && Math.abs(iy - written.iy) < 4;
            if (near) return;
            Object.assign(written, { w, h, ix, iy });
            const transform = `scale(${k.toFixed(5)})`;
            if (transform !== written.transform) box.style.transform = written.transform = transform;
            const clip = `inset(${iy.toFixed(2)}px ${ix.toFixed(2)}px round ${(r / k).toFixed(2)}px)`;
            if (clip !== written.clip) box.style.clipPath = written.clip = clip;
          };

          measure();
          apply();

          // The wave wakes as the frame nears the screen (a third of a screen before it shows, well before it can
          // grow) and stays awake while the section is anywhere near. Not sooner: on a phone the section starts
          // within a screen of the top, and waking at load put the WebGL setup back on the loading path.
          const waking = ScrollTrigger.create({
            trigger: slot,
            start: "top 130%",
            endTrigger: section,
            end: "bottom -50%",
            onToggle: (self) => {
              if (self.isActive) wake();
            },
          });
          if (waking.isActive) wake();

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

          // Drifting to the middle and growing early, so it reaches its full size well before the handoff.
          tl.to(state, { x: 1, duration: 0.7, ease: "power2.out" }, 0).to(state, { s: 1, duration: 0.6, ease: "power2.out" }, 0);
          // The statement stays readable while the frame is still beside it, then steps back.
          if (!phone) tl.to(text, { opacity: 0, y: -40, duration: 0.3, ease: "power1.out" }, 0.08);
          // Grown, the frame eases up onto the centre of the screen, where the showreel expects it.
          if (phone) tl.to(state, { settle: 1, duration: 0.3, ease: "power2.inOut" }, 0.6);

          // The portfolio card's entrance: the window opens, the frame brightens and the media settles from a zoom.
          const reveal = gsap.timeline({ scrollTrigger: { trigger: slot, start: "top 90%", once: true } });
          reveal
            .fromTo(state, { rv: 0 }, { rv: 1, duration: 1.5, ease: "power2.out", onUpdate: apply }, 0)
            .fromTo(wrap, { opacity: 0.3 }, { opacity: 1, duration: 1.5 }, 0);
          if (slideshow) reveal.fromTo(slideshow, { scale: 1.35 }, { scale: 1, duration: 1.8 }, 0);

          // The wave keeps moving while the section is on screen: it travels with the scroll and drifts on its own.
          let lastY = window.scrollY;
          const wave = (_time: number, dt: number) => {
            const y = window.scrollY;
            const moved = y - lastY;
            lastY = y;
            // The scroll's speed (a share of 2000 px/s), settled over about 160 ms whatever the frame rate, so a
            // scroll that lands in uneven steps (a wheel, a finger) rocks the sheet instead of jolting it.
            const target = gsap.utils.clamp(-1, 1, (moved / Math.max(dt, 1)) * 0.5);
            state.speed += (target - state.speed) * (1 - Math.exp(-dt / 160));
            state.phase += dt * 0.0012 + state.speed * dt * 0.012;
            // Once a frame: the scroll has usually drawn it already this tick.
            if (state.s > 0 && state.s < 1 && !applied) apply();
            applied = false;
          };
          const waving = ScrollTrigger.create({
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            onToggle: (self) => (self.isActive ? gsap.ticker.add(wave) : gsap.ticker.remove(wave)),
          });

          // Once the showreel holds the frame, this copy steps out (it would otherwise scroll away from under it).
          // To the end of the page, spelt out: "max" reads as a clamp keyword and falls back to the section's own end.
          const handover = ScrollTrigger.create({
            trigger: section,
            start: handoff,
            end: () => ScrollTrigger.maxScroll(window),
            onToggle: (self) => gsap.set(box, { autoAlpha: self.isActive ? 0 : 1 }),
          });

          return () => {
            gsap.ticker.remove(wave);
            waving.kill();
            waking.kill();
            handover.kill();
            plane?.destroy();
            layer.style.opacity = "";
            slot.appendChild(wrap);
            wrap.style.removeProperty("pointer-events");
            box.style.removeProperty("pointer-events");
            gsap.set(wrap, { clearProps: "opacity" });
            gsap.set(box, { clearProps: "visibility,opacity" });
            for (const prop of ["transform", "clip-path", "width", "height", "left", "top", "right", "bottom", "border-radius"]) box.style.removeProperty(prop);
            for (const prop of ["transform", "width", "height", "top", "margin-left", "margin-top"]) holder.style.removeProperty(prop);
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
            {/* While the scroll drives it, this moves onto the holder below (it is laid out here without motion). */}
            <div ref={nudge} className="absolute inset-0">
              <div ref={flyer} className="absolute inset-0 overflow-hidden rounded-card will-change-transform">
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

      {/* The rail the frame's holder rides: laid over the slot, carried up with the page and held at the centre of the screen until the handoff. */}
      <div className="pointer-events-none absolute inset-0 z-[2]">
        <div ref={stage} className="sticky will-change-transform" />
      </div>

      {/* The room the frame is pulled down into. */}
      <div aria-hidden className="h-[40svh] md:h-[60svh] lg:h-[70svh] motion-reduce:hidden" />
    </section>
  );
}
