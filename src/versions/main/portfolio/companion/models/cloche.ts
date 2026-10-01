import { CylinderGeometry, DoubleSide, SphereGeometry } from "three";
import { group, lathe, metal, part, physical, type CompanionModel } from "../kit";

/** Million Pound Menu — a golden cloche on a white plate, the dish about to be revealed. */
export default function cloche(): CompanionModel {
  const gold = metal("#d9ad55", 0.18);
  gold.side = DoubleSide;
  const dome: [number, number][] = [[0.88, -0.35]];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * (Math.PI / 2);
    dome.push([0.82 * Math.cos(a), -0.33 + 0.74 * Math.sin(a)]);
  }
  return {
    object: group(
      [
        part(
          lathe([
            [0, -0.43],
            [0.92, -0.43],
            [1.06, -0.38],
            [1.1, -0.33],
            [0.95, -0.355],
            [0, -0.36],
          ]),
          physical({ color: "#f5f2ec", roughness: 0.25, clearcoat: 0.7, side: DoubleSide }),
        ),
        part(lathe(dome), gold),
        part(new CylinderGeometry(0.035, 0.05, 0.1, 16), gold, { at: [0, 0.45, 0] }),
        part(new SphereGeometry(0.1, 24, 16), gold, { at: [0, 0.54, 0] }),
      ],
      { turn: [0.35, 0, 0.1] },
    ),
  };
}
