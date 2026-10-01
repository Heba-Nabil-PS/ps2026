import { group, lathe, part, physical, type CompanionModel } from "../kit";

/** A capsule half: a hemisphere on a short tube, open end at y = 0. */
function shell(radius: number, length: number) {
  const profile: [number, number][] = [[0, -length - radius]];
  for (let i = 1; i <= 14; i++) {
    const a = -Math.PI / 2 + (i / 14) * (Math.PI / 2);
    profile.push([radius * Math.cos(a), -length + radius * Math.sin(a)]);
  }
  profile.push([radius, 0], [0, 0]);
  return lathe(profile);
}

/** Pharco — a two-tone gelatin capsule. */
export default function capsule(): CompanionModel {
  return {
    object: group(
      [
        part(shell(0.3, 0.42), physical({ color: "#1f5fd1", roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }), { at: [0, -0.02, 0] }),
        part(shell(0.31, 0.42), physical({ color: "#f6f7f9", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }), {
          at: [0, -0.12, 0],
          turn: [Math.PI, 0, 0],
        }),
      ],
      { turn: [0.3, 0, 0.95] },
    ),
  };
}
