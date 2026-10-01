import { BoxGeometry, CatmullRomCurve3, ExtrudeGeometry, Path, Shape, ShapeGeometry, TubeGeometry, Vector3 } from "three";
import { group, part, physical, type CompanionModel } from "../kit";

function roundedRect(target: Shape | Path, cx: number, cy: number, w: number, h: number, r: number) {
  const x = cx - w / 2;
  const y = cy - h / 2;
  target.moveTo(x + r, y);
  target.lineTo(x + w - r, y);
  target.quadraticCurveTo(x + w, y, x + w, y + r);
  target.lineTo(x + w, y + h - r);
  target.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  target.lineTo(x + r, y + h);
  target.quadraticCurveTo(x, y + h, x, y + h - r);
  target.lineTo(x, y + r);
  target.quadraticCurveTo(x, y, x + r, y);
  return target;
}

/** ASTK — black acetate sunglasses, for between the city and the coast. */
export default function sunglasses(): CompanionModel {
  const acetate = physical({ color: "#0f0f12", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.1 });
  const lens = physical({ color: "#1d3a4a", roughness: 0.04, metalness: 0.6, clearcoat: 1, transparent: true, opacity: 0.88 });

  const rims = [1, -1].flatMap((side) => {
    const cx = side * 0.38;
    const rim = roundedRect(new Shape(), cx, 0, 0.66, 0.5, 0.16) as Shape;
    rim.holes.push(roundedRect(new Path(), cx, 0, 0.54, 0.38, 0.12) as Path);
    return [
      part(new ExtrudeGeometry(rim, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.012, bevelSegments: 3, curveSegments: 16 }), acetate),
      part(new ShapeGeometry(roundedRect(new Shape(), cx, 0, 0.56, 0.4, 0.13) as Shape, 16), lens, { at: [0, 0, 0.03] }),
      // Temples run back from the outer edge of each rim.
      part(new BoxGeometry(0.035, 0.05, 1.0), acetate, { at: [side * 0.7, 0.13, -0.5] }),
      part(new BoxGeometry(0.035, 0.05, 0.22), acetate, { at: [side * 0.7, 0.05, -1.06], turn: [-0.6, 0, 0] }),
    ];
  });
  const bridge = new CatmullRomCurve3([new Vector3(-0.07, 0.1, 0.03), new Vector3(0, 0.15, 0.03), new Vector3(0.07, 0.1, 0.03)]);
  return {
    object: group([...rims, part(new TubeGeometry(bridge, 16, 0.025, 8), acetate)], { turn: [0.25, -0.5, 0.1] }),
  };
}
