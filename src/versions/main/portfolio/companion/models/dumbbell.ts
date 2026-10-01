import { CylinderGeometry } from "three";
import { group, matte, metal, part, type CompanionModel } from "../kit";

/** Physiowell — a hex dumbbell, rubber heads on a chrome handle, with a teal clinic stripe. */
export default function dumbbell(): CompanionModel {
  const chrome = metal("#cfd3d8", 0.22);
  const rubber = matte("#1f272d", 0.7);
  const stripe = matte("#2fb8a6", 0.45);
  const across = [0, 0, Math.PI / 2] as [number, number, number];
  const ends = [1, -1].flatMap((side) => [
    part(new CylinderGeometry(0.32, 0.32, 0.34, 6), rubber, { at: [side * 0.68, 0, 0], turn: across }),
    part(new CylinderGeometry(0.325, 0.325, 0.04, 6), stripe, { at: [side * 0.55, 0, 0], turn: across }),
    part(new CylinderGeometry(0.12, 0.12, 0.07, 32), chrome, { at: [side * 0.47, 0, 0], turn: across }),
  ]);
  return {
    object: group([part(new CylinderGeometry(0.07, 0.07, 1.0, 24), chrome, { turn: across }), ...ends], { turn: [0.3, 0.4, 0.25] }),
  };
}
