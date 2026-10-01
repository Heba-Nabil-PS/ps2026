// Crops every team photo in img/team-src to one head-and-shoulders frame
// (4:5, head at the same size and height) so the grid reads as a set.
// Faces are hand-measured in source pixels: crown (top of head), chin, centre x.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const faces = {
  "lubna-el-banan.jpeg": { crown: 45, chin: 402, cx: 418 },
  "ahmed-khalil.jpeg": { crown: 11, chin: 192, cx: 144 },
  "peri-khalil.jpeg": { crown: 59, chin: 306, cx: 353 },
  "muhamed-hotyba.jpg": { crown: 58, chin: 470, cx: 612 },
  "hesham-zahran.jpeg": { crown: 81, chin: 370, cx: 525 },
  "shahinaz-maher.png": { crown: 155, chin: 533, cx: 362 },
  "heba-nabil.jpg": { crown: 146, chin: 320, cx: 486 },
};

const HEAD = 0.36; // head height as a share of the frame
const TOP = 0.13; // space above the crown
const out = "public/images/team";
mkdirSync(out, { recursive: true });

for (const [file, f] of Object.entries(faces)) {
  const src = sharp(`img/team-src/${file}`);
  const { width, height } = await src.metadata();
  // The ideal frame, shrunk until it fits inside the photo (no stretched edges).
  let h = Math.round((f.chin - f.crown) / HEAD);
  while (h * 0.8 > width || h > height) h--;
  const w = Math.round(h * 0.8);
  const left = Math.round(Math.min(Math.max(f.cx - w / 2, 0), width - w));
  const top = Math.round(Math.min(Math.max(f.crown - h * TOP, 0), height - h));
  await src
    .extract({ left, top, width: w, height: h })
    .resize(800, 1000)
    // Stretch each photo to the same tonal range before the shared grade.
    .normalise({ lower: 1, upper: 99 })
    .webp({ quality: 82 })
    .toFile(`${out}/${file.replace(/\.\w+$/, "")}.webp`);
  console.log(file, { w, h, left, top });
}
