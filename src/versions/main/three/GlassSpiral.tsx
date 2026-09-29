"use client";

import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type GlassSpiralProps = {
  /** 0 → 1 as the hero scrolls away; twists and opens the spiral. */
  progress: RefObject<number>;
  /** Normalised pointer (−1 → 1) from the hero section. */
  pointer: RefObject<{ x: number; y: number }>;
  /** Render loop runs only while the hero is on screen. */
  active: boolean;
  /** Fewer discs and a lower pixel ratio on small screens. */
  lite?: boolean;
  /** Reduced motion: a single still frame. */
  still?: boolean;
  /** RTL mirrors the composition. */
  mirror?: boolean;
};

/**
 * The hero's one sculptural form (principle P2), after the moodboard's blue
 * glass disc spiral: thin glossy discs stacked along a curved spine. A slow
 * wave runs through them, scroll twists and spreads them, and the whole form
 * leans toward the pointer. One instanced mesh, one material, no textures.
 */
function Spiral({ progress, pointer, lite, still, mirror }: Omit<GlassSpiralProps, "active">) {
  // Few enough discs that the gaps between them read, like the moodboard sculpture.
  const count = lite ? 18 : 26;
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const tangent = useMemo(() => new THREE.Vector3(), []);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const align = useMemo(() => new THREE.Quaternion(), []);
  const tilt = useMemo(() => new THREE.Quaternion(), []);
  const axis = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const eased = useRef({ progress: 0, x: 0, y: 0 });
  const geometry = useMemo(() => new THREE.CylinderGeometry(1, 1, 0.07, 72, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color("#3f8fd0"),
        metalness: 0.45,
        roughness: 0.18,
        clearcoat: 1,
        clearcoatRoughness: 0.08,
        iridescence: 0.3,
        iridescenceIOR: 1.35,
        envMapIntensity: 0.95,
        transparent: true,
        opacity: 0.9,
      }),
    [],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-3.4, -2.6, -0.6),
        new THREE.Vector3(-1.6, -0.6, 0.6),
        new THREE.Vector3(0.4, 0.5, 0.2),
        new THREE.Vector3(2.2, 1.6, -0.8),
        new THREE.Vector3(3.6, 3.4, -0.2),
      ]),
    [],
  );

  useFrame((state, delta) => {
    if (!mesh.current || !group.current) return;
    const e = eased.current;
    const k = still ? 1 : 1 - Math.pow(0.001, delta);
    e.progress += ((progress.current ?? 0) - e.progress) * k * 0.9;
    e.x += ((pointer.current?.x ?? 0) - e.x) * k * 0.6;
    e.y += ((pointer.current?.y ?? 0) - e.y) * k * 0.6;

    const time = still ? 1.2 : state.clock.elapsedTime;
    const spread = 1 + e.progress * 0.55;

    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const point = curve.getPointAt(t);
      curve.getTangentAt(t, tangent);

      dummy.position.set(point.x * spread, point.y * spread, point.z);
      // Disc faces follow the spine…
      align.setFromUnitVectors(up, tangent);
      // …then each one fans over like a shingle, with a wave travelling through.
      const wave = Math.sin(time * 0.9 - t * 7.5) * 0.32;
      tilt.setFromAxisAngle(axis, 1.05 + wave + e.progress * 1.4 * t);
      dummy.quaternion.copy(align).multiply(tilt);

      const scale = 0.55 + Math.sin(t * Math.PI) * 0.75;
      dummy.scale.set(scale, 1, scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;

    const g = group.current;
    g.rotation.y = (mirror ? -1 : 1) * (-0.35 + e.x * 0.35 + e.progress * 0.9) + (still ? 0 : Math.sin(time * 0.15) * 0.08);
    g.rotation.x = 0.15 - e.y * 0.2 + e.progress * 0.3;
    g.rotation.z = (mirror ? 1 : -1) * 0.12;
    // Sits high, so it grazes the title instead of covering it.
    g.position.set(mirror ? -0.4 : 0.4, 0.9 + e.progress * 1.6, 0);
  });

  return (
    <group ref={group} scale={mirror ? [-1, 1, 1] : [1, 1, 1]}>
      <instancedMesh ref={mesh} args={[geometry, material, count]} frustumCulled={false} />
    </group>
  );
}

export default function GlassSpiral({ active, lite, still, ...props }: GlassSpiralProps) {
  const environment = useRef<THREE.Texture | null>(null);
  useEffect(() => () => environment.current?.dispose(), []);

  // Soft studio reflections without loading an HDR file.
  const onCreated = ({ gl, scene }: RootState) => {
    const pmrem = new THREE.PMREMGenerator(gl);
    environment.current = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = environment.current;
    pmrem.dispose();
  };

  return (
    <Canvas
      aria-hidden
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      frameloop={still ? "demand" : active ? "always" : "never"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 11.5], fov: 36 }}
      style={{ pointerEvents: "none" }}
      onCreated={onCreated}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[-4, 6, 4]} intensity={1.6} color="#c3e1f3" />
      <directionalLight position={[5, -3, -6]} intensity={2.4} color="#8cc4e6" />
      <Spiral lite={lite} still={still} {...props} />
    </Canvas>
  );
}
