"use client";

import { calmBehindPage, scrollMotion } from "@/versions/main/motion/scroll-motion";
import { layoutLogoParticles, LOGO_SIZE } from "@/versions/main/three/logo-particles";
import { DISC_FRAGMENT, DISC_VERTEX } from "@/versions/main/three/logo-particles.glsl";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, type RefObject } from "react";
import {
  BufferAttribute,
  DoubleSide,
  Euler,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MathUtils,
  Matrix3,
  Matrix4,
  Mesh,
  PerspectiveCamera,
  ShaderMaterial,
  Vector2,
  Vector3,
} from "three";

export type PointerState = {
  /** −1 → 1 from the middle of the view; y points up. */
  x: number;
  y: number;
  /** True while a mouse is over the page. */
  active: boolean;
};

export type LogoParticleSystemProps = {
  pointer: RefObject<PointerState>;
  /** 0 → 1: the field gathering into view (the entrance). */
  reveal: RefObject<number>;
  /** Distance between discs: 1 is the full set, larger spreads them out for small screens. */
  spacing?: number;
  /** Reduced motion: no drift, no easing. */
  still?: boolean;
};

/** How much of the view the formed logo may fill. */
const FIT = { width: 0.86, height: 0.7 };
/** Depth of field: how much a disc softens per unit of distance from the logo's plane (scene units). */
const BLUR = 0.45;

/** Towards each light, in view space (x right, y up, z towards the viewer). */
const KEY_LIGHT = new Vector3(-0.46, 0.62, 0.64).normalize();
const FILL_LIGHT = new Vector3(0.7, -0.36, 0.62).normalize();

function createField(spacing: number) {
  const particles = layoutLogoParticles(spacing);

  // One square, drawn once per disc.
  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
  geometry.setIndex([0, 1, 2, 0, 2, 3]);
  geometry.setAttribute("aTarget", new InstancedBufferAttribute(particles.target, 4));
  geometry.setAttribute("aLine", new InstancedBufferAttribute(particles.line, 4));
  geometry.setAttribute("aSeed", new InstancedBufferAttribute(particles.seed, 4));
  geometry.instanceCount = particles.count;

  const uniforms = {
    uTime: { value: 0 },
    uPage: { value: 0 },
    uForm: { value: 0 },
    uRelease: { value: 0 },
    uReveal: { value: 0 },
    uCalm: { value: 0 },
    uFrustum: { value: new Vector2(1, 1) },
    uDistance: { value: 20 },
    uPixels: { value: 1000 },
    uLogo: { value: new Matrix3() },
    uLogoOrigin: { value: new Vector3() },
    uPointer: { value: new Vector3() },
    uBlur: { value: BLUR },
    uKey: { value: KEY_LIGHT },
    uFill: { value: FILL_LIGHT },
  };

  // No depth test: discs are drawn in the order they sit along the line, so each coil covers the one before it.
  const material = new ShaderMaterial({
    vertexShader: DISC_VERTEX,
    fragmentShader: DISC_FRAGMENT,
    uniforms,
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
    side: DoubleSide,
    toneMapped: false,
  });

  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  mesh.visible = false;

  return {
    mesh,
    uniforms,
    /** Set once the shader is compiled; the mesh stays hidden until then. */
    compiled: false,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}

/** Frame-rate independent easing towards a target. */
const ease = (from: number, to: number, rate: number, delta: number) => from + (to - from) * (1 - Math.exp(-rate * delta));

/** How far the logo's centre has risen (scene units) at a point in its travel: it moves up with the page, more slowly. */
export const logoLift = (travel: number) => (travel - 0.5) * 1.5;

/**
 * The logo as a living field of discs (React Three Fiber; render it inside a <Canvas>).
 *
 * Thousands of discs from the brand pattern float through the depth of the view.
 * As the hero scrolls (`scrollMotion`, written by ScrollAnimationController) they
 * gather along the logo's line until they draw it exactly, travel with the scroll
 * while it holds, then let go again. One instanced mesh and one shader: this
 * component only feeds it a few numbers each frame.
 */
export function LogoParticleSystem({ pointer, reveal, spacing = 1, still = false }: LogoParticleSystemProps) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const field = useRef<ReturnType<typeof createField> | null>(null);
  // Eased copies, so nothing snaps.
  const eased = useRef({ time: 40, speed: 1, page: 0, x: 0, y: 0, influence: 0 });
  const turn = useRef({ euler: new Euler(), matrix: new Matrix4() });

  useEffect(() => {
    const created = createField(spacing);
    field.current = created;
    scene.add(created.mesh);
    // The shader compiles in the background where the browser allows it, so nothing stutters when the discs first show.
    const show = () => {
      created.compiled = true;
      invalidate();
    };
    gl.compileAsync(scene, camera).then(show, show);
    return () => {
      scene.remove(created.mesh);
      created.dispose();
      field.current = null;
    };
  }, [gl, scene, camera, invalidate, spacing]);

  useFrame((state, delta) => {
    const current = field.current;
    if (!current || !state.size.height) return;
    const u = current.uniforms;
    const e = eased.current;
    const step = Math.min(delta, 0.05); // a background tab must not jump the motion when it returns

    // Fit: the camera backs away until the logo sits inside the view, whatever its shape.
    const camera = state.camera as PerspectiveCamera;
    const tan = Math.tan(MathUtils.degToRad(camera.fov / 2));
    const aspect = state.size.width / state.size.height;
    const distance = Math.max(LOGO_SIZE.height / FIT.height, LOGO_SIZE.width / FIT.width / aspect) / (2 * tan);
    if (Math.abs(camera.position.z - distance) > 0.001) {
      camera.position.set(0, 0, distance);
      camera.near = distance * 0.05;
      camera.far = distance * 4;
      camera.updateProjectionMatrix();
    }
    u.uFrustum.value.set(tan * aspect, tan);
    u.uDistance.value = distance;
    u.uPixels.value = (state.size.height * state.viewport.dpr) / (2 * tan);

    const target = pointer.current;
    if (still) {
      e.page = scrollMotion.page;
    } else {
      // Scrolling quickens the drift, up to about double at a brisk scroll, and it eases back afterwards.
      const hurry = 1 + Math.min(Math.abs(scrollMotion.velocity) / 1400, 1.2);
      e.speed = ease(e.speed, hurry, hurry > e.speed ? 7 : 2, step);
      e.time += step * e.speed;
      e.page = ease(e.page, scrollMotion.page, 9, step);
      e.x = ease(e.x, target.x, 3.5, step);
      e.y = ease(e.y, target.y, 3.5, step);
      e.influence = ease(e.influence, target.active ? 1 : 0, 2.5, step);
    }
    u.uTime.value = e.time;
    u.uPage.value = e.page;
    u.uPointer.value.set(e.x, e.y, e.influence);
    u.uForm.value = scrollMotion.form;
    u.uRelease.value = scrollMotion.release;
    u.uReveal.value = still ? 1 : reveal.current;
    // Behind the rest of the page the field goes quieter. A still frame stays behind all of it, so it is quiet throughout.
    u.uCalm.value = still ? 0.7 : calmBehindPage(e.page);
    // Nothing to draw until the entrance starts (the intro is still covering the page).
    current.mesh.visible = current.compiled && u.uReveal.value > 0.001;

    // State 3: the logo travels with the scroll. It turns through facing the viewer while it holds, rises more
    // slowly than the page, comes a little closer, and leans to the pointer.
    const travel = scrollMotion.travel;
    const { euler, matrix } = turn.current;
    euler.set(MathUtils.lerp(0.16, -0.14, travel) - e.y * e.influence * 0.07, MathUtils.lerp(-0.5, 0.45, travel) + e.x * e.influence * 0.1, 0);
    u.uLogo.value.setFromMatrix4(matrix.makeRotationFromEuler(euler)).multiplyScalar(MathUtils.lerp(0.92, 1.1, travel));
    u.uLogoOrigin.value.set(0, logoLift(travel), 0);
  });

  return null;
}
