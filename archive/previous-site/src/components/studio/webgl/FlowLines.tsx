"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { PointerState } from "./usePointer";

type FlowLinesProps = {
  /** 0 → 1 as the hero scrolls out of view. */
  progress: RefObject<number>;
  pointer: RefObject<PointerState>;
  lite?: boolean;
  reduced?: boolean;
};

/** Lines sit on (and twist around) this depth; the pointer is projected onto it. */
const PLANE_Z = -3;

// Ashima Arts / Stefan Gustavson 3D simplex noise (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uScroll;
uniform float uReveal;
uniform float uAspect;
uniform float uWidth;
uniform float uDpr;
uniform float uPointerStrength;
uniform vec2 uResolution;
uniform vec3 uPointer;

attribute float aT;
attribute float aSide;
attribute vec2 aLine;

varying float vDist;
varying float vHalf;
varying float vAlpha;
varying vec3 vColor;

${noise}

// Every line is a function of (t, line, time): the whole field lives on the GPU.
vec3 linePos(float t, float n, float seed) {
  float u = t * 2.0 - 1.0;
  float halfH = 4.6;
  float halfW = halfH * max(uAspect, 0.6) * 1.35 + 1.5;
  float time = uTime;

  // Backbone: one slow sweeping curve, like the identity's key visual.
  float drift = snoise(vec3(u * 0.7, time * 0.035, 1.7));
  float sweep = u * 0.34 + sin(u * 1.9 + time * 0.11) * 0.26 + sin(u * 3.7 - time * 0.07 + 2.0) * 0.07;
  vec3 p = vec3(u * halfW, (sweep - 0.08 + drift * 0.12) * halfH, ${PLANE_Z.toFixed(1)});

  // The bundle pinches and fans out, twisting through depth as it travels.
  float pinch = 0.5 + 0.5 * sin(u * 1.7 - time * 0.09 + 1.3);
  float spread = halfH * (0.18 + 0.5 * pinch) * (1.0 + uScroll * 0.9);
  float o = (n - 0.5 + (seed - 0.5) * 0.08) * spread;
  float twist = u * 1.5 + time * 0.08 + drift * 1.1 + uScroll * 1.4;
  p.y += cos(twist) * o;
  p.z += sin(twist) * o * 1.8;

  // Per-line organic wander so the motion never visibly loops.
  vec3 q = vec3(u * 1.4 + seed * 4.0, n * 2.3, time * 0.06 + seed * 3.0);
  p.y += snoise(q) * 0.35 * (0.4 + pinch);
  p.z += snoise(q + 11.3) * 0.9;

  // Scrolling drifts, swells and opens the field.
  p.y += uScroll * 0.8;
  p.xy *= 1.0 + uScroll * 0.35;

  // The cursor gently lifts nearby lines towards the camera and parts them.
  vec2 d = p.xy - uPointer.xy;
  float f = exp(-dot(d, d) / 3.2) * uPointerStrength;
  p.z += f * 1.4;
  p.xy += d * f * 0.35;
  return p;
}

void main() {
  float n = aLine.x;
  float seed = aLine.y;
  vec3 p = linePos(aT, n, seed);
  vec3 ahead = linePos(aT + 0.004, n, seed);

  mat4 mvp = projectionMatrix * modelViewMatrix;
  vec4 c0 = mvp * vec4(p, 1.0);
  vec4 c1 = mvp * vec4(ahead, 1.0);

  // Expand the ribbon in screen space so lines keep a crisp pixel width.
  vec2 halfRes = uResolution * 0.5;
  vec2 dir = c1.xy / c1.w * halfRes - c0.xy / c0.w * halfRes;
  float len = length(dir);
  dir = len > 1e-5 ? dir / len : vec2(1.0, 0.0);
  vec2 normal = vec2(-dir.y, dir.x);

  float depth = smoothstep(-9.0, 2.0, p.z);
  float halfWidth = uWidth * mix(0.55, 1.25, depth) * 0.5;
  c0.xy += normal * aSide * halfWidth * uDpr / halfRes * c0.w;
  gl_Position = c0;

  vDist = aSide * halfWidth;
  vHalf = halfWidth;

  float u = aT * 2.0 - 1.0;
  float ends = smoothstep(0.0, 0.14, aT) * smoothstep(1.0, 0.86, aT);
  float r = uReveal * 1.3;
  float reveal = 1.0 - smoothstep(r - 0.3, r, aT * 0.85 + n * 0.15);
  float accent = step(0.9, fract(seed * 7.13));
  float strength = mix(0.2, 0.7, depth) * mix(0.55, 1.0, fract(seed * 3.71)) * (1.0 + accent * 0.6);
  // Keep the lower band (headline + intro copy) calm and readable.
  vec2 screen = c0.xy / c0.w;
  float readable = mix(0.45, 1.0, smoothstep(-0.95, -0.05, screen.y));
  // Dissolve towards the frame so the canvas edge never shows when the stage scales on scroll.
  float vignette = smoothstep(1.02, 0.78, abs(screen.x)) * smoothstep(1.05, 0.85, abs(screen.y));
  vAlpha = strength * ends * reveal * readable * vignette;

  vec3 navy = vec3(0.071, 0.141, 0.263);
  vec3 blue = vec3(0.533, 0.733, 0.847);
  vec3 color = mix(blue, navy, smoothstep(-0.7, 0.9, u + (seed - 0.5) * 0.6 + sin(uTime * 0.05 + n * 3.0) * 0.3));
  // Atmospheric perspective: distant lines fade towards the brand blue.
  vColor = mix(color, blue, (1.0 - depth) * 0.5 + accent * 0.4);
}
`;

const fragmentShader = /* glsl */ `
varying float vDist;
varying float vHalf;
varying float vAlpha;
varying vec3 vColor;

void main() {
  float d = abs(vDist);
  float coreHalf = max(vHalf * 0.16, 0.45);
  float core = 1.0 - smoothstep(coreHalf - 0.5, coreHalf + 0.6, d);
  float halo = pow(max(1.0 - d / vHalf, 0.0), 3.0) * 0.22;
  vec3 glow = vec3(0.533, 0.733, 0.847);
  float alpha = vAlpha * max(core, halo);
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(mix(glow, vColor, core), alpha);
}
`;

function hash(i: number) {
  const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function createGeometry(lines: number, segments: number) {
  const verts = lines * (segments + 1) * 2;
  const position = new Float32Array(verts * 3);
  const t = new Float32Array(verts);
  const side = new Float32Array(verts);
  const line = new Float32Array(verts * 2);
  const index = verts > 65535 ? new Uint32Array(lines * segments * 6) : new Uint16Array(lines * segments * 6);

  let v = 0;
  let k = 0;
  for (let l = 0; l < lines; l++) {
    // Golden-ratio ordering: any prefix of lines is evenly spread across the
    // bundle, so the performance fallback can simply draw fewer of them.
    const n = (l * 0.61803398875 + 0.13) % 1;
    const seed = hash(l + 1);
    const base = v;
    for (let s = 0; s <= segments; s++) {
      for (const sign of [-1, 1]) {
        t[v] = s / segments;
        side[v] = sign;
        line[v * 2] = n;
        line[v * 2 + 1] = seed;
        v++;
      }
      if (s < segments) {
        const a = base + s * 2;
        index.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], k);
        k += 6;
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
  geometry.setAttribute("aT", new THREE.BufferAttribute(t, 1));
  geometry.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
  geometry.setAttribute("aLine", new THREE.BufferAttribute(line, 2));
  geometry.setIndex(new THREE.BufferAttribute(index, 1));
  return geometry;
}

const raycaster = new THREE.Raycaster();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -PLANE_Z);
const ndc = new THREE.Vector2();
const hit = new THREE.Vector3();

/**
 * Lusion-style field of fine flowing lines drawn behind the hero orbs.
 * One draw call; all motion is computed in the vertex shader, so the CPU cost
 * per frame is a handful of uniform updates. Drops to half the lines and a
 * 1× pixel ratio if the device can't hold a smooth frame rate.
 */
export function FlowLines({ progress, pointer, lite, reduced }: FlowLinesProps) {
  const lines = lite ? 36 : 72;
  const segments = lite ? 120 : 200;
  const geometry = useMemo(() => createGeometry(lines, segments), [lines, segments]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        uniforms: {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uReveal: { value: 0 },
          uAspect: { value: 1 },
          uWidth: { value: 8 },
          uDpr: { value: 1 },
          uPointerStrength: { value: 0 },
          uResolution: { value: new THREE.Vector2(1, 1) },
          uPointer: { value: new THREE.Vector3(0, 0, PLANE_Z) },
        },
      }),
    [],
  );
  const mesh = useRef<THREE.Mesh>(null);
  const state = useRef({ time: 0, reveal: 0, frames: 0, sampled: 0, elapsed: 0, degraded: false });

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((three, rawDelta) => {
    const lines3d = mesh.current;
    if (!lines3d) return;
    const s = state.current;
    const u = (lines3d.material as THREE.ShaderMaterial).uniforms;
    const dt = Math.min(rawDelta, 1 / 20);

    // Adaptive quality: sample the frame time once, after warm-up.
    if (!s.degraded && s.frames < 150) {
      s.frames++;
      if (s.frames > 30 && rawDelta < 0.25) {
        s.elapsed += rawDelta;
        s.sampled++;
      }
      if (s.frames === 150 && s.sampled > 0 && s.elapsed / s.sampled > 1 / 42) {
        s.degraded = true;
        lines3d.geometry.setDrawRange(0, Math.ceil(lines / 2) * segments * 6);
        three.setDpr(1);
      }
    }

    // Slow, cinematic clock; frozen for reduced motion.
    if (!reduced) s.time += dt;
    s.reveal = reduced ? 1 : Math.min(1, s.reveal + dt / 3.2);
    u.uTime.value = reduced ? 14 : s.time + 14;
    u.uReveal.value = 1 - Math.pow(1 - s.reveal, 3);
    u.uScroll.value += ((progress.current ?? 0) - u.uScroll.value) * 0.08;

    const { width, height } = three.size;
    const dpr = three.viewport.dpr;
    u.uAspect.value = width / Math.max(height, 1);
    u.uDpr.value = dpr;
    u.uWidth.value = lite ? 6 : 8;
    u.uResolution.value.set(width * dpr, height * dpr);

    const p = pointer.current;
    const follow = p.active && !reduced;
    if (follow) {
      raycaster.setFromCamera(ndc.set(p.x, p.y), three.camera);
      if (raycaster.ray.intersectPlane(plane, hit)) u.uPointer.value.lerp(hit, 0.06);
    }
    u.uPointerStrength.value += ((follow ? 1 : 0) - u.uPointerStrength.value) * 0.04;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} renderOrder={-1} />;
}
