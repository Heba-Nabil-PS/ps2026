"use client";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useEffect, useRef } from "react";
import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  DirectionalLight,
  Group,
  HemisphereLight,
  PerspectiveCamera,
  PMREMGenerator,
  Scene,
  Sphere,
  Vector3,
  WebGLRenderer,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { dispose, type CompanionModel } from "./kit";
import type { Mood, Motion } from "./registry";

const CAMERA_Z = 10;
const FOV = 30;

/**
 * The scroll-driven pose. `glue` 1 = locked onto the anchor artwork; 0 = free on the screen
 * path. x/y run -1…1 across the viewport, `size` is the object's diameter as a share of the
 * viewport's shorter side, angles are radians (yaw 0 = facing the viewer), `spin` adds turns.
 */
type Pose = {
  glue: number;
  x: number;
  y: number;
  z: number;
  size: number;
  yaw: number;
  pitch: number;
  roll: number;
  spin: number;
  fade: number;
  veil: number;
};

/** Where the object sits on its anchor (fractions of the anchor box) and how big it reads there. */
type Seat = { x: number; y: number; size: number };

type Choreography = {
  seat: Seat;
  start: string;
  pose: Pose;
  build: (path: gsap.core.Timeline, pose: Pose, side: () => number) => void;
};

const rest: Pose = { glue: 1, x: 0, y: 0, z: 0, size: 0.3, yaw: 0, pitch: 0, roll: 0, spin: 0, fade: 1, veil: 0 };

const choreographies: Record<Motion, Choreography> = {
  // Takes the place of a creature painted in the artwork, then swims the page.
  swim: {
    seat: { x: 0.5, y: 0.74, size: 1.1 },
    start: "center 62%",
    // Seen from behind and above, heading into the picture (nose tipped away and up, back to the viewer).
    pose: { ...rest, size: 0.5, yaw: Math.PI, pitch: -0.62, fade: 0 },
    build: (path, pose, side) =>
      path
        // The painted one dissolves into the water as this one takes its place…
        .to(pose, { fade: 1, veil: 1, duration: 0.05, ease: "none" }, 0)
        // …breaches, nose lifting out of the frame toward the viewer…
        .to(pose, { pitch: -1.1, z: 1.6, y: 0.08, size: 0.5, duration: 0.12, ease: "power2.out" }, 0.03)
        .to(pose, { glue: 0, duration: 0.2, ease: "power2.inOut" }, 0.04)
        // …turns to face us, close and large…
        .to(pose, { yaw: 0.18, pitch: 0.12, roll: -0.1, z: 3.2, x: 0, y: 0, size: 0.55, duration: 0.14 }, 0.13)
        // …cruises right, swings back across past the viewer…
        .to(pose, { yaw: Math.PI / 2 + 0.12, pitch: 0, roll: -0.35, z: 0, x: side, y: 0.12, size: 0.36, duration: 0.16 }, 0.27)
        .to(pose, { roll: 0, duration: 0.06 }, 0.43)
        .to(pose, { yaw: -Math.PI / 2 - 0.12, roll: 0.3, x: () => -side(), y: -0.08, z: 0.6, size: 0.4, duration: 0.2 }, 0.47)
        .to(pose, { roll: 0, duration: 0.06 }, 0.67)
        // …and dives away into the deep.
        .to(pose, { yaw: -Math.PI + 0.2, pitch: 0.45, x: 0.1, y: -0.12, z: -3, size: 0.32, duration: 0.16 }, 0.72)
        .to(pose, { z: -16, y: -0.45, pitch: 0.7, duration: 0.14, ease: "power1.in" }, 0.86)
        .to(pose, { fade: 0, duration: 0.06, ease: "none" }, 0.94),
  },
  // Like the shark, it keeps out of the hero: once the story starts it rises from below the screen,
  // then spins down the page from side to side.
  tumble: {
    seat: { x: 0.5, y: 0.4, size: 0.42 },
    start: "top 85%",
    pose: { ...rest, glue: 0, x: 0.3, y: -1.5, z: 1.2, size: 0.3, pitch: 0.1, fade: 0 },
    build: (path, pose, side) =>
      path
        .to(pose, { spin: Math.PI * 8, duration: 1, ease: "none" }, 0)
        .to(pose, { fade: 1, duration: 0.03, ease: "none" }, 0)
        .to(pose, { z: 0.4, x: side, y: 0.12, size: 0.26, duration: 0.2, ease: "power2.out" }, 0)
        .to(pose, { x: () => -side(), y: -0.1, z: 1, duration: 0.18 }, 0.22)
        .to(pose, { x: side, y: 0.1, z: 0.2, duration: 0.18 }, 0.4)
        .to(pose, { x: () => -side(), y: -0.05, z: 0.8, duration: 0.18 }, 0.58)
        .to(pose, { x: () => side() * 0.6, y: 0, z: 0, duration: 0.14 }, 0.76)
        .to(pose, { y: -1.4, z: -2, size: 0.18, duration: 0.1, ease: "power2.in" }, 0.9)
        .to(pose, { fade: 0, duration: 0.05, ease: "none" }, 0.95),
  },
};

function light(scene: Scene, renderer: WebGLRenderer, mood: Mood) {
  if (mood === "deep") {
    // Moonlit water: a cold sky above, a near-black deep below, a hard blue rim from behind.
    scene.add(new HemisphereLight("#5fa8e6", "#02060b", 0.45), new AmbientLight("#0c2235", 0.6));
    const key = new DirectionalLight("#cfe6ff", 1.1);
    key.position.set(2, 5, 6);
    const rim = new DirectionalLight("#4cc3ff", 4);
    rim.position.set(-3, 4, -6);
    scene.add(key, rim);
    return () => {};
  }
  // Studio: a soft room reflected in metal, glass and glaze, with a warm key and a cool rim.
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  scene.environment = environment;
  const key = new DirectionalLight("#fff1e0", 1.6);
  key.position.set(3, 4, 5);
  const rim = new DirectionalLight("#b9dcff", 1.8);
  rim.position.set(-4, 2, -5);
  scene.add(key, rim);
  return () => {
    environment.dispose();
    room.dispose();
    pmrem.dispose();
  };
}

type CompanionSceneProps = {
  build: () => CompanionModel;
  motion: Motion;
  mood: Mood;
  /** The artwork it starts on. */
  anchor: HTMLElement;
  /** Washes out the painted original once the 3D one has left it (swim only). */
  veil: HTMLElement | null;
  /** It travels until this element scrolls past. */
  until: HTMLElement;
};

/**
 * A case study's 3D companion: an object tied to the project that leaves its artwork and travels
 * with the scroll down the story. One fixed, click-through canvas; scroll only moves it along a path.
 */
export default function CompanionScene({ build, motion, mood, anchor, veil, until }: CompanionSceneProps) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    const plan = choreographies[motion];

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 60);
    camera.position.set(0, 0, CAMERA_Z);
    const unlight = light(scene, renderer, mood);

    // Centre the model on its bounding sphere and size it to a unit radius, so every model fits the same path.
    const model = build();
    const bounds = new Box3().setFromObject(model.object).getBoundingSphere(new Sphere());
    const centred = new Group();
    centred.add(model.object);
    centred.position.copy(bounds.center).multiplyScalar(-1);
    const holder = new Group();
    holder.rotation.order = "YXZ";
    holder.add(centred);
    scene.add(holder);
    const unit = 1 / Math.max(bounds.radius, 1e-3);

    const pose: Pose = { ...plan.pose };
    const portrait = () => window.innerWidth < window.innerHeight;
    const side = () => (portrait() ? 0.42 : 0.6);
    const path = gsap.timeline({
      defaults: { ease: "sine.inOut" },
      scrollTrigger: { trigger: anchor, start: plan.start, endTrigger: until, end: "bottom 55%", scrub: 1.1, invalidateOnRefresh: true },
    });
    plan.build(path, pose, side);

    const halfHeight = Math.tan((FOV / 2) * (Math.PI / 180)) * CAMERA_Z;
    const free = new Vector3();
    const held = new Vector3();
    let shown = false;
    let lastYaw = pose.yaw;
    let beat = 0;
    let last = performance.now();

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.updateProjectionMatrix();
    };

    const render = () => {
      if (veil) veil.style.opacity = String(pose.veil);
      const opacity = pose.fade;
      if (opacity < 0.001) {
        if (shown) renderer.domElement.style.opacity = "0";
        shown = false;
        return;
      }
      shown = true;
      renderer.domElement.style.opacity = String(opacity);

      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = now / 1000;

      const w = container.clientWidth;
      const h = container.clientHeight;
      const perPixel = (2 * halfHeight) / h;
      const halfWidth = halfHeight * camera.aspect;
      const loose = 1 - pose.glue;

      // Locked to the artwork: follow it as the page moves.
      const box = anchor.getBoundingClientRect();
      held.set((box.left + box.width * plan.seat.x - w / 2) * perPixel, -(box.top + box.height * plan.seat.y - h / 2) * perPixel, 0);
      const heldRadius = (box.height * plan.seat.size * perPixel) / 2;
      // Free on the screen path, with an idle drift so it never hangs still.
      free.set(pose.x * halfWidth, pose.y * halfHeight + Math.sin(t * 1.1) * 0.06 * loose, pose.z);
      const freeRadius = pose.size * Math.min(halfWidth, halfHeight);

      holder.position.lerpVectors(held, free, loose);
      holder.position.z = pose.z;
      holder.scale.setScalar((heldRadius + (freeRadius - heldRadius) * loose) * unit);

      if (motion === "swim") {
        holder.rotation.set(pose.pitch, pose.yaw + Math.sin(t * 0.7) * 0.05 * loose, pose.roll);
      } else {
        // Turns with the scroll, and keeps a slow turn of its own so it is alive even at rest.
        holder.rotation.set(pose.pitch + Math.sin(pose.spin * 0.5) * 0.35, pose.spin + t * 0.35, pose.roll + Math.cos(pose.spin * 0.35) * 0.25);
      }

      // Life (a tail beat) quickens while it turns, then settles.
      const turning = Math.abs(pose.yaw - lastYaw) / Math.max(dt, 1e-3);
      lastYaw = pose.yaw;
      beat += dt * (2.4 + Math.min(turning * 2.2, 6));
      model.update?.({ time: t, beat });

      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    gsap.ticker.add(render);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(render);
      path.scrollTrigger?.kill();
      path.kill();
      resizeObserver.disconnect();
      if (veil) veil.style.opacity = "0";
      unlight();
      dispose(model.object);
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [build, motion, mood, anchor, veil, until]);

  return <div ref={host} aria-hidden className="pointer-events-none fixed inset-0 z-40" />;
}
