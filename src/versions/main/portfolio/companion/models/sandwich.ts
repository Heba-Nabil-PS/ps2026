import { BufferGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, Matrix4, MeshStandardMaterial, PlaneGeometry, Quaternion, SphereGeometry, Vector3 } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { group, lathe, matte, mottle, part, physical, roughen, type CompanionModel } from "../kit";

/** The top bun's profile (radius, height): a low, wide dome. */
const DOME: [number, number][] = [
  [0, 0],
  [0.6, 0],
  [0.65, 0.05],
  [0.66, 0.12],
  [0.62, 0.24],
  [0.53, 0.35],
  [0.38, 0.44],
  [0.2, 0.49],
  [0, 0.5],
];

/** The dome's radius at height y, read off its profile. */
function domeRadius(y: number) {
  for (let i = 2; i < DOME.length; i++) {
    const [r0, y0] = DOME[i - 1];
    const [r1, y1] = DOME[i];
    if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
  }
  return 0;
}

/** Baked colour: paler at the base of a bun, deeper on its crown. */
function bake(geometry: BufferGeometry, base: string, crown: string, from: number, to: number) {
  const position = geometry.getAttribute("position");
  const a = new Color(base);
  const b = new Color(crown);
  const c = new Color();
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    c.copy(a).lerp(b, Math.min(1, Math.max(0, (position.getY(i) - from) / (to - from))));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Sesame seeds scattered over the dome, each lying flat on the surface (seeded, so every visit matches). */
function sesame(count: number) {
  let seed = 7;
  const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const seeds: BufferGeometry[] = [];
  const up = new Vector3(0, 1, 0);
  for (let i = 0; i < count; i++) {
    const y = 0.14 + random() * 0.34;
    const angle = random() * Math.PI * 2;
    const r = domeRadius(y) + 0.004;
    const at = new Vector3(Math.cos(angle) * r, y, Math.sin(angle) * r);
    const normal = new Vector3(at.x, (y - 0.05) * 1.8, at.z).normalize();
    const lie = new Quaternion().setFromUnitVectors(up, normal).multiply(new Quaternion().setFromAxisAngle(up, random() * Math.PI));
    seeds.push(new SphereGeometry(1, 8, 6).applyMatrix4(new Matrix4().compose(at, lie, new Vector3(0.028, 0.009, 0.016))));
  }
  return mergeGeometries(seeds)!;
}

/** A ruffled lettuce leaf: a thin disc whose rim waves up and down. */
function lettuce() {
  const geometry = new CylinderGeometry(0.7, 0.7, 0.025, 96, 1);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);
    const r = Math.hypot(x, z);
    const angle = Math.atan2(z, x);
    const edge = Math.max(0, (r - 0.4) / 0.3);
    const grow = 1 + 0.05 * Math.sin(angle * 7);
    position.setXYZ(i, x * grow, position.getY(i) + Math.sin(angle * 13) * 0.04 * edge, z * grow);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** A slice of cheese, melting: flat in the middle, its corners drooping over the edge. */
function cheese(turn: number) {
  const geometry = new PlaneGeometry(1.14, 1.14, 40, 40);
  geometry.rotateX(-Math.PI / 2);
  geometry.rotateY(turn);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const r = Math.hypot(position.getX(i), position.getZ(i));
    position.setY(i, -(Math.max(0, r - 0.46) ** 1.6) * 1.1);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** A breaded chicken fillet: a wide, craggy, golden puck. */
function fillet() {
  const geometry = lathe(
    [
      [0, -0.13],
      [0.6, -0.13],
      [0.72, -0.08],
      [0.76, 0],
      [0.72, 0.09],
      [0.6, 0.13],
      [0, 0.13],
    ],
    96,
  );
  geometry.scale(1.1, 1, 0.95);
  roughen(geometry, 0.05, 3.2);
  roughen(geometry, 0.02, 9);
  return mottle(geometry, "#cf8630", "#7a3c0e", 5);
}

/** Texas Chicken — the crispy chicken sandwich: sesame bun, lettuce, tomato, melted cheese and a fried fillet. */
export default function sandwich(): CompanionModel {
  const bun = new MeshStandardMaterial({ vertexColors: true, roughness: 0.5 });
  const melted = physical({ color: "#f29c0c", roughness: 0.3, clearcoat: 0.45, side: DoubleSide });
  const tomato = physical({ color: "#d4392a", roughness: 0.3, clearcoat: 0.5 });
  const tomatoes = [
    [0.42, 0.26],
    [-0.36, 0.34],
    [0.06, -0.46],
  ].map(([x, z]) => part(new CylinderGeometry(0.2, 0.2, 0.05, 32), tomato, { at: [x, -0.16, z] }));

  return {
    object: group(
      [
        part(
          bake(
            lathe([
              [0, 0],
              [0.58, 0],
              [0.63, 0.03],
              [0.64, 0.09],
              [0.6, 0.13],
              [0, 0.13],
            ]),
            "#e7ab5c",
            "#b8702a",
            0,
            0.13,
          ),
          bun,
          { at: [0, -0.64, 0] },
        ),
        part(cheese(Math.PI / 4), melted, { at: [0, -0.5, 0] }),
        part(fillet(), new MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }), { at: [0, -0.37, 0] }),
        part(cheese(0.3), melted, { at: [0, -0.21, 0] }),
        ...tomatoes,
        part(lettuce(), matte("#77b03c", 0.55), { at: [0, -0.12, 0] }),
        part(bake(lathe(DOME, 72), "#e2a253", "#a95e1d", 0.05, 0.5), bun, { at: [0, -0.1, 0] }),
        part(sesame(70), matte("#f6ead0", 0.6), { at: [0, -0.1, 0] }),
      ],
      { turn: [0.32, 0.4, 0] },
    ),
  };
}
