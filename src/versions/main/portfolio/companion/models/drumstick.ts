import { CylinderGeometry, MeshStandardMaterial, SphereGeometry } from "three";
import { group, lathe, matte, mottle, part, roughen, type CompanionModel } from "../kit";

/** Texas Chicken — a crunchy fried drumstick. */
export default function drumstick(): CompanionModel {
  const meat = lathe(
    [
      [0, -0.2],
      [0.13, -0.18],
      [0.22, -0.06],
      [0.36, 0.12],
      [0.47, 0.34],
      [0.52, 0.55],
      [0.5, 0.74],
      [0.42, 0.9],
      [0.28, 1.02],
      [0.12, 1.08],
      [0, 1.1],
    ],
    72,
  );
  // Craggy breading: bigger bumps over a fine crunch, fading out where the bone comes through.
  roughen(meat, 0.06, 3.4, (y) => Math.min(1, (y + 0.2) * 4));
  roughen(meat, 0.022, 9);
  mottle(meat, "#a5520f", "#3e1703", 5);

  const bone = matte("#efe3c8", 0.45);
  return {
    object: group(
      [
        part(meat, new MeshStandardMaterial({ vertexColors: true, roughness: 0.55 })),
        part(new CylinderGeometry(0.07, 0.06, 0.8, 24), bone, { at: [0, -0.52, 0] }),
        part(new SphereGeometry(0.12, 24, 16), bone, { at: [0.07, -0.95, 0] }),
        part(new SphereGeometry(0.115, 24, 16), bone, { at: [-0.07, -0.93, 0.02] }),
      ],
      { turn: [0.2, 0, -0.65] },
    ),
  };
}
