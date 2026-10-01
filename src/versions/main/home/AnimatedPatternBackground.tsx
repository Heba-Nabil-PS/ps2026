"use client";

import { cn } from "@/lib/utils";
import { scrollMotion } from "@/versions/main/motion/scroll-motion";
import { useEffect, useRef, useState } from "react";

/** Rib width of the glass, in CSS pixels, before it is fitted to the viewport. */
const RIB = 34;

const VERTEX = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`;

// The scene (a glossy sphere and two thin light arcs on navy) is drawn as a function,
// then sampled through vertical cylindrical ribs: each rib shows a flipped, widened
// slice of what is behind it, which gives the reeded-glass stripes.
//
// Scroll: the glass is fixed to the viewport, the sphere wanders through the page
// (uPage, in viewport heights), and the arcs drift at a different rate, so scrolling
// feels like moving through the scene. A fast scroll (uVel) tilts it a little, like
// a camera swinging.
const FRAGMENT = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPage;
uniform float uVel;
uniform float uRib;

const vec3 INK_DEEP = vec3(0.039, 0.102, 0.180); // --color-ink-950
const vec3 INK = vec3(0.027, 0.071, 0.122);      // --color-ink-900
const vec3 NAVY = vec3(0.129, 0.259, 0.416);     // --color-navy-500
const vec3 SKY = vec3(0.549, 0.769, 0.902);      // --color-sky
const vec3 SKY_SOFT = vec3(0.765, 0.882, 0.953); // --color-sky-200

float arc(vec2 p, vec2 centre, float radius, float width) {
  float d = abs(length(p - centre) - radius);
  return smoothstep(width, 0.0, d) * 0.9 + exp(-d * 55.0) * 0.28;
}

vec3 scene(vec2 frag) {
  vec2 p = (frag - 0.5 * uRes) / uRes.y;
  float t = uTime;
  float aspect = uRes.x / uRes.y;

  // A fast scroll tilts the scene a little.
  p.x += p.y * uVel * 0.08;

  vec3 col = mix(INK_DEEP, INK, smoothstep(-0.6, 0.6, p.y));

  // The sphere drifts on a slow Lissajous path, leans towards the pointer, and wanders
  // through the page as it scrolls: right in the hero, left further down.
  vec2 c = vec2(
    aspect * (0.2 - 0.4 * sin(uPage * 0.55)) + 0.07 * sin(t * 0.21) + uPointer.x * 0.06,
    0.06 + 0.22 * sin(uPage * 0.9) + 0.06 * cos(t * 0.17) - uPointer.y * 0.05
  );
  float r = 0.36 + 0.015 * sin(t * 0.33);
  vec2 d = (p - c) / r;
  float dd = dot(d, d);
  col += NAVY * 0.45 * exp(-max(sqrt(dd) - 1.0, 0.0) * 3.5);

  if (dd < 1.0) {
    vec3 n = vec3(d, sqrt(1.0 - dd));
    vec3 light = normalize(vec3(-0.55 + 0.35 * sin(t * 0.27), 0.65, 0.55));
    float diffuse = max(dot(n, light), 0.0);
    float spec = pow(max(dot(reflect(-light, n), vec3(0.0, 0.0, 1.0)), 0.0), 22.0);
    float rim = pow(1.0 - n.z, 3.0);
    vec3 s = mix(INK_DEEP, NAVY, diffuse * 0.95);
    s += SKY * rim * 0.55 + SKY_SOFT * spec * 0.75;
    col = mix(col, s, smoothstep(1.0, 0.975, dd));
  }

  // Two thin arcs of very large circles sweep slowly across the field, and drift with
  // the scroll at a different rate than the sphere, which gives the depth.
  vec2 a1 = vec2(aspect * 0.62 + 0.04 * sin(t * 0.11) - 0.25 * sin(uPage * 0.5), -0.95 + 0.05 * sin(t * 0.13) + 0.35 * sin(uPage * 0.7));
  vec2 a2 = vec2(-aspect * 0.2 + 0.2 * sin(uPage * 0.45), 1.45 + 0.05 * cos(t * 0.09) - 0.3 * sin(uPage * 0.6));
  col += SKY * arc(p, a1, 1.08 + 0.04 * sin(t * 0.19), 0.0035) * 0.7;
  col += SKY * arc(p, a2, 1.4 + 0.05 * cos(t * 0.15), 0.0025) * 0.35;
  return col;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  float fx = frag.x / uRib;
  float f = fract(fx) - 0.5;

  // Each rib is a small cylinder lens: flipped and widened, bowed slightly vertically,
  // with a touch of colour split between channels as real glass has.
  float centre = (floor(fx) + 0.5) * uRib;
  float bow = f * f * uRib * 0.9;
  vec2 base = vec2(centre, frag.y + bow);
  vec3 col;
  col.r = scene(base + vec2(f * uRib * -1.72, 0.0)).r;
  col.g = scene(base + vec2(f * uRib * -1.8, 0.0)).g;
  col.b = scene(base + vec2(f * uRib * -1.88, 0.0)).b;

  // Rib shading: a darker seam where ribs meet and a thin highlight on one flank.
  float seam = smoothstep(0.36, 0.5, abs(f));
  col *= 1.0 - seam * 0.35;
  col += SKY * smoothstep(0.3, 0.46, f) * (1.0 - smoothstep(0.46, 0.5, f)) * 0.045;

  // A little quieter behind the sections after the hero, then grain against banding.
  col = mix(col, INK_DEEP, 0.45 * smoothstep(0.4, 1.2, uPage));
  col += (hash(frag + fract(uTime) * 91.7) - 0.5) * 0.018;
  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/**
 * The home page's living background: a glossy sphere and two thin light arcs
 * behind vertical fluted glass, fixed to the viewport so the sections scroll
 * over it. Scrolling carries the visitor through the scene (see
 * ScrollAnimationController and `scrollMotion`): the sphere wanders through the
 * page, the arcs drift at a different rate, and a fast scroll tilts the scene.
 *
 * WebGL on one full-screen triangle, no dependencies. Capped device pixel ratio
 * (lower on phones), paused while off screen or while the tab is hidden, drawn
 * once (still) when the visitor prefers reduced motion. Without WebGL nothing
 * draws and the page's CSS gradient remains.
 */
export function AnimatedPatternBackground({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = canvas.current;
    const gl = el?.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
    if (!el || !gl) return;

    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    // One triangle that covers the screen.
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      time: gl.getUniformLocation(program, "uTime"),
      pointer: gl.getUniformLocation(program, "uPointer"),
      page: gl.getUniformLocation(program, "uPage"),
      vel: gl.getUniformLocation(program, "uVel"),
      rib: gl.getUniformLocation(program, "uRib"),
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let visible = true;
    // Start mid-cycle so the first still frame is already composed.
    let time = 12;
    let last = performance.now();
    // Eased copies of the scroll state, so a flick of the wheel swells and settles instead of jumping.
    let page = 0;
    let vel = 0;
    let speed = 1;
    // Pointer influence, eased so the sphere drifts instead of snapping.
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const narrow = el.clientWidth < 768;
      const dpr = Math.min(window.devicePixelRatio || 1, narrow ? 1.25 : 1.5);
      el.width = Math.round(el.clientWidth * dpr);
      el.height = Math.round(el.clientHeight * dpr);
      gl.viewport(0, 0, el.width, el.height);
      gl.uniform2f(u.res, el.width, el.height);
      // Narrower ribs on small screens so there are always enough of them to read as glass.
      const rib = Math.min(RIB, Math.max(20, el.clientWidth / 28));
      gl.uniform1f(u.rib, rib * dpr);
    };

    const draw = () => {
      gl.uniform1f(u.time, time);
      gl.uniform2f(u.pointer, pointer.x, pointer.y);
      gl.uniform1f(u.page, page);
      gl.uniform1f(u.vel, vel);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    const loop = (now: number) => {
      // Clamp the step so a background tab does not jump the motion when it returns.
      const dt = Math.min(now - last, 50) / 1000;
      last = now;

      // Scrolling quickens the light, up to ~2.2× at a brisk scroll, then eases back.
      const targetSpeed = 1 + Math.min(Math.abs(scrollMotion.velocity) / 1400, 1.2);
      speed += (targetSpeed - speed) * (targetSpeed > speed ? 0.12 : 0.03);
      page += (scrollMotion.page - page) * 0.08;
      vel += (Math.max(-1, Math.min(1, scrollMotion.velocity / 2500)) - vel) * 0.08;

      time += dt * speed;
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      draw();
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      if (reduced || frame || !visible || document.hidden) return;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
    };

    resize();
    draw();
    setReady(true);

    const resizeObserver = new ResizeObserver(() => {
      resize();
      draw();
    });
    resizeObserver.observe(el);

    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    viewObserver.observe(el);

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (event: PointerEvent) => {
      pointer.tx = event.clientX / window.innerWidth - 0.5;
      pointer.ty = event.clientY / window.innerHeight - 0.5;
    };
    if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

    start();
    return () => {
      stop();
      resizeObserver.disconnect();
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointermove", onPointer);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    };
  }, []);

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn("pointer-events-none size-full transition-opacity duration-[1.6s] ease-out", ready ? "opacity-100" : "opacity-0", className)}
    />
  );
}
