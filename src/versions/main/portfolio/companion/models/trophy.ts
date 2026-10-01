import { DoubleSide, TorusGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { group, lathe, metal, part, physical, type CompanionModel } from "../kit";

/** Egypt's Entrepreneur Awards — a gold cup on a black stone plinth. */
export default function trophy(): CompanionModel {
  const gold = metal("#d6b04a", 0.18);
  gold.side = DoubleSide;
  const handles = [1, -1].map((side) =>
    part(new TorusGeometry(0.19, 0.035, 16, 32, Math.PI), gold, { at: [side * 0.42, 0.55, 0], turn: [0, 0, -side * (Math.PI / 2)] }),
  );
  return {
    object: group(
      [
        // Cup, with a lip that turns inward to a shallow floor.
        part(
          lathe([
            [0, 0.12],
            [0.1, 0.13],
            [0.2, 0.2],
            [0.33, 0.35],
            [0.43, 0.55],
            [0.47, 0.76],
            [0.48, 0.86],
            [0.44, 0.87],
            [0.4, 0.66],
            [0, 0.58],
          ]),
          gold,
        ),
        part(
          lathe([
            [0, -0.42],
            [0.2, -0.42],
            [0.21, -0.38],
            [0.08, -0.3],
            [0.05, -0.05],
            [0.11, 0.04],
            [0.09, 0.13],
            [0, 0.13],
          ]),
          gold,
        ),
        ...handles,
        part(new RoundedBoxGeometry(0.72, 0.26, 0.72, 3, 0.03), physical({ color: "#111114", roughness: 0.25, clearcoat: 1 }), { at: [0, -0.56, 0] }),
      ],
      { turn: [0.2, 0, 0.12] },
    ),
  };
}
