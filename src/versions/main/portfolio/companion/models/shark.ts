import { BufferAttribute, BufferGeometry, DynamicDrawUsage, Mesh, MeshPhysicalMaterial, Points, ShaderMaterial, Vector3 } from "three";
import type { CompanionModel } from "../kit";
import { createSharkGeometry } from "./sharkGeometry";

/** GLSL's smoothstep, edges in either order, so the wake can follow the shader's bend exactly. */
function step(a: number, b: number, x: number) {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
}

/** The sideways bend the swim shader gives the body at z (kept in step with the vertex shader below). */
function bend(z: number, beat: number) {
  const tail = step(0.75, -1.3, z);
  return Math.sin(z * 3 - beat) * 0.16 * tail * tail + Math.sin(-beat) * 0.018 * step(0.2, 1, z);
}

const BUBBLES = 640;

/** Where bubbles come off (model space, before the bend) and how readily: the tail lobes most, the fin tips and gills less. */
const EMITTERS: { at: [number, number, number]; rate: number }[] = [
  { at: [0, 0.54, -1.25], rate: 1 },
  { at: [0, -0.44, -1.2], rate: 0.8 },
  { at: [0, 0.78, -0.1], rate: 0.25 },
  { at: [0.68, -0.36, 0], rate: 0.3 },
  { at: [-0.68, -0.36, 0], rate: 0.3 },
  { at: [0.26, 0, 0.45], rate: 0.12 },
  { at: [-0.26, 0, 0.45], rate: 0.12 },
];

/**
 * The bubbles the shark leaves in the water: a ring buffer of points the GPU moves on its own
 * (thrown off with the fin, slowed by the water, then rising and wobbling), so each frame only
 * writes the ones born in it.
 */
function wake() {
  const geometry = new BufferGeometry();
  const origin = new BufferAttribute(new Float32Array(BUBBLES * 3), 3).setUsage(DynamicDrawUsage);
  const velocity = new BufferAttribute(new Float32Array(BUBBLES * 3), 3).setUsage(DynamicDrawUsage);
  // birth, span, diameter, seed — all zero reads as long dead.
  const life = new BufferAttribute(new Float32Array(BUBBLES * 4), 4).setUsage(DynamicDrawUsage);
  geometry.setAttribute("position", origin);
  geometry.setAttribute("aVelocity", velocity);
  geometry.setAttribute("aLife", life);

  const material = new ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uPixels: { value: 1 } },
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uPixels;
      attribute vec3 aVelocity;
      attribute vec4 aLife;
      varying float vFade;
      void main() {
        float age = uTime - aLife.x;
        float t = age / max(aLife.y, 1e-3);
        float live = step(0.0, age) * step(age, aLife.y);
        // Thrown off with the fin and slowed by the water; bigger bubbles rise faster, all of them wobble.
        float drag = (1.0 - exp(-age * 2.5)) / 2.5;
        float rise = aLife.z * 4.0 * (age - (1.0 - exp(-age * 3.0)) / 3.0);
        vec3 p = position + aVelocity * drag;
        p.y += rise;
        p.x += sin(age * 4.0 + aLife.w * 6.2832) * aLife.z * 0.6 * min(age, 1.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = aLife.z * (1.0 + t * 0.5) * projectionMatrix[1][1] * uPixels / max(-mv.z, 0.05) * live;
        vFade = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.55, 1.0, t)) * live;
      }`,
    fragmentShader: /* glsl */ `
      varying float vFade;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c) * 2.0;
        if (r > 1.0) discard;
        // A bright wall round a faint fill, with a glint of the surface light up and to the left.
        float edge = 1.0 - smoothstep(0.84, 1.0, r);
        float ring = smoothstep(0.5, 0.86, r) * edge;
        float fill = (1.0 - smoothstep(0.0, 0.7, r)) * 0.22;
        vec2 g = c - vec2(-0.14, 0.16);
        float glint = exp(-dot(g, g) * 90.0);
        vec3 colour = mix(vec3(0.45, 0.72, 1.0), vec3(1.0), ring * 0.7 + glint);
        gl_FragColor = vec4(colour, (ring * 0.75 + fill + glint) * vFade);
      }`,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  let next = 0;
  const spawn = (at: Vector3, v: Vector3, diameter: number, span: number, birth: number) => {
    origin.setXYZ(next, at.x, at.y, at.z);
    velocity.setXYZ(next, v.x, v.y, v.z);
    life.setXYZW(next, birth, span, diameter, Math.random());
    origin.needsUpdate = velocity.needsUpdate = life.needsUpdate = true;
    next = (next + 1) % BUBBLES;
  };
  return { points, material, spawn };
}

/** Shark Tank Egypt — the great white from the season's turnaround sheet, in dark brushed metal, swimming with a tail beat. */
export default function shark(): CompanionModel {
  const swim = { uBeat: { value: 0 }, uTime: { value: 0 } };
  // Metal under a thin wet film; the shader paints the hide, its relief and its finish per pixel.
  const material = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.4, metalness: 0.8, clearcoat: 0.5, clearcoatRoughness: 0.25, envMapIntensity: 1.1 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, swim);
    // The body waves side to side, barely at the head and most at the tail.
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uBeat;
        attribute float aSkin;
        varying float vSkin;
        varying vec3 vShark;
        varying vec3 vWorld;
        varying float vScale;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vSkin = aSkin;
        vShark = position;
        float tail = smoothstep(0.75, -1.3, position.z);
        transformed.x += sin(position.z * 3.0 - uBeat) * 0.16 * tail * tail;
        transformed.x += sin(-uBeat) * 0.018 * smoothstep(0.2, 1.0, position.z);
        vWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
        vScale = length(modelViewMatrix[0].xyz);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        uniform float uTime;
        varying float vSkin;
        varying vec3 vShark;
        varying vec3 vWorld;
        varying float vScale;
        // Distance from q to the segment a–b.
        float segment(vec2 q, vec2 a, vec2 b) {
          vec2 ab = b - a;
          return length(q - a - ab * clamp(dot(q - a, ab) / dot(ab, ab), 0.0, 1.0));
        }
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        // Smooth value noise in 0…1.
        float vnoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
        }
        // Tilts the normal by a height field's screen-space slope (Mikkelsen, bump mapping unparametrized
        // surfaces), with the footprints left unnormalised so the tilt is a slope in world terms, not pixels.
        vec3 tilt(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDirection) {
          vec3 sigmaX = dFdx(surfPos);
          vec3 sigmaY = dFdy(surfPos);
          vec3 r1 = cross(sigmaY, surfNorm);
          vec3 r2 = cross(surfNorm, sigmaX);
          float det = dot(sigmaX, r1) * faceDirection;
          vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
          return normalize(abs(det) * surfNorm - grad);
        }
        // Light through a rippling surface: a shifting net of bright lines.
        float caustic(vec2 p, float t) {
          vec2 a = p + vec2(sin(p.y * 1.4 + t * 0.9), cos(p.x * 1.2 - t * 0.7)) * 0.45;
          vec2 b = p * 1.25 + vec2(cos(p.y * 1.8 - t * 0.6), sin(p.x * 1.5 + t * 0.8)) * 0.45;
          float c = abs(sin(a.x * 2.0 + t * 0.4) + sin(a.y * 2.3 - t * 0.3)) * 0.5;
          float d = abs(sin(b.x * 2.4 - t * 0.5) + sin(b.y * 1.7 + t * 0.45)) * 0.5;
          return pow(1.0 - c, 6.0) * 0.7 + pow(1.0 - d, 6.0) * 0.7 + pow((1.0 - c) * (1.0 - d), 2.0) * 0.4;
        }`,
      )
      // The hide, painted and relieved per pixel so its lines stay sharp: z runs tail to nose, s spine (-1) to
      // belly (1). Fins and eyes (vSkin -2) get the relief on their own plane and their painted shade turned to metal.
      // Everything here stays in scope for the finish, the normal and the light further down.
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        float isBody = step(-1.5, vSkin);
        vec3 p = vShark;
        float s = vSkin;
        vec2 q = mix(vec2(p.z, p.x + p.y * 0.8), vec2(p.z, s * 0.55), isBody);
        // Countershading: a ragged line, up by the eye at the head and low along the tail.
        float edge = mix(0.35, 0.0, smoothstep(-0.7, 0.7, p.z));
        float ragged = sin(p.z * 31.0) * 0.035 + sin(p.z * 83.0 + 1.7) * 0.018;
        float belly = smoothstep(edge - 0.03, edge + 0.03, s + ragged) * isBody;
        // Scars raked across the flank, down to bare metal.
        vec2 sq = vec2(p.z, s * 0.22);
        float scars = 0.0;
        scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(sq, vec2(0.08, -0.08), vec2(0.3, -0.02))));
        scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(sq, vec2(-0.12, -0.05), vec2(0.04, 0.0))));
        scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(sq, vec2(0.3, -0.12), vec2(0.4, -0.085))));
        scars *= (1.0 - belly) * isBody;
        // Five gill slits behind the head, slanting back toward the belly: a narrow cut inside a wider
        // shadow, so the cut's lit walls never read as bright lines.
        float flank = smoothstep(-0.5, -0.3, s) * (1.0 - smoothstep(0.3, 0.5, s));
        float gills = 0.0;
        float cuts = 0.0;
        for (int i = 0; i < 5; i++) {
          float slit = abs(p.z - (0.47 + float(i) * 0.032 - s * 0.03));
          gills = max(gills, 1.0 - smoothstep(0.003, 0.01, slit));
          cuts = max(cuts, 1.0 - smoothstep(0.002, 0.006, slit));
        }
        gills *= flank * isBody;
        cuts *= flank * isBody;
        // The mouth: a seam from under the eye forward beneath the snout.
        float along = max(p.z - 0.72, 0.0) / 0.2;
        float mouth = (1.0 - smoothstep(0.02, 0.05, abs(s - (0.3 + pow(along, 1.3) * 0.55))))
          * smoothstep(0.7, 0.73, p.z) * (1.0 - smoothstep(0.9, 0.94, p.z)) * isBody;
        // Relief (model units): slow folds of the hide, a grain of dermal denticles that fades once a pixel
        // can't hold one, and the slits and scars cut in. Two octaves of noise are all the hide needs.
        float coarse = vnoise(q * vec2(9.0, 14.0));
        float fine = vnoise(q * vec2(23.0, 31.0) + 7.0);
        float folds = coarse * 0.65 + fine * 0.35 - 0.5;
        vec2 d = q * vec2(150.0, 190.0);
        float grain = sin(d.x * 6.2832 + sin(d.y * 6.2832) * 0.8) * sin(d.y * 6.2832);
        // Felt rather than seen: faint, uneven from patch to patch, gone once a pixel can't hold a denticle.
        float fineness = (0.4 + 0.6 * fine) * (1.0 - smoothstep(0.2, 0.6, fwidth(d.x)));
        float relief = folds * 0.005 + grain * fineness * 0.00014 - cuts * 0.006 - scars * 0.002 - mouth * 0.006;
        // The artwork's colours (linear): deep slate-blue along the spine easing to blue-grey on the flank,
        // a muted grey-blue under the belly. Dark metal, so the light lives in the highlights.
        vec3 back = mix(vec3(0.018, 0.03, 0.05), vec3(0.04, 0.065, 0.095), smoothstep(-1.0, edge, s));
        vec3 skin = mix(back, vec3(0.22, 0.3, 0.38), belly);
        skin *= 1.0 + folds * 0.25 + grain * fineness * 0.02;
        skin = mix(skin, vec3(0.2, 0.25, 0.3), scars * 0.7);
        skin *= 1.0 - gills * 0.8 - mouth * 0.75;
        // Fins: their painted shade picks the dark metal or the belly tone; the eyes stay black glass.
        float lum = dot(vColor.rgb, vec3(0.333));
        float eye = 1.0 - smoothstep(0.02, 0.05, lum);
        vec3 painted = mix(vec3(0.02, 0.032, 0.05), vec3(0.22, 0.3, 0.38), smoothstep(0.08, 0.6, lum));
        painted = mix(painted, vec3(0.01, 0.012, 0.016), eye);
        diffuseColor.rgb = mix(painted, skin, isBody);`,
      )
      // Brushed along the body on the back, polished under the belly; scars and eyes glassy, the slits dull.
      .replace(
        "#include <roughnessmap_fragment>",
        `#include <roughnessmap_fragment>
        float brush = vnoise(vec2(q.x * 6.0, q.y * 160.0)) - 0.5;
        roughnessFactor = mix(0.42 + folds * 0.2 + brush * 0.16, 0.22 + brush * 0.08, belly);
        roughnessFactor = mix(roughnessFactor, 0.3, 1.0 - isBody);
        roughnessFactor = mix(roughnessFactor, 0.16, max(scars, eye));
        roughnessFactor = clamp(roughnessFactor + gills * 0.3, 0.05, 1.0);`,
      )
      .replace(
        "#include <metalnessmap_fragment>",
        `#include <metalnessmap_fragment>
        metalnessFactor = mix(0.75, mix(0.65, 0.85, belly), isBody);
        metalnessFactor = mix(metalnessFactor, 0.95, scars) * (1.0 - eye);`,
      )
      // The relief tilts the normal; vScale keeps the slope the same whatever size it is drawn at.
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
        normal = tilt(-vViewPosition, normal, vec2(dFdx(relief), dFdy(relief)) * vScale, faceDirection);`,
      )
      // The wet film follows the folds and slits, not every grain.
      .replace(
        "#include <clearcoat_normal_fragment_maps>",
        `#include <clearcoat_normal_fragment_maps>
        clearcoatNormal = normalize(mix(clearcoatNormal, normal, 0.7));`,
      )
      // A wet, cold sheen along the silhouette, like the light in the artwork.
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float sheen = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
        totalEmissiveRadiance += vec3(0.3, 0.5, 0.75) * sheen * 0.16;`,
      )
      // Moonlight through the surface: a shifting net of caustics over whatever faces up, slipping across
      // the hide as it swims through the water.
      .replace(
        "#include <lights_fragment_end>",
        `#include <lights_fragment_end>
        vec3 worldNormal = inverseTransformDirection(normal, viewMatrix);
        float net = caustic(vWorld.xz * 1.8 + vWorld.y * 0.3, uTime) * smoothstep(-0.3, 0.7, worldNormal.y);
        vec3 moon = vec3(0.6, 0.85, 1.0) * net;
        reflectedLight.directDiffuse += moon * material.diffuseColor * 1.2;
        reflectedLight.directSpecular += moon * material.specularColor * 0.9;
        reflectedLight.indirectSpecular *= 1.0 + net * 1.2;`,
      );
  };

  const mesh = new Mesh(createSharkGeometry(), material);
  const bubbles = wake();
  const emitters = EMITTERS.map(({ at, rate }) => ({ at: new Vector3(...at), rate, prev: new Vector3(), budget: 0 }));
  const tip = new Vector3();
  const velocity = new Vector3();
  const at = new Vector3();
  const throwOff = new Vector3();
  const scale = new Vector3();
  let last = -1;

  return {
    object: mesh,
    ambient: bubbles.points,
    update: ({ time, beat, dt, height }) => {
      swim.uBeat.value = beat;
      swim.uTime.value = time;
      bubbles.material.uniforms.uTime.value = time;
      bubbles.material.uniforms.uPixels.value = height / 2;

      // The wake needs where each fin tip was a frame ago; after a gap (hidden, tab away) it starts over.
      const fresh = last < 0 || time - last > 0.2;
      last = time;
      // World size of one model unit, so the bubbles and their speeds scale with the shark on screen.
      const size = scale.setFromMatrixScale(mesh.matrixWorld).x;
      for (const emitter of emitters) {
        tip.set(emitter.at.x + bend(emitter.at.z, beat), emitter.at.y, emitter.at.z);
        mesh.localToWorld(tip);
        if (fresh) {
          emitter.budget = 0;
        } else {
          velocity.subVectors(tip, emitter.prev).divideScalar(dt);
          // Model lengths per second: a trickle at a cruise, a stream when the tail whips or it sweeps the screen.
          const speed = velocity.length() / size;
          emitter.budget = Math.min(emitter.budget + emitter.rate * (2.5 + 42 * step(0.3, 3, speed)) * dt, 4);
          for (; emitter.budget >= 1; emitter.budget -= 1) {
            const f = Math.random();
            at.lerpVectors(emitter.prev, tip, f).addScaledVector(throwOff.random().subScalar(0.5), size * 0.04);
            throwOff.random().subScalar(0.5).multiplyScalar(size * 0.4).addScaledVector(velocity, 0.3);
            bubbles.spawn(at, throwOff, size * (0.016 + Math.random() ** 2 * 0.038), 0.8 + Math.random() * 1.4, time - (1 - f) * dt);
          }
        }
        emitter.prev.copy(tip);
      }
    },
  };
}
