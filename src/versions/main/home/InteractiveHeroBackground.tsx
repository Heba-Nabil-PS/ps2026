"use client";

import { gsap } from "@/lib/gsap";
import { useMediaQuery, usePrefersReducedMotion } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { LOGO_PATHS, LOGO_VIEWBOX, viewBoxOf } from "@/shared/brand/logo-paths";
import { getLogoSpine, type SpineStroke } from "@/shared/brand/logo-spine";
import { onIntroReveal } from "@/versions/main/intro/intro-signal";
import { calmBehindPage, scrollMotion } from "@/versions/main/motion/scroll-motion";
import { logoLift, LogoParticleSystem, type PointerState } from "@/versions/main/three/LogoParticleSystem";
import { BACKDROP_FRAGMENT, BACKDROP_VERTEX } from "@/versions/main/three/logo-particles.glsl";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Component, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { BufferAttribute, BufferGeometry, MathUtils, Mesh, PerspectiveCamera, ShaderMaterial, Vector2 } from "three";

/** Narrow lens, so the field has depth without the logo's far side shrinking much as it turns. */
const FIELD_OF_VIEW = 30;
/** Canvas pixels per CSS pixel, at most. FrameGuard lowers it (never below 1) when frames run long. */
const RESOLUTION = { full: 1.75, small: 2, step: 0.25 };

/** True when the browser can give us a hardware WebGL 2 context (three.js needs version 2). */
function supportsWebGL() {
  try {
    const gl = document.createElement("canvas").getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
}

/** The light behind the discs: the page's gradient, brightening where the logo forms. */
function BackdropLight() {
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const light = useRef<{
    uSize: { value: Vector2 };
    uForm: { value: number };
    uCalm: { value: number };
    uPool: { value: Vector2 };
    uTime: { value: number };
    uPage: { value: number };
  } | null>(null);

  useEffect(() => {
    // One triangle that covers the view.
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
    const uniforms = {
      uSize: { value: new Vector2(1, 1) },
      uForm: { value: 0 },
      uCalm: { value: 0 },
      uPool: { value: new Vector2(0.5, 0.5) },
      // Start mid-drift so the first (or only, with reduced motion) frame is already composed.
      uTime: { value: 12 },
      uPage: { value: scrollMotion.page },
    };
    const material = new ShaderMaterial({ vertexShader: BACKDROP_VERTEX, fragmentShader: BACKDROP_FRAGMENT, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
    const mesh = new Mesh(geometry, material);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1;
    scene.add(mesh);
    light.current = uniforms;
    invalidate();
    return () => {
      scene.remove(mesh);
      geometry.dispose();
      material.dispose();
      light.current = null;
    };
  }, [scene, invalidate]);

  useFrame((state, delta) => {
    const u = light.current;
    if (!u) return;
    state.gl.getDrawingBufferSize(u.uSize.value);
    // Clamp the step so a hidden tab does not jump the drift when it returns.
    u.uTime.value += Math.min(delta, 0.05);
    // Eased, so a flick of the wheel glides the glass instead of snapping it.
    u.uPage.value += (scrollMotion.page - u.uPage.value) * 0.08;
    u.uForm.value = scrollMotion.form * (1 - scrollMotion.release);
    u.uCalm.value = calmBehindPage(scrollMotion.page);
    // The pool of light rides with the logo.
    const camera = state.camera as PerspectiveCamera;
    const viewHeight = 2 * Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    u.uPool.value.set(0.5, 0.5 + logoLift(scrollMotion.travel) / viewHeight);
  });

  return null;
}

/**
 * Watches the frame rate. When frames run long for a while it reports it, so the
 * canvas resolution can step down; `severe` means even a modest rate is out of reach.
 */
function FrameGuard({ onSlow }: { onSlow: (severe: boolean) => void }) {
  const watch = useRef({ frames: 0, elapsed: 0, settle: 3 });

  useFrame((_, delta) => {
    const w = watch.current;
    // Let loading and the first frames pass before judging, and again after each change.
    if (w.settle > 0) {
      w.settle -= delta;
      return;
    }
    // A long pause is a hidden tab or a stall, not the frame rate.
    if (delta > 0.25) return;
    w.frames += 1;
    w.elapsed += delta;
    if (w.elapsed < 1.5) return;
    const frameTime = w.elapsed / w.frames;
    w.frames = 0;
    w.elapsed = 0;
    if (frameTime < 1 / 42) return;
    w.settle = 1;
    onSlow(frameTime > 1 / 18);
  });

  return null;
}

class CanvasBoundary extends Component<{ onError: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** A stroke's centre line as SVG path data; a point every few units is plenty. */
function spinePath({ points, count }: SpineStroke) {
  let d = "";
  for (let k = 0; k < count; k += 4) d += `${k ? "L" : "M"}${points[k * 5].toFixed(1)} ${points[k * 5 + 1].toFixed(1)}`;
  return `${d}L${points[(count - 1) * 5].toFixed(1)} ${points[(count - 1) * 5 + 1].toFixed(1)}`;
}

/**
 * Without WebGL: the logo itself, cut into slices across its line (a flat echo of the
 * coiled discs), fading in and out on the same scroll as the particles would. The
 * artwork is masked by dashed strokes along the same centre lines the discs stand on.
 */
function LogoFallback() {
  const logo = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^\w-]/g, "");
  const [lines] = useState(() => {
    const spine = getLogoSpine();
    return { main: spinePath(spine.main), stem: spinePath(spine.stem), inner: spinePath(spine.inner) };
  });
  const box = LOGO_VIEWBOX.mark;
  // The mask strokes are wider than the ribbons, so the region must reach past the artwork.
  const region = { maskUnits: "userSpaceOnUse" as const, x: box.x - 60, y: box.y - 60, width: box.width + 120, height: box.height + 120 };

  useEffect(() => {
    const el = logo.current;
    if (!el) return;
    let shown = -1;
    let moved = -1;
    const tick = () => {
      const visible = scrollMotion.form * (1 - scrollMotion.release);
      if (visible === shown && scrollMotion.travel === moved) return;
      shown = visible;
      moved = scrollMotion.travel;
      el.style.opacity = String(visible * 0.9);
      // The same rise and push-in as the particle logo (about ten scene units fill the screen's height).
      el.style.transform = `translateY(${-logoLift(moved) * 10}vh) scale(${0.92 + moved * 0.18})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <div className="absolute inset-0 grid place-items-center">
      <div ref={logo} className="text-sky-200 opacity-0 will-change-transform">
        <svg viewBox={viewBoxOf(box)} aria-hidden focusable="false" className="h-auto w-[min(86vw,calc(70svh*1.415))]" fill="none">
          <defs>
            <mask id={`${id}-outer`} {...region}>
              <path d={lines.stem} stroke="#fff" strokeWidth={44} strokeDasharray="2.6 3.4" />
              <path d={lines.main} stroke="#fff" strokeWidth={44} strokeDasharray="2.6 3.4" />
            </mask>
            <mask id={`${id}-inner`} {...region}>
              <path d={lines.inner} stroke="#fff" strokeWidth={16} strokeDasharray="1.4 1.8" />
            </mask>
          </defs>
          <path d={LOGO_PATHS.inner} mask={`url(#${id}-inner)`} fill="var(--color-accent)" />
          <path d={LOGO_PATHS.outer} mask={`url(#${id}-outer)`} fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}

/**
 * The home page's living background: the brand's discs floating in depth, which
 * the hero's scroll gathers into the logo and lets go again (LogoParticleSystem),
 * over a backdrop of light. It fills its parent; PageBackdrop fixes it behind the page.
 *
 * Performance: one WebGL canvas, two draw calls. Resolution is capped and steps
 * down if frames run long (FrameGuard); small screens get fewer discs; drawing
 * stops while the tab is hidden. With reduced motion a single still frame is
 * drawn. Without hardware WebGL 2, if the context is lost, or if the device
 * cannot keep up even at the lowest resolution, the sliced SVG logo stands in.
 */
export function InteractiveHeroBackground({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion();
  const small = useMediaQuery("(max-width: 767px)");
  // This component is client-only (see PageBackdrop), so the check can run as it mounts.
  const [webgl, setWebgl] = useState(supportsWebGL);
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  /** Steps taken down from the resolution cap, and how many times in a row the lowest was still too slow. */
  const [lowered, setLowered] = useState(0);
  const struggles = useRef(0);
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });
  const reveal = useRef(0);

  const resolution = Math.max(1, (small ? RESOLUTION.small : RESOLUTION.full) - lowered * RESOLUTION.step);

  // The field gathers into view as the intro opens onto the hero (at once on later visits).
  useEffect(() => {
    if (reduced) return;
    let tween: gsap.core.Tween | undefined;
    const unsubscribe = onIntroReveal(() => {
      tween = gsap.to(reveal, { current: 1, duration: 3, ease: "power2.out" });
    });
    return () => {
      unsubscribe();
      tween?.kill();
    };
  }, [reduced]);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // A mouse (not a finger: touches scroll) leans the scene and nudges nearby discs.
  useEffect(() => {
    if (reduced) return;
    const state = pointer.current;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      state.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.y = 1 - (event.clientY / window.innerHeight) * 2;
      state.active = true;
    };
    const onLeave = () => {
      state.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [reduced]);

  const onSlow = (severe: boolean) => {
    if (resolution > 1) {
      setLowered((steps) => steps + 1);
      return;
    }
    // Already at the lowest resolution: give up only if it stays unusable.
    struggles.current = severe ? struggles.current + 1 : 0;
    if (struggles.current >= 3) setWebgl(false);
  };

  if (!webgl) return <LogoFallback />;

  return (
    <div className={cn("size-full transition-opacity duration-1000 ease-out", ready ? "opacity-100" : "opacity-0", className)}>
      <CanvasBoundary onError={() => setWebgl(false)}>
        <Canvas
          aria-hidden
          flat
          dpr={[1, resolution]}
          frameloop={reduced ? "demand" : hidden ? "never" : "always"}
          gl={{ antialias: false, alpha: false, depth: false, stencil: false, failIfMajorPerformanceCaveat: true }}
          camera={{ fov: FIELD_OF_VIEW, position: [0, 0, 20] }}
          resize={{ scroll: false, debounce: { scroll: 0, resize: 100 } }}
          style={{ pointerEvents: "none" }}
          onCreated={({ gl }) => {
            // A lost context leaves a blank canvas: the still logo takes over.
            gl.domElement.addEventListener("webglcontextlost", () => setWebgl(false), { once: true });
            setReady(true);
          }}
        >
          <BackdropLight />
          <LogoParticleSystem pointer={pointer} reveal={reveal} spacing={small ? 1.6 : 1} still={reduced} />
          {reduced ? null : <FrameGuard onSlow={onSlow} />}
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
