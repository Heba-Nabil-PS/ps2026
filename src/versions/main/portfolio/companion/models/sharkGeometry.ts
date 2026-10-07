import { BufferGeometry, Color, Float32BufferAttribute, MathUtils, SphereGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * A great white built from code, after the season's turnaround sheet, so no model file ships with the page.
 *
 * Model space: the body runs along z from the tail (-1) to the nose (+1), dorsal side up (+y).
 * The swim shader bends it sideways by z, so every part (fins included) follows the tail beat.
 *
 * Every vertex carries `aSkin`: on the body it is how far round toward the belly it sits (-1 the
 * spine, 1 the belly), which the shader uses to paint the hide; on fins and eyes it is -2 (left as painted).
 *
 * The mesh is kept lean (about 8k indexed triangles, smooth-shaded): the hide shader does the detail
 * work per pixel, so the geometry only has to hold the silhouette.
 */

const BACK = new Color("#1b2736");
const BELLY = new Color("#c3ccd3");
const FIN = new Color("#0e1620");
const EYE = new Color("#020406");
const NOT_SKIN = -2;

const RINGS = 60;
const SIDES = 26;

/** Body radius at u (0 = tail, 1 = nose): a slim stock, a deep chest just behind the head, a conical snout. */
function girth(u: number) {
  const a = 1.6;
  const b = 1.0;
  const peak = Math.pow(a / (a + b), a) * Math.pow(b / (a + b), b);
  return 0.01 + 0.025 * (1 - u) ** 3 + (0.32 * (u ** a * (1 - u) ** b)) / peak;
}

/** The cross-section half-sizes at u: a high, rounded back over a flatter belly, a pointed snout over the jaw. */
function section(u: number) {
  const r = girth(u);
  const snout = MathUtils.smoothstep(u, 0.76, 1);
  // The back arches; the belly drops away under the head so the snout reads as a cone above the jaw.
  const lift = 0.03 * Math.sin(Math.PI * u) - 0.01 * snout;
  return { width: r * 0.82, top: r * 1.1 * (1 - 0.15 * snout), bottom: r * 0.9 * (1 - 0.5 * snout), lift };
}

function body() {
  const positions: number[] = [];
  const colors: number[] = [];
  const skin: number[] = [];
  const indices: number[] = [];
  const shade = new Color();

  for (let i = 0; i <= RINGS; i++) {
    const u = i / RINGS;
    const { width, top, bottom, lift } = section(u);
    // The seam sits along the belly, where it is never seen.
    for (let j = 0; j <= SIDES; j++) {
      const theta = (j / SIDES) * Math.PI * 2;
      const up = Math.cos(theta);
      positions.push(Math.sin(theta) * width, lift + up * (up > 0 ? top : bottom), -1 + 2 * u);
      shade.copy(BACK).lerp(BELLY, MathUtils.smoothstep(-up, -0.1, 0.4));
      colors.push(shade.r, shade.g, shade.b);
      skin.push(-up);
    }
  }
  for (let i = 0; i < RINGS; i++) {
    for (let j = 0; j < SIDES; j++) {
      const a = i * (SIDES + 1) + j;
      const b = a + SIDES + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  // Close the tail and the nose with a fan to a single point each.
  const cap = (ring: number, z: number, flip: boolean) => {
    const centre = positions.length / 3;
    const { lift } = section(ring / RINGS);
    positions.push(0, lift, z);
    colors.push(BACK.r, BACK.g, BACK.b);
    skin.push(-1);
    for (let j = 0; j < SIDES; j++) {
      const a = ring * (SIDES + 1) + j;
      if (flip) indices.push(centre, a + 1, a);
      else indices.push(centre, a, a + 1);
    }
  };
  cap(0, -1.005, false);
  cap(RINGS, 1.015, true);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSkin", new Float32BufferAttribute(skin, 1));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

type Paint = Color | ((x: number, y: number, z: number, normalY: number) => Color);

/** Paints a part (one colour, or per vertex) and strips what the merged body does not carry. Stays indexed. */
function part(geometry: BufferGeometry, paint: Paint) {
  geometry.deleteAttribute("uv");
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const c = paint instanceof Color ? paint : paint(position.getX(i), position.getY(i), position.getZ(i), normal.getY(i));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("aSkin", new Float32BufferAttribute(new Float32Array(position.count).fill(NOT_SKIN), 1));
  return geometry;
}

type Point = [number, number];

/** A quadratic curve from `from` to `to`, pulled toward `via`. */
const curve =
  (from: Point, via: Point, to: Point) =>
  (t: number): Point => {
    const s = 1 - t;
    return [s * s * from[0] + 2 * s * t * via[0] + t * t * to[0], s * s * from[1] + 2 * s * t * via[1] + t * t * to[1]];
  };

/**
 * A fin lofted from its root to its tip, drawn in its own plane (x, y) with its thickness along z.
 * Each slice is an airfoil from the leading to the trailing edge: round-nosed, thickest a third of
 * the way back and knife-thin behind; the fin is fleshy at the root and fine at the tip, as a real one is.
 */
function fin(lead: (t: number) => Point, trail: (t: number) => Point, thickness: number, mirror = false) {
  const STEPS = 12;
  const AROUND = 16;
  const positions: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const [la, lb] = lead(t);
    const [ta, tb] = trail(t);
    const thick = thickness * (1 - t) ** 0.7;
    for (let j = 0; j <= AROUND; j++) {
      const phi = (j / AROUND) * Math.PI * 2;
      const c = (1 - Math.cos(phi)) / 2;
      const half = thick * 1.3 * Math.sqrt(c) * (1 - c);
      const a = la + (ta - la) * c;
      positions.push(mirror ? -a : a, lb + (tb - lb) * c, Math.sin(phi) >= 0 ? half : -half);
    }
  }
  for (let i = 0; i < STEPS; i++) {
    for (let j = 0; j < AROUND; j++) {
      const a = i * (AROUND + 1) + j;
      const b = a + AROUND + 1;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  // Which way the triangles wind depends on how the fin is drawn: make sure they face out.
  if (geometry.getAttribute("normal").getZ(AROUND / 4) < 0) {
    for (let k = 0; k < indices.length; k += 3) [indices[k + 1], indices[k + 2]] = [indices[k + 2], indices[k + 1]];
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
  }
  return geometry;
}

/** A fin drawn in the side view (x = body z, y = height), stood on the body's centre line. */
const standing = (geometry: BufferGeometry) => geometry.rotateY(-Math.PI / 2);

/** A paired fin drawn flat (x = span, y = body z), laid out to one side and drooped. Pale beneath, dark-tipped. */
function paired(side: 1 | -1, lead: (t: number) => Point, trail: (t: number) => Point, thickness: number, droop: number, span: number) {
  const geometry = fin(lead, trail, thickness, side < 0);
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(side * -droop);
  const shade = new Color();
  return part(geometry, (x, _y, _z, normalY) =>
    shade.copy(FIN).lerp(BELLY, MathUtils.smoothstep(-normalY, 0.2, 0.7) * (1 - MathUtils.smoothstep(Math.abs(x), span * 0.6, span * 0.85))),
  );
}

/** The long, sickle-shaped pectorals. */
function pectoral(side: 1 | -1) {
  const tip: Point = [0.56, -0.32];
  const geometry = paired(side, curve([0, 0.13], [0.3, 0.06], tip), curve([0, -0.08], [0.26, -0.11], tip), 0.06, 0.42, 0.56);
  const { width, bottom } = section(0.67);
  return geometry.translate(side * width * 0.62, -bottom * 0.45, 0.32);
}

/** The small pelvic fins under the belly, ahead of the tail stock. */
function pelvic(side: 1 | -1) {
  const tip: Point = [0.15, -0.12];
  const geometry = paired(side, curve([0, 0.05], [0.08, 0.01], tip), curve([0, -0.06], [0.08, -0.07], tip), 0.03, 0.8, 0.15);
  const { width, bottom, lift } = section(0.35);
  return geometry.translate(side * width * 0.35, lift - bottom * 0.85, -0.3);
}

export function createSharkGeometry() {
  const topAt = (z: number) => {
    const s = section((z + 1) / 2);
    return s.lift + s.top;
  };
  const bottomAt = (z: number) => {
    const s = section((z + 1) / 2);
    return s.lift - s.bottom;
  };

  // The tall, swept first dorsal: a straight leading edge, a pointed tip, a hollowed trailing edge.
  const dorsalTip: Point = [-0.1, 0.46];
  const dorsal = standing(fin(curve([0.26, 0], [0.12, 0.26], dorsalTip), curve([-0.19, 0], [-0.05, 0.17], dorsalTip), 0.07));
  dorsal.translate(0, topAt(0.05) - 0.06, 0);

  /** A small, back-pointing fin on the tail stock; `up` -1 hangs it under the body. */
  const small = (z: number, size: number, up: 1 | -1) => {
    const tip: Point = [z - size * 0.85, up * size * 0.9];
    const geometry = standing(fin(curve([z + size * 0.55, 0], [z, up * size * 0.5], tip), curve([z - size * 0.45, 0], [z - size * 0.55, up * size * 0.4], tip), 0.016));
    geometry.translate(0, (up > 0 ? topAt(z) : bottomAt(z)) - up * 0.012, 0);
    return part(geometry, FIN);
  };
  const smalls = [
    small(-0.5, 0.075, 1),
    small(-0.64, 0.04, 1),
    small(-0.74, 0.03, 1),
    small(-0.56, 0.065, -1),
    small(-0.68, 0.035, -1),
    small(-0.77, 0.028, -1),
  ];

  // The crescent tail of a great white: both lobes tall, the upper a little longer, the trailing edge hollowed.
  const upperTip: Point = [-1.25, 0.54];
  const lowerTip: Point = [-1.2, -0.44];
  const upperLobe = standing(fin(curve([-0.84, 0.03], [-1.0, 0.2], upperTip), curve([-1.08, 0], [-1.12, 0.24], upperTip), 0.06));
  const lowerLobe = standing(fin(curve([-0.84, -0.03], [-1.0, -0.18], lowerTip), curve([-1.08, 0], [-1.11, -0.2], lowerTip), 0.055));

  // The keel: a flat ridge along each side of the tail stock.
  const keel = new SphereGeometry(1, 12, 6);
  keel.scale(0.075, 0.014, 0.13);
  keel.translate(0, section(0.075).lift, -0.85);

  const eyes = [1, -1].map((side) => {
    const eye = new SphereGeometry(0.02, 8, 6);
    const { width, lift } = section(0.89);
    eye.translate(side * width * 0.86, lift + 0.025, 0.78);
    return part(eye, EYE);
  });

  const geometry = mergeGeometries([
    body(),
    part(dorsal, FIN),
    ...smalls,
    part(upperLobe, FIN),
    part(lowerLobe, FIN),
    part(keel, BACK),
    pectoral(1),
    pectoral(-1),
    pelvic(1),
    pelvic(-1),
    ...eyes,
  ]);
  if (!geometry) throw new Error("Shark parts could not be merged");
  geometry.computeBoundingSphere();
  return geometry;
}
