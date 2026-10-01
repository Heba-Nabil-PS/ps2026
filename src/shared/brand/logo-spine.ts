/**
 * The PSdigital mark as centre lines with a width: the geometry the home page's
 * particle logo is built on (versions/main/three/LogoParticleSystem).
 *
 * The mark is filled ribbons, so there is no stroke to follow. Each ribbon's two
 * edges are read from the artwork outline (LOGO_PATHS) and paired point by point:
 * the midpoints are the centre line, and half the distance between the edges is
 * the local half-width. The result is three strokes (the same three as
 * LOGO_DRAW), sampled one unit apart:
 *
 * - `main`:  top-left cap → left loop → junction → diagonal → bowl → end cap;
 * - `stem`:  foot → junction, the same way as the diagonal it continues into.
 *            It ends under `main`, so it has no visible top;
 * - `inner`: the thin line, foot → diagonal → its own loop → end cap.
 *
 * Unlike LOGO_DRAW (mask strokes, which overshoot the artwork on purpose), these
 * stay inside it: round caps taper to nothing at the tip and the line swells a
 * little where the loop turns into the diagonal, so discs sized by the half-width
 * fill the logo's exact shape. The two feet are cut flat in the artwork; their
 * centre lines run on past the cut and LOGO_BASELINE says where to clip.
 *
 * The edge lists below are indices into the outline's segments and are specific
 * to Psdigital Logo-01.svg. If the artwork changes, list the segments again:
 * for each stroke, its left edge and then its right edge, both from the same end.
 */
import { LOGO_PATHS } from "@/shared/brand/logo-paths";

type Point = readonly [number, number];
type Cubic = readonly [Point, Point, Point, Point];

export type SpineStrokeId = "main" | "stem" | "inner";

export type SpineStroke = {
  id: SpineStrokeId;
  /** One point per artwork unit along the stroke, flattened: x, y, tangentX, tangentY, half-width. */
  points: Float32Array;
  /** Number of points (points.length / 5). */
  count: number;
  /** Length of the stroke in artwork units. */
  length: number;
};

/** The y both feet are cut at (artwork units): anything below it is outside the logo. */
export const LOGO_BASELINE = 878.49;

/** How far the centre lines run past the baseline, so discs cover the corners of the slanted cut. */
const FOOT_OVERRUN = 20;
/** Spacing of the points the outlines are read at (artwork units). The strokes are resampled to one unit at the end. */
const STEP = 2;
/** Where the loop turns up into the diagonal: how far up the diagonal's far edge the turn's outer side lands (artwork units). */
const JUNCTION_TURN = 70;

/** Part of one outline segment, from one parameter to another (from > to walks it backwards). */
type EdgePart = readonly [segment: number, from: number, to: number];
const seg = (index: number): EdgePart => [index, 0, 1];
const rev = (index: number): EdgePart => [index, 1, 0];

/* Segments of the outer outline that meet at the junction. */
const LOOP_LOWER_EDGE = 11; // ends at the notch between the loop and the stem
const STEM_LEFT_EDGE = 12;
const DIAGONAL_RIGHT_EDGE = 14; // a straight line from the foot to the bowl
const DIAGONAL_LEFT_EDGE = 3; // ends where the loop's inner edge has turned fully into the diagonal

/* ---------- SVG path → absolute cubic segments ---------- */

function parsePath(d: string): Cubic[] {
  const tokens = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e-?\d+)?/g) ?? [];
  const segments: Cubic[] = [];
  let i = 0;
  let command = "";
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;
  let controlX: number | null = null;
  let controlY = 0;
  const next = () => parseFloat(tokens[i++]);
  const line = (toX: number, toY: number) => {
    segments.push([
      [x, y],
      [x + (toX - x) / 3, y + (toY - y) / 3],
      [x + ((toX - x) * 2) / 3, y + ((toY - y) * 2) / 3],
      [toX, toY],
    ]);
    x = toX;
    y = toY;
    controlX = null;
  };

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) command = tokens[i++];
    const relative = command === command.toLowerCase();
    const dx = relative ? x : 0;
    const dy = relative ? y : 0;
    switch (command.toUpperCase()) {
      case "M":
        x = startX = next() + dx;
        y = startY = next() + dy;
        command = relative ? "l" : "L";
        controlX = null;
        break;
      case "L":
        line(next() + dx, next() + dy);
        break;
      case "H":
        line(next() + dx, y);
        break;
      case "V":
        line(x, next() + dy);
        break;
      case "C":
      case "S": {
        let c1x = x;
        let c1y = y;
        if (command.toUpperCase() === "C") {
          c1x = next() + dx;
          c1y = next() + dy;
        } else if (controlX !== null) {
          c1x = 2 * x - controlX;
          c1y = 2 * y - controlY;
        }
        const c2x = next() + dx;
        const c2y = next() + dy;
        const toX = next() + dx;
        const toY = next() + dy;
        segments.push([
          [x, y],
          [c1x, c1y],
          [c2x, c2y],
          [toX, toY],
        ]);
        controlX = c2x;
        controlY = c2y;
        x = toX;
        y = toY;
        break;
      }
      case "Z":
        if (Math.hypot(x - startX, y - startY) > 1e-6) line(startX, startY);
        x = startX;
        y = startY;
        controlX = null;
        break;
      default:
        throw new Error(`Unsupported path command "${command}"`);
    }
  }
  return segments;
}

function bezier(segment: Cubic, t: number): Point {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const e = t * t * t;
  return [
    a * segment[0][0] + b * segment[1][0] + c * segment[2][0] + e * segment[3][0],
    a * segment[0][1] + b * segment[1][1] + c * segment[2][1] + e * segment[3][1],
  ];
}

function segmentLength(segment: Cubic, from = 0, to = 1) {
  let length = 0;
  let previous = bezier(segment, from);
  for (let k = 1; k <= 24; k++) {
    const point = bezier(segment, from + ((to - from) * k) / 24);
    length += Math.hypot(point[0] - previous[0], point[1] - previous[1]);
    previous = point;
  }
  return length;
}

/** Cubic Hermite curve between two points with unit tangents, as points about STEP apart (ends left out). */
function hermite(from: Point, fromTangent: Point, to: Point, toTangent: Point): Point[] {
  const span = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const points: Point[] = [];
  for (let k = 1, n = Math.ceil(span / STEP); k < n; k++) {
    const t = k / n;
    const h1 = 2 * t ** 3 - 3 * t ** 2 + 1;
    const h2 = t ** 3 - 2 * t ** 2 + t;
    const h3 = -2 * t ** 3 + 3 * t ** 2;
    const h4 = t ** 3 - t ** 2;
    points.push([
      h1 * from[0] + h2 * fromTangent[0] * span + h3 * to[0] + h4 * toTangent[0] * span,
      h1 * from[1] + h2 * fromTangent[1] * span + h3 * to[1] + h4 * toTangent[1] * span,
    ]);
  }
  return points;
}

const direction = (from: Point, to: Point): Point => {
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  return [(to[0] - from[0]) / length, (to[1] - from[1]) / length];
};

/**
 * An edge as one polyline, points about STEP apart. Where two consecutive parts do
 * not touch, a smooth curve that leaves the first and enters the second along their own
 * directions bridges them: the edge the ribbon would have had if nothing joined it there.
 */
function sampleEdge(segments: Cubic[], edge: readonly EdgePart[]): Point[] {
  const points: Point[] = [];
  for (const [index, from, to] of edge) {
    const segment = segments[index];
    const count = Math.max(2, Math.ceil(segmentLength(segment, from, to) / STEP));
    const part: Point[] = [];
    for (let k = 0; k <= count; k++) part.push(bezier(segment, from + ((to - from) * k) / count));

    const last = points[points.length - 1];
    if (!last) points.push(...part);
    else if (Math.hypot(part[0][0] - last[0], part[0][1] - last[1]) > 0.5) {
      points.push(...hermite(last, direction(points[points.length - 3], last), part[0], direction(part[0], part[2])), ...part);
    } else points.push(...part.slice(1)); // parts that touch share a point
  }
  return points;
}

/* ---------- centre line ---------- */

type Centre = { x: number; y: number; half: number };

/**
 * Walks `edge` and pairs each point with the nearest on `opposite`, looking forwards only.
 * Pairs that land on either end of `opposite` are skipped: there the ribbon is being cut
 * (a foot, a cap) and the two edges no longer face each other.
 */
function pairEdges(edge: Point[], opposite: Point[], window = 90 / STEP): Centre[] {
  const centres: Centre[] = [];
  let j = 0;
  for (const point of edge) {
    let best = Infinity;
    for (let k = j, end = Math.min(j + window, opposite.length - 1); k <= end; k++) {
      const d = (point[0] - opposite[k][0]) ** 2 + (point[1] - opposite[k][1]) ** 2;
      if (d < best) {
        best = d;
        j = k;
      }
    }
    if (j === 0 || j === opposite.length - 1) continue;
    centres.push({ x: (point[0] + opposite[j][0]) / 2, y: (point[1] + opposite[j][1]) / 2, half: Math.sqrt(best) / 2 });
  }
  return centres;
}

function smooth(centres: Centre[], radius: number): Centre[] {
  return centres.map((centre, index) => {
    // The window shrinks towards the ends so they stay where they are.
    const reach = Math.min(radius, index, centres.length - 1 - index);
    let x = 0;
    let y = 0;
    let half = 0;
    for (let k = index - reach; k <= index + reach; k++) {
      x += centres[k].x;
      y += centres[k].y;
      half += centres[k].half;
    }
    const n = 2 * reach + 1;
    return { x: x / n, y: y / n, half: half / n };
  });
}

/** The same line with points exactly `step` apart (the last point is kept). */
function resample(centres: Centre[], step: number): Centre[] {
  const out: Centre[] = [centres[0]];
  let carried = 0;
  for (let k = 1; k < centres.length; k++) {
    const a = centres[k - 1];
    const b = centres[k];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length === 0) continue;
    let at = step - carried;
    while (at <= length) {
      const t = at / length;
      out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, half: a.half + (b.half - a.half) * t });
      at += step;
    }
    carried = length - (at - step);
  }
  const last = centres[centres.length - 1];
  const tail = out[out.length - 1];
  if (Math.hypot(last.x - tail.x, last.y - tail.y) > step * 0.5) out.push(last);
  return out;
}

/** Unit direction of the line at one end, measured over a few points; it points away from the line. */
function endDirection(centres: Centre[], atStart: boolean, span = 6): Point {
  const n = centres.length;
  const tip = atStart ? centres[0] : centres[n - 1];
  const back = atStart ? centres[Math.min(span, n - 1)] : centres[Math.max(0, n - 1 - span)];
  return direction([back.x, back.y], [tip.x, tip.y]);
}

/** Even-odd test against a closed polyline. */
function inside(polygon: Point[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a[1] > y !== b[1] > y && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) hit = !hit;
  }
  return hit;
}

/**
 * A round cap: the line runs on to the tip of the artwork and its half-width
 * follows a circle down to nothing, so the last discs shrink into the cap.
 */
function roundCap(centres: Centre[], atStart: boolean, polygon: Point[]): Centre[] {
  const end = atStart ? centres[0] : centres[centres.length - 1];
  const [dx, dy] = endDirection(centres, atStart);
  // March out until the artwork ends, then settle the tip to a tenth of a unit.
  let reach = 0;
  while (reach < end.half * 3 && inside(polygon, end.x + dx * (reach + 1), end.y + dy * (reach + 1))) reach += 1;
  for (let step = 0.5; step >= 0.1; step /= 2) if (inside(polygon, end.x + dx * (reach + step), end.y + dy * (reach + step))) reach += step;

  // The cap's circle touches the tip; its centre sits one radius back from there.
  const radius = Math.min(end.half, reach);
  const cap: Centre[] = [];
  for (let along = 1; along < reach; along += 1) {
    const past = along - (reach - radius);
    cap.push({ x: end.x + dx * along, y: end.y + dy * along, half: past <= 0 ? end.half : Math.sqrt(Math.max(radius * radius - past * past, 0)) });
  }
  cap.push({ x: end.x + dx * reach, y: end.y + dy * reach, half: 0 });
  return atStart ? [...cap.reverse(), ...centres] : [...centres, ...cap];
}

/** A flat foot: the line runs straight on, past the baseline, at the width it had. */
function flatFoot(centres: Centre[]): Centre[] {
  const end = centres[0];
  const [dx, dy] = endDirection(centres, true);
  const reach = (LOGO_BASELINE - end.y) / dy + FOOT_OVERRUN;
  const foot: Centre[] = [];
  for (let along = Math.floor(reach); along >= 1; along--) foot.push({ x: end.x + dx * along, y: end.y + dy * along, half: end.half });
  return [...foot, ...centres];
}

function toStroke(id: SpineStrokeId, centres: Centre[]): SpineStroke {
  const count = centres.length;
  const points = new Float32Array(count * 5);
  let length = 0;
  for (let k = 0; k < count; k++) {
    const before = centres[Math.max(0, k - 1)];
    const after = centres[Math.min(count - 1, k + 1)];
    const [tx, ty] = direction([before.x, before.y], [after.x, after.y]);
    points.set([centres[k].x, centres[k].y, tx, ty, centres[k].half], k * 5);
    if (k > 0) length += Math.hypot(centres[k].x - centres[k - 1].x, centres[k].y - centres[k - 1].y);
  }
  return { id, points, count, length };
}

let cached: Record<SpineStrokeId, SpineStroke> | null = null;

/** The three strokes of the mark. Worked out once, on first use (tens of milliseconds at most), and kept. */
export function getLogoSpine(): Record<SpineStrokeId, SpineStroke> {
  if (cached) return cached;

  const outer = parsePath(LOGO_PATHS.outer);
  const inner = parsePath(LOGO_PATHS.inner);
  const outerShape = outer.flatMap((segment) => sampleEdge([segment], [seg(0)]).slice(0, -1));
  const innerShape = inner.flatMap((segment) => sampleEdge([segment], [seg(0)]).slice(0, -1));

  // The junction, measured along the diagonal's straight right edge (0 at the foot, 1 at the bowl).
  const right = outer[DIAGONAL_RIGHT_EDGE];
  const rightLength = Math.hypot(right[3][0] - right[0][0], right[3][1] - right[0][1]);
  const along = (point: Point) =>
    ((point[0] - right[0][0]) * (right[3][0] - right[0][0]) + (point[1] - right[0][1]) * (right[3][1] - right[0][1])) / rightLength ** 2;
  const notch = along(outer[LOOP_LOWER_EDGE][3]); // level with the notch between loop and stem
  const merged = along(outer[DIAGONAL_LEFT_EDGE][3]); // level with the end of the loop's turn

  // main: the loop's lower edge turns up into the diagonal's right edge across the stem (a bridged gap).
  const main = pairEdges(
    sampleEdge(outer, [rev(6), rev(5), rev(4), rev(3), rev(2), rev(1), rev(0), rev(23), rev(22)]),
    sampleEdge(outer, [seg(9), seg(10), seg(LOOP_LOWER_EDGE), [DIAGONAL_RIGHT_EDGE, notch + JUNCTION_TURN / rightLength, 1], seg(15), seg(16), seg(17), seg(18), seg(19)]),
  );
  // stem: from the foot to just past the turn, where main covers it; its left edge is open where the loop joins (another bridged gap).
  const stem = pairEdges(
    sampleEdge(outer, [rev(STEM_LEFT_EDGE), [DIAGONAL_LEFT_EDGE, 1, 0.85]]),
    sampleEdge(outer, [[DIAGONAL_RIGHT_EDGE, 0, merged + 30 / rightLength]]),
  );
  const thin = pairEdges(
    sampleEdge(inner, [rev(4), rev(3), rev(2), rev(1), rev(0), rev(17), rev(16), rev(15)]),
    sampleEdge(inner, [seg(6), seg(7), seg(8), seg(9), seg(10), seg(11), seg(12)]),
  );

  cached = {
    main: toStroke("main", resample(roundCap(roundCap(smooth(main, 3), true, outerShape), false, outerShape), 1)),
    stem: toStroke("stem", resample(flatFoot(smooth(stem, 3)), 1)),
    inner: toStroke("inner", resample(roundCap(flatFoot(smooth(thin, 2)), false, innerShape), 1)),
  };
  return cached;
}
