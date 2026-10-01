import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, MathUtils, Shape, SphereGeometry } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/*
 * A shark built from code, so no model file ships with the page.
 *
 * Model space: the body runs along z from the tail (-1) to the nose (+1), dorsal side up (+y).
 * The swim shader bends it sideways by z, so every part (fins included) follows the tail beat.
 */

const BACK = new Color("#1a2633");
const BELLY = new Color("#a7b6c2");
const FIN = new Color("#16202b");
const EYE = new Color("#020406");

const RINGS = 72;
const SIDES = 32;

/** Body radius at u (0 = tail, 1 = nose): a slim peduncle, the girth two thirds forward, a rounded snout. */
function girth(u: number) {
  const a = 1.2;
  const b = 0.58;
  const peak = Math.pow(a / (a + b), a) * Math.pow(b / (a + b), b);
  return 0.01 + 0.03 * (1 - u) ** 3 + (0.27 * (u ** a * (1 - u) ** b)) / peak;
}

/** The cross-section half-sizes at u: rounder back, flatter belly, a wedge-shaped snout. */
function section(u: number) {
  const r = girth(u);
  const snout = MathUtils.smoothstep(u, 0.78, 1);
  // The back arches; the snout dips slightly, over a flatter jaw.
  const lift = 0.025 * Math.sin(Math.PI * u) - 0.035 * snout;
  return { width: r * 0.8, top: r * 1.08 * (1 - 0.2 * snout), bottom: r * 0.85 * (1 - 0.45 * snout), lift };
}

function body() {
  const positions: number[] = [];
  const colors: number[] = [];
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
      shade.copy(BACK).lerp(BELLY, MathUtils.smoothstep(-up, -0.1, 0.6));
      colors.push(shade.r, shade.g, shade.b);
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
    for (let j = 0; j < SIDES; j++) {
      const a = ring * (SIDES + 1) + j;
      if (flip) indices.push(centre, a + 1, a);
      else indices.push(centre, a, a + 1);
    }
  };
  cap(0, -1.005, false);
  cap(RINGS, 1.02, true);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry.toNonIndexed();
}

/** Paints a part one colour and strips what the merged body does not carry. */
function part(geometry: BufferGeometry, color: Color) {
  const flat = geometry.index ? geometry.toNonIndexed() : geometry;
  flat.deleteAttribute("uv");
  const count = flat.getAttribute("position").count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) colors.set([color.r, color.g, color.b], i * 3);
  flat.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return flat;
}

const extrude = (shape: Shape, depth: number) =>
  new ExtrudeGeometry(shape, { depth, curveSegments: 14, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.005, bevelSegments: 2 });

/** A fin drawn in the side view (x = body z, y = height), turned to stand on the body's centre line. */
function sideFin(draw: (shape: Shape) => void, thickness: number) {
  const shape = new Shape();
  draw(shape);
  const geometry = extrude(shape, thickness);
  geometry.rotateY(-Math.PI / 2);
  geometry.translate(thickness / 2, 0, 0);
  return geometry;
}

/** A pectoral fin drawn flat (x = span, y = body z), laid out to one side and drooped. */
function pectoral(side: 1 | -1) {
  const shape = new Shape();
  shape.moveTo(0, 0.12);
  shape.quadraticCurveTo(side * 0.24, 0.04, side * 0.44, -0.32);
  shape.quadraticCurveTo(side * 0.2, -0.13, 0, -0.1);
  shape.closePath();
  const geometry = extrude(shape, 0.022);
  geometry.rotateX(Math.PI / 2);
  geometry.rotateZ(side * -0.5);
  const { width, bottom } = section(0.66);
  geometry.translate(side * width * 0.7, -bottom * 0.45, 0.32);
  return geometry;
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

  const dorsal = sideFin((s) => {
    s.moveTo(0.24, 0);
    s.quadraticCurveTo(0.12, 0.3, -0.1, 0.42);
    s.quadraticCurveTo(-0.07, 0.16, -0.16, 0);
    s.closePath();
  }, 0.03);
  dorsal.translate(0, topAt(0.05) - 0.05, 0);

  const secondDorsal = sideFin((s) => {
    s.moveTo(-0.52, 0);
    s.quadraticCurveTo(-0.57, 0.06, -0.66, 0.1);
    s.lineTo(-0.63, 0);
    s.closePath();
  }, 0.016);
  secondDorsal.translate(0, topAt(-0.58) - 0.02, 0);

  const anal = sideFin((s) => {
    s.moveTo(-0.56, 0);
    s.quadraticCurveTo(-0.6, -0.05, -0.69, -0.09);
    s.lineTo(-0.66, 0);
    s.closePath();
  }, 0.016);
  anal.translate(0, bottomAt(-0.6) + 0.02, 0);

  const pelvic = sideFin((s) => {
    s.moveTo(-0.26, 0);
    s.quadraticCurveTo(-0.32, -0.07, -0.42, -0.11);
    s.lineTo(-0.38, 0);
    s.closePath();
  }, 0.05);
  pelvic.translate(0, bottomAt(-0.3) + 0.03, 0);

  // Heterocercal tail: the upper lobe longer and swept higher than the lower one.
  const caudal = sideFin((s) => {
    s.moveTo(-0.9, 0.035);
    s.quadraticCurveTo(-1.04, 0.24, -1.3, 0.52);
    s.quadraticCurveTo(-1.13, 0.14, -1.09, 0);
    s.quadraticCurveTo(-1.12, -0.13, -1.22, -0.33);
    s.quadraticCurveTo(-1.02, -0.15, -0.9, -0.035);
    s.closePath();
  }, 0.024);

  const eyes = [1, -1].map((side) => {
    const eye = new SphereGeometry(0.018, 10, 8);
    const { width, lift } = section(0.89);
    eye.translate(side * width * 0.86, lift + 0.03, 0.78);
    return part(eye, EYE);
  });

  const geometry = mergeGeometries([
    body(),
    part(dorsal, FIN),
    part(secondDorsal, FIN),
    part(anal, FIN),
    part(pelvic, FIN),
    part(caudal, FIN),
    part(pectoral(1), FIN),
    part(pectoral(-1), FIN),
    ...eyes,
  ]);
  if (!geometry) throw new Error("Shark parts could not be merged");
  geometry.computeBoundingSphere();
  return geometry;
}
