"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { usePointer, type PointerState } from "./usePointer";

export type BlobSceneProps = {
  active: boolean;
  /** 0 → 1: how excited the surface is (driven by hovering the CTA). */
  energy: RefObject<number>;
  /** 0 → 1 as the CTA section scrolls through the viewport. */
  progress: RefObject<number>;
  lite?: boolean;
  reduced?: boolean;
};

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uEnergy;
uniform vec2 uPointer;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisplace;
${noise}

float field(vec3 p){
  float n = snoise(p * 0.9 + vec3(0., uTime * 0.18, uTime * 0.12));
  n += 0.5 * snoise(p * 2.1 - vec3(uTime * 0.25));
  return n * (0.22 + uEnergy * 0.28);
}

vec3 displaced(vec3 p){
  vec3 n = normalize(p);
  // The surface bulges towards the pointer.
  float pull = max(dot(n, normalize(vec3(uPointer, 0.9))), 0.) * 0.18;
  return p + n * (field(p) + pull);
}

void main(){
  vec3 p = displaced(position);
  // Recompute the normal from two neighbouring points on the surface.
  vec3 t = normalize(cross(normal, abs(normal.y) < .99 ? vec3(0.,1.,0.) : vec3(1.,0.,0.)));
  vec3 b = normalize(cross(normal, t));
  float e = 0.01;
  vec3 pt = displaced(position + t * e);
  vec3 pb = displaced(position + b * e);
  vec3 dn = normalize(cross(pt - p, pb - p));
  vNormal = normalize(normalMatrix * dn);
  vec4 mv = modelViewMatrix * vec4(p, 1.);
  vView = normalize(-mv.xyz);
  vDisplace = field(position);
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
uniform float uTime;
uniform vec3 uInk;
uniform vec3 uPaper;
uniform vec3 uAccent;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisplace;

void main(){
  vec3 n = normalize(vNormal);
  float fresnel = pow(1. - max(dot(n, vView), 0.), 2.4);
  vec3 light = normalize(vec3(0.6, 0.8, 0.9));
  float diffuse = max(dot(n, light), 0.);
  float spec = pow(max(dot(reflect(-light, n), vView), 0.), 48.);
  // Banded studio reflections give the black surface its lacquered look.
  float bands = smoothstep(0.45, 0.5, fract(n.y * 2.2 + n.x * 0.6 + uTime * 0.03));
  vec3 color = mix(uInk, uInk + 0.06, diffuse);
  color += bands * 0.05 * (1. - fresnel);
  color = mix(color, uAccent, fresnel * 0.85);
  color += uPaper * spec * 0.9;
  color += uAccent * smoothstep(0.1, 0.4, vDisplace) * 0.18;
  gl_FragColor = vec4(color, 1.);
}`;

function Blob({ energy, progress, lite, reduced, pointer }: Omit<BlobSceneProps, "active"> & { pointer: RefObject<PointerState> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const smooth = useRef({ energy: 0, x: 0, y: 0 });
  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1.6, lite ? 48 : 96), [lite]);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uEnergy: { value: 0 },
          uPointer: { value: new THREE.Vector2() },
          uInk: { value: new THREE.Color("#0e1014") },
          uPaper: { value: new THREE.Color("#f2f3f5") },
          uAccent: { value: new THREE.Color("#88bbd8") },
        },
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

  useFrame((state, delta) => {
    const s = smooth.current;
    const p = pointer.current;
    s.energy += ((energy.current ?? 0) - s.energy) * Math.min(delta * 3, 1);
    s.x += ((reduced ? 0 : p.x) - s.x) * 0.05;
    s.y += ((reduced ? 0 : p.y) - s.y) * 0.05;

    const blob = mesh.current;
    if (!blob) return;
    const { uniforms } = blob.material as THREE.ShaderMaterial;
    uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
    uniforms.uEnergy.value = s.energy;
    (uniforms.uPointer.value as THREE.Vector2).set(s.x, s.y);

    const scroll = progress.current ?? 0;
    blob.rotation.y = s.x * 0.5 + scroll * 1.2;
    blob.rotation.x = -s.y * 0.4;
    blob.position.set(s.x * 0.35, s.y * 0.25 + (0.5 - scroll) * 0.8, 0);
    blob.scale.setScalar(0.75 + Math.min(scroll * 1.4, 1) * 0.3 + s.energy * 0.08);
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

export default function BlobScene({ active, energy, progress, lite, reduced }: BlobSceneProps) {
  const pointer = usePointer();
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 7], fov: 35 }}
      aria-hidden
    >
      <Blob energy={energy} progress={progress} lite={lite} reduced={reduced} pointer={pointer} />
    </Canvas>
  );
}
