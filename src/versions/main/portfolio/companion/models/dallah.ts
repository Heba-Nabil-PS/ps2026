import { CatmullRomCurve3, ConeGeometry, TubeGeometry, Vector3 } from "three";
import { group, lathe, metal, part, type CompanionModel } from "../kit";

/** Million Riyal Menu — a brass dallah, the Arabic coffee pot of Saudi hospitality. */
export default function dallah(): CompanionModel {
  const brass = metal("#c9a046", 0.22);
  const curve = (points: [number, number][]) => new CatmullRomCurve3(points.map(([x, y]) => new Vector3(x, y, 0)));
  return {
    object: group(
      [
        part(
          lathe([
            [0, -0.85],
            [0.32, -0.85],
            [0.35, -0.8],
            [0.3, -0.74],
            [0.42, -0.6],
            [0.48, -0.42],
            [0.44, -0.22],
            [0.3, -0.08],
            [0.2, 0.05],
            [0.18, 0.2],
            [0.24, 0.38],
            [0.3, 0.48],
            [0.26, 0.52],
            [0.2, 0.56],
            [0.14, 0.66],
            [0.06, 0.74],
            [0.04, 0.82],
            [0.075, 0.87],
            [0.02, 0.96],
            [0, 0.98],
          ]),
          brass,
        ),
        // The long beak of a spout, rising from the belly.
        part(
          new TubeGeometry(
            curve([
              [0.36, -0.38],
              [0.55, -0.18],
              [0.62, 0.12],
              [0.68, 0.42],
              [0.84, 0.6],
            ]),
            48,
            0.045,
            16,
          ),
          brass,
        ),
        part(new ConeGeometry(0.045, 0.14, 16), brass, { at: [0.88, 0.64, 0], turn: [0, 0, -0.85] }),
        part(
          new TubeGeometry(
            curve([
              [-0.2, 0.32],
              [-0.48, 0.34],
              [-0.56, 0.05],
              [-0.47, -0.28],
              [-0.4, -0.42],
            ]),
            48,
            0.035,
            12,
          ),
          brass,
        ),
      ],
      { turn: [0.15, 0, 0.12] },
    ),
  };
}
