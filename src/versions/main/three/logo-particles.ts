import { LOGO_VIEWBOX } from "@/shared/brand/logo-paths";
import { getLogoSpine, LOGO_BASELINE, type SpineStroke } from "@/shared/brand/logo-spine";

/**
 * Turns the logo into discs: where each one belongs on the mark, how big it is
 * there and when the "pen" reaches it, plus the random numbers that give it a
 * second home floating in space. The shader moves each disc between the two.
 *
 * The discs are the brand pattern's: they stand along the logo's centre lines
 * like the coils of a spring, each as wide as the line is at that point, so
 * together they fill the logo's exact shape (see shared/brand/logo-spine).
 */

/** Scene units per artwork unit: the mark is about ten units wide in the scene. */
export const LOGO_UNIT = 0.01;

const MARK = LOGO_VIEWBOX.mark;
const CENTRE = { x: MARK.x + MARK.width / 2, y: MARK.y + MARK.height / 2 };

/** The mark's size in the scene, for fitting it to the viewport. */
export const LOGO_SIZE = { width: MARK.width * LOGO_UNIT, height: MARK.height * LOGO_UNIT };
/** The feet's cut, as a height in the scene (its origin is the mark's centre, y up). */
export const LOGO_FOOT = (CENTRE.y - LOGO_BASELINE) * LOGO_UNIT;

/** What a disc is part of. Matches `aLine.w` in the shader. */
export const KIND = { outer: 0, inner: 1, ambient: 2 } as const;

/** Where the loose discs float, as fractions of the camera's distance to the logo. Shared with the shader. */
export const FIELD = { near: 0.45, far: 2.3 } as const;
/** The same scale, 0 (nearest) → 1 (farthest): where the logo itself sits. */
const LOGO_DEPTH = (1 - FIELD.near) / (FIELD.far - FIELD.near);

export type LogoParticles = {
  count: number;
  /** x, y, z on the logo (scene units) and the disc's radius there. */
  target: Float32Array;
  /** The line's direction at that point (x, y), when the pen reaches it (0 → 1), and the disc's KIND. */
  line: Float32Array;
  /** Four numbers, 0 → 1: where it floats across the view (x, y) and in depth (z, 0 nearest the camera), and one to vary it by. */
  seed: Float32Array;
};

type Placement = {
  stroke: SpineStroke;
  kind: number;
  /** Distance between discs, as a fraction of their width. */
  pitch: number;
  /** Never closer than this (artwork units), however narrow the line gets at a cap. */
  minPitch: number;
  /** When the pen reaches the stroke's first and last disc, on the 0 → 1 drawing timeline. */
  from: number;
  to: number;
  /** Depth on the logo (scene units): the thin line sits a little behind, so the mark has some depth when it turns. */
  z: number;
};

/**
 * The large discs: a composed handful that anchor the floating field, the way
 * the brand pattern shows them close up. Places are across the view (−1 → 1,
 * y up) at the top of the page, around the headline rather than behind it;
 * depth is 0 (nearest) → 1, with the logo's plane, where things are sharp, at about 0.3.
 */
const LARGE_DISCS: readonly { x: number; y: number; depth: number; radius: number }[] = [
  { x: -0.8, y: 0.5, depth: 0.3, radius: 1.15 },
  { x: 0.84, y: -0.42, depth: 0.09, radius: 0.85 },
  { x: 0.6, y: 0.8, depth: 0.51, radius: 1.5 },
  { x: -0.92, y: -0.74, depth: 0.16, radius: 0.75 },
  { x: -0.3, y: -0.9, depth: 0.35, radius: 0.62 },
  { x: 0.98, y: 0.22, depth: 0.27, radius: 0.5 },
  { x: -0.5, y: 0.98, depth: 0.73, radius: 1.7 },
  { x: 0.22, y: -0.62, depth: 0.89, radius: 1.9 },
];

/** Small deterministic generator, so the field is the same on every visit. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * @param spacing 1 for the full set (about 2,200 discs); larger spreads them out for small screens.
 */
export function layoutLogoParticles(spacing = 1): LogoParticles {
  const spine = getLogoSpine();
  const random = mulberry32(20260930);

  // Drawn in this order, back to front: the thin line passes under the outer one, and the stem tucks under the main stroke.
  // The timings follow the intro's pen: the main stroke first, the stem down from the junction, the thin line a beat later.
  const placements: Placement[] = [
    { stroke: spine.inner, kind: KIND.inner, pitch: 0.18, minPitch: 1.2, from: 0.3, to: 1, z: -0.1 },
    { stroke: spine.stem, kind: KIND.outer, pitch: 0.19, minPitch: 2.4, from: 0.52, to: 0.27, z: 0 },
    { stroke: spine.main, kind: KIND.outer, pitch: 0.19, minPitch: 2.4, from: 0, to: 0.8, z: 0 },
  ];

  const target: number[] = [];
  const line: number[] = [];
  const seed: number[] = [];

  // Discs that never join the logo keep the space alive while it holds: the large ones, some the size of the outer line's, and dust.
  type Ambient = { x: number; y: number; depth: number; radius: number };
  const ambient: Ambient[] = LARGE_DISCS.map((disc) => ({ ...disc, x: disc.x * 0.5 + 0.5, y: disc.y * 0.5 + 0.5 }));
  for (let k = 0, n = Math.round(60 / spacing); k < n; k++) ambient.push({ x: random(), y: random(), depth: random(), radius: 0.09 + random() * 0.09 });
  for (let k = 0, n = Math.round(420 / spacing); k < n; k++) ambient.push({ x: random(), y: random(), depth: random(), radius: 0.028 + random() * 0.035 });
  // Farthest first, so nearer discs are drawn over farther ones.
  ambient.sort((a, b) => b.depth - a.depth);
  const addAmbient = ({ x, y, depth, radius }: Ambient) => {
    target.push(0, 0, 0, radius);
    line.push(1, 0, 0, KIND.ambient);
    seed.push(x, y, depth, random());
  };

  ambient.filter((disc) => disc.depth >= LOGO_DEPTH).forEach(addAmbient);

  for (const { stroke, kind, pitch, minPitch, from, to, z } of placements) {
    const { points, count, length } = stroke;
    for (let at = 0; at <= length; ) {
      // Spine points are one unit apart: read between the two nearest.
      const index = Math.min(Math.floor(at), count - 2);
      const mix = Math.min(at - index, 1);
      const a = index * 5;
      const b = a + 5;
      const read = (offset: number) => points[a + offset] + (points[b + offset] - points[a + offset]) * mix;
      const half = read(4);
      target.push((read(0) - CENTRE.x) * LOGO_UNIT, (CENTRE.y - read(1)) * LOGO_UNIT, z, half * LOGO_UNIT); // the artwork's y runs down, the scene's up
      line.push(read(2), -read(3), from + (to - from) * (at / length), kind);
      seed.push(random(), random(), random(), random());
      at += Math.max(half * 2 * pitch, minPitch) * spacing;
    }
  }

  // The ambient discs in front of the logo's plane are drawn over it.
  ambient.filter((disc) => disc.depth < LOGO_DEPTH).forEach(addAmbient);

  return { count: target.length / 4, target: new Float32Array(target), line: new Float32Array(line), seed: new Float32Array(seed) };
}
