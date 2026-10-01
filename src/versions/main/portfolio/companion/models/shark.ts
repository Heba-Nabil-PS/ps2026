import { Mesh, MeshStandardMaterial } from "three";
import type { CompanionModel } from "../kit";
import { createSharkGeometry } from "./sharkGeometry";

/** Shark Tank Egypt — the shark from the season key visual, swimming with a tail beat. */
export default function shark(): CompanionModel {
  const swim = { uBeat: { value: 0 } };
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.42, metalness: 0.12 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, swim);
    // The body waves side to side, barely at the head and most at the tail.
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nuniform float uBeat;").replace(
      "#include <begin_vertex>",
      `#include <begin_vertex>
      float tail = smoothstep(0.75, -1.3, position.z);
      transformed.x += sin(position.z * 3.0 - uBeat) * 0.16 * tail * tail;
      transformed.x += sin(-uBeat) * 0.018 * smoothstep(0.2, 1.0, position.z);`,
    );
    // A wet blue sheen along the silhouette, like the light in the artwork.
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <emissivemap_fragment>",
      `#include <emissivemap_fragment>
      float sheen = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);
      totalEmissiveRadiance += vec3(0.16, 0.5, 0.85) * sheen * 0.6;`,
    );
  };
  return {
    object: new Mesh(createSharkGeometry(), material),
    update: ({ beat }) => {
      swim.uBeat.value = beat;
    },
  };
}
