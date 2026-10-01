import { CylinderGeometry } from "three";
import { glass, group, lathe, matte, part, type CompanionModel } from "../kit";

/** M.Squared — “Beyond Time.”: an hourglass in a dark wood frame. */
export default function hourglass(): CompanionModel {
  const wood = matte("#5b3a22", 0.5);
  const sand = matte("#dcb672", 0.85);
  const posts = [0, 1, 2].map((i) => {
    const a = (i / 3) * Math.PI * 2;
    return part(new CylinderGeometry(0.035, 0.035, 1.56, 12), wood, { at: [Math.cos(a) * 0.47, 0, Math.sin(a) * 0.47] });
  });
  return {
    object: group(
      [
        part(new CylinderGeometry(0.56, 0.56, 0.08, 48), wood, { at: [0, 0.82, 0] }),
        part(new CylinderGeometry(0.56, 0.56, 0.08, 48), wood, { at: [0, -0.82, 0] }),
        ...posts,
        // Sand: a mound below, the last of it above, and the thread between.
        part(
          lathe([
            [0, -0.76],
            [0.3, -0.73],
            [0.36, -0.58],
            [0.2, -0.42],
            [0, -0.36],
          ]),
          sand,
        ),
        part(
          lathe([
            [0, 0.02],
            [0.05, 0.03],
            [0.2, 0.14],
            [0.32, 0.28],
            [0, 0.3],
          ]),
          sand,
        ),
        part(new CylinderGeometry(0.01, 0.01, 0.38, 6), sand, { at: [0, -0.17, 0] }),
        part(
          lathe([
            [0.02, -0.78],
            [0.3, -0.74],
            [0.4, -0.55],
            [0.38, -0.3],
            [0.2, -0.1],
            [0.05, 0],
            [0.2, 0.1],
            [0.38, 0.3],
            [0.4, 0.55],
            [0.3, 0.74],
            [0.02, 0.78],
          ]),
          glass("#eaf4ff", 0.22),
        ),
      ],
      { turn: [0.25, 0, 0.3] },
    ),
  };
}
