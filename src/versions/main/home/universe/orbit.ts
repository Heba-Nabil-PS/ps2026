/**
 * The orbit the flagship cases sit on (ProductUniverse). A card `p` steps from
 * the front (0 in focus, ±1 the neighbours, ±2 out of sight) has one pose; the
 * orbit turns by moving every card's `p` one step, sampled along the arc so the
 * cards swing round the curve instead of sliding across the screen.
 */

/** Degrees between two cases on the orbit. */
export const STEP = 36;

/** How far a card swings sideways, in % of the card's width, at the sine's peak. */
export const SPREAD = { desktop: 178, mobile: 150 } as const;

/** Timeline units. The pinned scroll is `total × SCREENS_PER_UNIT` viewport heights. */
export const UNITS = {
  /** The orbit swings the first case to the front. */
  enter: 0.4,
  /** Each case's scene plays its short story. */
  story: 0.62,
  /** Still, so there is time to read. */
  hold: 0.22,
  /** The orbit turns one step. */
  move: 0.45,
  /** The last case holds a little longer before the section lets go. */
  lastHold: 0.35,
} as const;
export const SCREENS_PER_UNIT = 1.2;

/** The whole timeline in units: enter, every story and hold, a move between each pair, the longer last hold. */
export const timelineLength = (count: number) =>
  count ? UNITS.enter + count * UNITS.story + (count - 1) * (UNITS.hold + UNITS.move) + UNITS.lastHold : 0;

/** Where the first card waits before the section starts: off to the side, small and dim. */
export const ENTER_FROM = 1.4;

export type Pose = { xPercent: number; yPercent: number; rotateY: number; scale: number; opacity: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const rad = (deg: number) => (deg * Math.PI) / 180;

/** The pose of a card `p` steps from the front. `dir` is -1 in RTL, so the next case waits on the left. */
export function pose(p: number, spread: number, dir: 1 | -1 = 1): Pose {
  const a = clamp(p, -2.5, 2.5) * STEP;
  return {
    xPercent: -50 + Math.sin(rad(a)) * spread * dir,
    yPercent: -50,
    rotateY: a * dir,
    scale: 1 - 0.9 * (1 - Math.cos(rad(a))),
    opacity: Math.max(0, 1 - Math.abs(p) * 0.64),
  };
}

export const zIndexAt = (p: number) => 10 - Math.round(Math.abs(p) * 2);

/**
 * Keyframes for one move of the orbit, from `from` to `to` steps: the pose is
 * sampled at every quarter of the way and joined by straight segments, so the
 * card follows the arc. The tween that plays them sets the overall ease.
 */
export function arc(from: number, to: number, spread: number, dir: 1 | -1) {
  const frames: Record<string, Pose> = {};
  for (let i = 0; i <= 4; i++) frames[`${i * 25}%`] = pose(from + ((to - from) * i) / 4, spread, dir);
  return frames;
}
