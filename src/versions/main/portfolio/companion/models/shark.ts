import { Mesh, MeshPhysicalMaterial } from "three";
import type { CompanionModel } from "../kit";
import { createSharkGeometry } from "./sharkGeometry";

/** Shark Tank Egypt — the great white from the season's turnaround sheet, swimming with a tail beat. */
export default function shark(): CompanionModel {
  const swim = { uBeat: { value: 0 } };
  // A satin hide under a thin wet film, like the render on the sheet.
  const material = new MeshPhysicalMaterial({ vertexColors: true, roughness: 0.55, metalness: 0.05, clearcoat: 0.6, clearcoatRoughness: 0.32 });
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
        varying vec3 vShark;`,
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vSkin = aSkin;
        vShark = position;
        float tail = smoothstep(0.75, -1.3, position.z);
        transformed.x += sin(position.z * 3.0 - uBeat) * 0.16 * tail * tail;
        transformed.x += sin(-uBeat) * 0.018 * smoothstep(0.2, 1.0, position.z);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
        varying float vSkin;
        varying vec3 vShark;
        // Distance from q to the segment a–b.
        float segment(vec2 q, vec2 a, vec2 b) {
          vec2 ab = b - a;
          return length(q - a - ab * clamp(dot(q - a, ab) / dot(ab, ab), 0.0, 1.0));
        }`,
      )
      // The hide, painted per pixel so its lines stay sharp: z runs tail to nose, s spine (-1) to belly (1).
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
        if (vSkin > -1.5) {
          vec3 p = vShark;
          float s = vSkin;
          // Countershading: a ragged line, up by the eye at the head and low along the tail.
          float edge = mix(0.35, 0.0, smoothstep(-0.7, 0.7, p.z));
          float ragged = sin(p.z * 31.0) * 0.035 + sin(p.z * 83.0 + 1.7) * 0.018;
          float belly = smoothstep(edge - 0.03, edge + 0.03, s + ragged);
          // Darkest along the spine, easing to slate on the flank above the line.
          vec3 back = mix(vec3(0.03, 0.045, 0.07), vec3(0.085, 0.115, 0.15), smoothstep(-1.0, edge, s));
          vec3 skin = mix(back, vec3(0.7, 0.74, 0.77), belly);
          // Fine wrinkles in the hide.
          float grain = sin(p.z * 170.0 + sin(p.y * 55.0) * 2.0) * sin(p.y * 130.0 + p.x * 85.0);
          skin *= 1.0 + grain * 0.07;
          // Pale scars raked across the dark flank.
          float scars = 0.0;
          vec2 q = vec2(p.z, s * 0.22);
          scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(q, vec2(0.08, -0.08), vec2(0.3, -0.02))));
          scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(q, vec2(-0.12, -0.05), vec2(0.04, 0.0))));
          scars = max(scars, 1.0 - smoothstep(0.0015, 0.004, segment(q, vec2(0.3, -0.12), vec2(0.4, -0.085))));
          skin = mix(skin, vec3(0.22, 0.28, 0.34), scars * (1.0 - belly) * 0.6);
          // Five gill slits behind the head, slanting back toward the belly.
          float flank = smoothstep(-0.5, -0.3, s) * (1.0 - smoothstep(0.3, 0.5, s));
          float gills = 0.0;
          for (int i = 0; i < 5; i++) {
            float at = 0.47 + float(i) * 0.032 - s * 0.03;
            gills = max(gills, 1.0 - smoothstep(0.002, 0.006, abs(p.z - at)));
          }
          skin *= 1.0 - gills * flank * 0.65;
          // The mouth: a dark seam from under the eye forward beneath the snout.
          float along = max(p.z - 0.72, 0.0) / 0.2;
          float mouth = (1.0 - smoothstep(0.02, 0.05, abs(s - (0.3 + pow(along, 1.3) * 0.55))))
            * smoothstep(0.7, 0.73, p.z) * (1.0 - smoothstep(0.9, 0.94, p.z));
          skin *= 1.0 - mouth * 0.75;
          diffuseColor.rgb = skin;
        }`,
      )
      // A wet, cold sheen along the silhouette, like the light in the artwork.
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float sheen = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
        totalEmissiveRadiance += vec3(0.3, 0.5, 0.75) * sheen * 0.28;`,
      );
  };
  return {
    object: new Mesh(createSharkGeometry(), material),
    update: ({ beat }) => {
      swim.uBeat.value = beat;
    },
  };
}
