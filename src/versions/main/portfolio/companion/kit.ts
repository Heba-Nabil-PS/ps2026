import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  LatheGeometry,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  Points,
  Vector2,
  type Material,
  type MeshPhysicalMaterialParameters,
  type Object3D,
} from "three";

/**
 * A 3D companion: the object, plus an optional per-frame hook for its own life (a tail beat, a wobble).
 * `ambient` is anything it leaves in the water rather than carries (a wake, bubbles): drawn in the
 * scene's own space, untouched by the object's pose, and freed with it.
 */
export type CompanionModel = {
  object: Object3D;
  ambient?: Object3D;
  /** `height` is the canvas height in device pixels, for anything sized in screen space (points). */
  update?: (frame: { time: number; beat: number; dt: number; height: number }) => void;
};

type Triple = [number, number, number];
type Place = { at?: Triple; turn?: Triple; size?: Triple | number };

/** A turned solid from a (radius, height) profile drawn bottom to top. */
export const lathe = (profile: [number, number][], segments = 64) =>
  new LatheGeometry(
    profile.map(([r, y]) => new Vector2(Math.max(r, 0.0001), y)),
    segments,
  );

export const matte = (color: string, roughness = 0.65) => new MeshStandardMaterial({ color, roughness, metalness: 0 });
export const metal = (color: string, roughness = 0.25) => new MeshStandardMaterial({ color, roughness, metalness: 1 });
export const physical = (params: MeshPhysicalMaterialParameters) => new MeshPhysicalMaterial(params);

/** Clear glass or plastic: drawn after what it holds, never hiding it. */
export const glass = (color = "#ffffff", opacity = 0.25) =>
  new MeshPhysicalMaterial({ color, transparent: true, opacity, roughness: 0.05, clearcoat: 1, depthWrite: false, side: DoubleSide });

function place<T extends Object3D>(object: T, { at, turn, size }: Place) {
  if (at) object.position.set(...at);
  if (turn) object.rotation.set(...turn);
  if (typeof size === "number") object.scale.setScalar(size);
  else if (size) object.scale.set(...size);
  return object;
}

export function part(geometry: BufferGeometry, material: Material, where: Place = {}) {
  const mesh = place(new Mesh(geometry, material), where);
  if (material.transparent) mesh.renderOrder = 2;
  return mesh;
}

export function group(parts: Object3D[], where: Place = {}) {
  const g = new Group();
  g.add(...parts);
  return place(g, where);
}

/** Cheap, seamless 3D value noise in -1…1 — the same position always gets the same value. */
export function noise(x: number, y: number, z: number) {
  return (
    Math.sin(x * 12.9 + y * 7.3) * Math.sin(y * 11.1 + z * 9.7) * Math.sin(z * 13.7 + x * 5.3) * 0.6 +
    Math.sin(x * 31.7 - z * 23.1) * Math.sin(y * 27.3 + x * 19.9) * 0.4
  );
}

/** Pushes the surface in and out along its normals — crust, dough, stone. */
export function roughen(geometry: BufferGeometry, amount: number, scale = 1, where: (y: number) => number = () => 1) {
  const position = geometry.getAttribute("position");
  const normal = geometry.getAttribute("normal");
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const d = noise(x * scale, y * scale, z * scale) * amount * where(y);
    position.setXYZ(i, x + normal.getX(i) * d, y + normal.getY(i) * d, z + normal.getZ(i) * d);
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Mottles a surface between two colours by noise (use with `vertexColors: true`). */
export function mottle(geometry: BufferGeometry, from: string, to: string, scale = 1) {
  const position = geometry.getAttribute("position");
  const a = new Color(from);
  const b = new Color(to);
  const c = new Color();
  const colors = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const n = noise(position.getX(i) * scale, position.getY(i) * scale, position.getZ(i) * scale) * 0.5 + 0.5;
    c.copy(a).lerp(b, n * n);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return geometry;
}

/** Frees every geometry, material and texture under an object. */
export function dispose(object: Object3D) {
  object.traverse((child) => {
    if (!(child instanceof Mesh || child instanceof Points)) return;
    child.geometry.dispose();
    for (const material of [child.material].flat() as Material[]) {
      for (const value of Object.values(material)) if (value && typeof value === "object" && "isTexture" in value) value.dispose();
      material.dispose();
    }
  });
}
