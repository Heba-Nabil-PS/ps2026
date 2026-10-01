import { SphereGeometry } from "three";
import { group, part, physical, roughen, type CompanionModel } from "../kit";

/** A soft, dusted mochi: a squashed ball that sits flat on its base. */
function ball(radius: number) {
  const geometry = new SphereGeometry(radius, 64, 48);
  const position = geometry.getAttribute("position");
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i) * 0.78;
    // The underside settles flat, as dough does.
    position.setY(i, y < -radius * 0.45 ? -radius * 0.45 - (y + radius * 0.45) * 0.25 : y);
  }
  geometry.computeVertexNormals();
  return roughen(geometry, 0.006, 6);
}

const dough = (color: string) => physical({ color, roughness: 0.62, clearcoat: 0.08 });

/** Yumochi — a pair of mochi ice creams: strawberry and matcha. */
export default function mochi(): CompanionModel {
  return {
    object: group(
      [part(ball(0.55), dough("#f0a3b6"), { at: [-0.3, 0, 0] }), part(ball(0.44), dough("#97bf62"), { at: [0.46, -0.06, 0.2], turn: [0, 0.6, 0.12] })],
      { turn: [0.35, 0, 0] },
    ),
  };
}
