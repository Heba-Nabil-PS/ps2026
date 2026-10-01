"use client";

import { useEffect, useRef } from "react";
import {
  Color,
  IcosahedronGeometry,
  Mesh,
  PerspectiveCamera,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

const vertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
varying float vDisplace;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  vec3 p = position;
  float wave = sin(p.x * 3.1 + uTime * 0.9) * sin(p.y * 2.7 + uTime * 1.1) * sin(p.z * 3.4 + uTime * 0.7);
  float pull = dot(normalize(p.xy), uPointer) * 0.12;
  float d = wave * 0.22 + pull;
  vDisplace = d;
  vec3 displaced = p + normal * d;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
varying float vDisplace;
varying vec3 vNormal;
varying vec3 vView;

void main() {
  float fresnel = pow(1.0 - max(dot(vNormal, vView), 0.0), 2.2);
  vec3 base = mix(uColorB, uColorA, smoothstep(-0.2, 0.25, vDisplace));
  vec3 color = base + fresnel * uColorA * 0.9;
  gl_FragColor = vec4(color, 1.0);
}`;

/** A slowly breathing sculpture that leans toward the pointer. Owns and fully disposes its WebGL resources. */
export default function Scene3D({ accent, tone }: { accent: string; tone: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;opacity:0;transition:opacity 900ms ease";
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 6);

    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new Vector2() },
      uColorA: { value: new Color(accent) },
      uColorB: { value: new Color(tone).offsetHSL(0, 0, 0.06) },
    };
    const geometry = new IcosahedronGeometry(1.25, 64);
    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const pointer = new Vector2();
    const startedAt = performance.now();
    let frame = 0;
    let visible = false;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = container;
      renderer.setSize(w, h, false);
      camera.aspect = w / Math.max(h, 1);
      camera.position.z = camera.aspect < 1 ? 8 : 6;
      camera.updateProjectionMatrix();
    };

    const render = () => {
      const t = (performance.now() - startedAt) / 1000;
      uniforms.uTime.value = t;
      uniforms.uPointer.value.lerp(pointer, 0.06);
      mesh.rotation.y += (pointer.x * 0.6 + t * 0.08 - mesh.rotation.y) * 0.04;
      mesh.rotation.x += (-pointer.y * 0.4 - mesh.rotation.x) * 0.04;
      renderer.render(scene, camera);
      if (visible) frame = requestAnimationFrame(render);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1));
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) frame = requestAnimationFrame(render);
    });
    intersection.observe(container);
    window.addEventListener("pointermove", onPointer, { passive: true });

    resize();
    renderer.render(scene, camera);
    requestAnimationFrame(() => (renderer.domElement.style.opacity = "1"));

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener("pointermove", onPointer);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, [accent, tone]);

  return <div ref={host} className="absolute inset-0" />;
}
