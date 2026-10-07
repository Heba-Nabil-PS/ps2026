// Converts the studio portraits in team-img/ (already framed 4:5 on the shared
// blue backdrop, 1030×1287) to the 800×1000 WebPs the team grid loads.
// Keys are the member slugs referenced from src/lib/site.ts.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const portraits = {
  "lubna-el-banan": "Lobna.png",
  "ahmed-khalil": "Khalil.png",
  "peri-khalil": "Peri.png",
  "muhamed-hotyba": "Hotayba.png",
  "hesham-zahran": "Hesham.png",
  "shahinaz-maher": "Shahi.png",
  "heba-nabil": "Heba.png",
  "dina-salem": "Dina.png",
};

const out = "public/images/team";
mkdirSync(out, { recursive: true });

for (const [slug, file] of Object.entries(portraits)) {
  const info = await sharp(`team-img/${file}`)
    .resize(800, 1000, { fit: "cover", position: "top" })
    // A handful of edge pixels keep partial alpha from the cut-out; flatten them onto the backdrop navy.
    .flatten({ background: "#1c3a5c" })
    .webp({ quality: 82 })
    .toFile(`${out}/${slug}.webp`);
  console.log(slug, `${info.width}x${info.height}`, `${Math.round(info.size / 1024)} KB`);
}
