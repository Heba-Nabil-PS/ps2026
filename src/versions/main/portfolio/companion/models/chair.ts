import { CylinderGeometry } from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { group, matte, part, type CompanionModel } from "../kit";

/** @Home — a mid-century lounge chair: upholstered shell on splayed walnut legs. */
export default function chair(): CompanionModel {
  const fabric = matte("#a8653c", 0.92);
  const walnut = matte("#6f4426", 0.45);
  const legs = [
    [1, 1],
    [1, -1],
    [-1, 1],
    [-1, -1],
  ].map(([x, z]) =>
    part(new CylinderGeometry(0.035, 0.05, 0.72, 16), walnut, { at: [x * 0.4, -0.42, z * 0.32], turn: [z * 0.16, 0, -x * 0.16] }),
  );
  return {
    object: group(
      [
        part(new RoundedBoxGeometry(1.0, 0.18, 0.9, 4, 0.08), fabric),
        part(new RoundedBoxGeometry(1.0, 0.78, 0.16, 4, 0.08), fabric, { at: [0, 0.42, -0.44], turn: [-0.2, 0, 0] }),
        part(new RoundedBoxGeometry(0.98, 0.05, 0.88, 2, 0.02), walnut, { at: [0, -0.1, 0] }),
        ...legs,
      ],
      { turn: [0.3, 0.6, 0] },
    ),
  };
}
