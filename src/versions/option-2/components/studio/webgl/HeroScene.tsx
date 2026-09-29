"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { FlowLines } from "./FlowLines";
import { usePointer, type PointerState } from "./usePointer";

export type HeroSceneProps = {
  /** 0 → 1 as the hero scrolls out of view. */
  progress: RefObject<number>;
  /** Pauses rendering while the hero is off screen. */
  active: boolean;
  /** Fewer bodies and a lower pixel ratio for small screens. */
  lite?: boolean;
  reduced?: boolean;
};

type Body = {
  home: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  radius: number;
  kind: 0 | 1 | 2;
  phase: number;
};

/** Deterministic PRNG so the composition is identical on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createBodies(count: number): Body[] {
  const random = mulberry32(2026);
  const bodies: Body[] = [];
  for (let i = 0; i < count; i++) {
    // Flattened ellipsoid cluster, biased towards the right of the frame.
    const theta = random() * Math.PI * 2;
    const r = Math.pow(random(), 0.6) * 3.4;
    const home = new THREE.Vector3(
      Math.cos(theta) * r * 1.35 + 1.4,
      Math.sin(theta) * r * 0.85 + 0.2,
      (random() - 0.5) * 2.4,
    );
    const radius = i < 3 ? 0.95 - i * 0.12 : 0.22 + Math.pow(random(), 2) * 0.55;
    const kindRoll = random();
    const kind: Body["kind"] = kindRoll < 0.5 ? 0 : kindRoll < 0.86 ? 1 : 2;
    bodies.push({
      home,
      position: home.clone().multiplyScalar(2.2).add(new THREE.Vector3(0, -6, 0)),
      velocity: new THREE.Vector3(),
      radius,
      kind,
      phase: random() * Math.PI * 2,
    });
  }
  return bodies;
}

const materials = () => [
  // Ink — deep glossy black
  new THREE.MeshPhysicalMaterial({ color: "#10233b", roughness: 0.16, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
  // Paper — satin white
  new THREE.MeshPhysicalMaterial({ color: "#f3f4f6", roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.2 }),
  // Brand — PSdigital soft blue
  new THREE.MeshPhysicalMaterial({ color: "#88bbd8", roughness: 0.22, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.1 }),
];

function Environment() {
  const get = useThree((state) => state.get);
  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new THREE.PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const texture = pmrem.fromScene(room, 0.04).texture;
    scene.environment = texture;
    return () => {
      scene.environment = null;
      texture.dispose();
      pmrem.dispose();
      room.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          (object.material as THREE.Material).dispose();
        }
      });
    };
  }, [get]);
  return null;
}

const tmp = new THREE.Object3D();
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();
const hit = new THREE.Vector3();
const target = new THREE.Vector3();
const delta = new THREE.Vector3();
const ndc = new THREE.Vector2();
const offscreen = new THREE.Vector3(100, 100, 0);

function Orbs({ progress, lite, reduced, pointer }: Omit<HeroSceneProps, "active"> & { pointer: RefObject<PointerState> }) {
  const count = lite ? 22 : 38;
  // Instance counts per material; the mutable simulation lives in a ref.
  const counts = useMemo(() => [0, 1, 2].map((kind) => createBodies(count).filter((body) => body.kind === kind).length), [count]);
  const mats = useMemo(() => materials(), []);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, lite ? 32 : 48, lite ? 24 : 36), [lite]);
  const sim = useRef<{ bodies: Body[]; groups: Body[][] } | null>(null);
  const meshes = useRef<(THREE.InstancedMesh | null)[]>([]);
  const group = useRef<THREE.Group>(null);
  const cursor = useRef(new THREE.Vector3(100, 100, 0));

  useEffect(
    () => () => {
      geometry.dispose();
      mats.forEach((material) => material.dispose());
    },
    [geometry, mats],
  );

  useFrame((state, rawDelta) => {
    const dt = Math.min(rawDelta, 1 / 30);
    const time = state.clock.elapsedTime;
    const scroll = progress.current ?? 0;
    const p = pointer.current;
    const camera = state.camera;
    if (!sim.current || sim.current.bodies.length !== count) {
      const created = createBodies(count);
      sim.current = { bodies: created, groups: [0, 1, 2].map((kind) => created.filter((body) => body.kind === kind)) };
    }
    const { bodies, groups } = sim.current;

    // Camera drifts with the pointer and dollies in as the page scrolls.
    const camTargetX = reduced ? 0 : p.x * 0.8;
    const camTargetY = reduced ? 0 : p.y * 0.5 - scroll * 1.5;
    camera.position.x += (camTargetX - camera.position.x) * 0.04;
    camera.position.y += (camTargetY - camera.position.y) * 0.04;
    camera.position.z += (13 - scroll * 5 - camera.position.z) * 0.08;
    camera.lookAt(0.6, -scroll * 0.8, 0);

    if (group.current) {
      group.current.rotation.z = Math.sin(time * 0.15) * 0.05 + scroll * 0.35;
      group.current.rotation.y = scroll * 0.9;
    }

    // Project the pointer onto the z = 0 plane in world space.
    if (p.active && !reduced) {
      raycaster.setFromCamera(ndc.set(p.x, p.y), camera);
      if (raycaster.ray.intersectPlane(plane, hit)) cursor.current.lerp(hit, 0.35);
    } else {
      cursor.current.lerp(offscreen, 0.05);
    }

    const scatter = 1 + scroll * 1.8;
    for (const body of bodies) {
      // Spring towards a slowly breathing home position.
      target
        .copy(body.home)
        .multiplyScalar(scatter)
        .add(delta.set(Math.sin(time * 0.6 + body.phase) * 0.18, Math.cos(time * 0.5 + body.phase) * 0.22, 0));
      delta.subVectors(target, body.position).multiplyScalar(reduced ? 20 : 3.2);
      body.velocity.addScaledVector(delta, dt);

      // Pointer repulsion.
      delta.subVectors(body.position, cursor.current);
      delta.z *= 0.4;
      const distance = delta.length();
      const reach = 1.6 + body.radius;
      if (distance < reach && distance > 0.0001) {
        const force = (1 - distance / reach) * 34;
        body.velocity.addScaledVector(delta.normalize(), force * dt);
      }
    }

    // Soft sphere-sphere collisions keep the cluster tactile.
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        delta.subVectors(a.position, b.position);
        const min = a.radius + b.radius;
        const distSq = delta.lengthSq();
        if (distSq < min * min && distSq > 0.00001) {
          const dist = Math.sqrt(distSq);
          const push = (min - dist) * 0.5;
          delta.divideScalar(dist);
          a.position.addScaledVector(delta, push);
          b.position.addScaledVector(delta, -push);
          a.velocity.addScaledVector(delta, push * 2);
          b.velocity.addScaledVector(delta, -push * 2);
        }
      }
    }

    for (const body of bodies) {
      body.velocity.multiplyScalar(Math.pow(0.12, dt));
      body.position.addScaledVector(body.velocity, dt);
    }

    groups.forEach((list, kind) => {
      const mesh = meshes.current[kind];
      if (!mesh) return;
      list.forEach((body, index) => {
        tmp.position.copy(body.position);
        tmp.scale.setScalar(body.radius);
        tmp.updateMatrix();
        mesh.setMatrixAt(index, tmp.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true;
    });
  });

  return (
    <group ref={group}>
      {counts.map((instances, kind) => (
        <instancedMesh
          key={`${kind}-${instances}`}
          ref={(mesh) => {
            meshes.current[kind] = mesh;
          }}
          args={[geometry, mats[kind], instances]}
          frustumCulled={false}
        />
      ))}
    </group>
  );
}

export default function HeroScene({ progress, active, lite, reduced }: HeroSceneProps) {
  const pointer = usePointer();

  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 13], fov: 32, near: 0.1, far: 60 }}
      aria-hidden
    >
      <Environment />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 8, 6]} intensity={2.2} />
      <directionalLight position={[-6, -3, 2]} intensity={0.6} color="#88bbd8" />
      <FlowLines progress={progress} lite={lite} reduced={reduced} pointer={pointer} />
      <Orbs progress={progress} lite={lite} reduced={reduced} pointer={pointer} />
    </Canvas>
  );
}
