import { CanvasTexture, MeshStandardMaterial, RepeatWrapping, SphereGeometry, SRGBColorSpace, TorusGeometry } from "three";
import { group, lathe, part, physical, roughen, type CompanionModel } from "../kit";

/** A waffle pattern painted once onto a small canvas. */
function waffle() {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#dca25c";
  ctx.fillRect(0, 0, 128, 128);
  ctx.strokeStyle = "#a8692b";
  ctx.lineWidth = 9;
  for (let i = -128; i <= 256; i += 32) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 128, 128);
    ctx.moveTo(i, 128);
    ctx.lineTo(i + 128, 0);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(5, 3);
  return texture;
}

const scoop = (radius: number) => roughen(new SphereGeometry(radius, 48, 32), 0.02, 4);

/** Moishi — a waffle cone with two scoops: strawberry and mint. */
export default function icecream(): CompanionModel {
  const pink = physical({ color: "#ee86a3", roughness: 0.5, clearcoat: 0.3 });
  const mint = physical({ color: "#86d6b4", roughness: 0.5, clearcoat: 0.3 });
  return {
    object: group(
      [
        part(
          lathe([
            [0, -1.0],
            [0.33, 0.12],
            [0.37, 0.18],
            [0, 0.18],
          ]),
          new MeshStandardMaterial({ map: waffle(), roughness: 0.75 }),
        ),
        part(scoop(0.38), pink, { at: [0, 0.4, 0] }),
        part(new TorusGeometry(0.33, 0.08, 16, 48), pink, { at: [0, 0.26, 0], turn: [Math.PI / 2, 0, 0] }),
        part(scoop(0.33), mint, { at: [0.03, 0.8, 0.02] }),
      ],
      { turn: [0.2, 0, -0.35] },
    ),
  };
}
