import { BoxGeometry, CylinderGeometry, TorusGeometry } from "three";
import { group, metal, part, type CompanionModel } from "../kit";

/** Elsewhere Developments — the brass key to a new home. */
export default function key(): CompanionModel {
  const brass = metal("#caa24c", 0.26);
  const along = [0, 0, Math.PI / 2] as [number, number, number];
  return {
    object: group(
      [
        part(new TorusGeometry(0.3, 0.08, 24, 64), brass, { at: [-0.62, 0, 0] }),
        part(new CylinderGeometry(0.1, 0.1, 0.1, 32), brass, { at: [-0.28, 0, 0], turn: along }),
        part(new CylinderGeometry(0.06, 0.06, 1.05, 24), brass, { at: [0.25, 0, 0], turn: along }),
        part(new BoxGeometry(0.12, 0.24, 0.07), brass, { at: [0.5, -0.14, 0] }),
        part(new BoxGeometry(0.1, 0.15, 0.07), brass, { at: [0.64, -0.1, 0] }),
        part(new BoxGeometry(0.1, 0.27, 0.07), brass, { at: [0.75, -0.15, 0] }),
      ],
      { turn: [0.5, 0.3, 0.35] },
    ),
  };
}
