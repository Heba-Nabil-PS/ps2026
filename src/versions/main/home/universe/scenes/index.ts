import { buildElsewhere, ElsewhereScene } from "./ElsewhereScene";
import { buildPhysiowell, PhysiowellScene } from "./PhysiowellScene";
import { buildShark, SharkScene } from "./SharkScene";
import { buildTexas, TexasScene } from "./TexasScene";
import type { SceneDef } from "./types";

/** The mini scene for each flagship case, by slug. A featured case without one is left off the orbit. */
export const scenes: Record<string, SceneDef> = {
  "texas-chicken": { Scene: TexasScene, build: buildTexas, glow: "#e2583a" },
  "shark-tank-egypt": { Scene: SharkScene, build: buildShark, glow: "#3d7bff" },
  "elsewhere-developments": { Scene: ElsewhereScene, build: buildElsewhere, glow: "#d9b48a" },
  physiowell: { Scene: PhysiowellScene, build: buildPhysiowell, glow: "#3fb8a9" },
};
