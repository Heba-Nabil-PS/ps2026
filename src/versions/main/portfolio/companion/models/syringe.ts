import { BoxGeometry, CylinderGeometry } from "three";
import { glass, group, lathe, matte, metal, part, physical, type CompanionModel } from "../kit";

/** Sinclair Aesthetics — an injectable: a glass syringe of violet filler. */
export default function syringe(): CompanionModel {
  const plastic = matte("#ece8f4", 0.35);
  return {
    object: group(
      [
        part(new CylinderGeometry(0.17, 0.17, 1.2, 48, 1, true), glass("#f4efff", 0.3), { at: [0, 0.15, 0] }),
        part(
          lathe([
            [0.04, -0.62],
            [0.12, -0.55],
            [0.17, -0.45],
            [0.17, -0.44],
          ]),
          glass("#f4efff", 0.4),
        ),
        part(new CylinderGeometry(0.15, 0.15, 0.72, 40), physical({ color: "#b58cff", roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.85 }), {
          at: [0, -0.08, 0],
        }),
        part(new CylinderGeometry(0.155, 0.155, 0.08, 40), matte("#2b2833", 0.5), { at: [0, 0.32, 0] }),
        part(new CylinderGeometry(0.035, 0.035, 0.78, 16), plastic, { at: [0, 0.72, 0] }),
        part(new CylinderGeometry(0.2, 0.2, 0.05, 40), plastic, { at: [0, 1.1, 0] }),
        part(new BoxGeometry(0.64, 0.045, 0.22), plastic, { at: [0, 0.76, 0] }),
        part(new CylinderGeometry(0.035, 0.055, 0.12, 20), metal("#c9ccd2", 0.3), { at: [0, -0.68, 0] }),
        part(new CylinderGeometry(0.011, 0.011, 0.55, 8), metal("#dfe2e6", 0.15), { at: [0, -1.02, 0] }),
      ],
      { turn: [0.25, 0, 0.75] },
    ),
  };
}
