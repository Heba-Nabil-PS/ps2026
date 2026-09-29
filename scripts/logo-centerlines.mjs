/**
 * Traces the centre lines used to "draw" the logo (LOGO_DRAW in
 * src/components/brand/logo-paths.ts) from the master artwork.
 *
 * The mark is two filled ribbons. Each ribbon's outline is sampled, one edge is
 * walked and paired with the nearest point on the opposite edge; the midpoints,
 * smoothed and simplified, become a Catmull-Rom curve. Ends are extended past
 * the rounded caps so a butt-capped mask stroke covers them completely.
 *
 * Run: node scripts/logo-centerlines.mjs            (prints the LOGO_DRAW paths)
 *      node scripts/logo-centerlines.mjs --check    (also verifies mask coverage, needs sharp)
 *
 * The edge ranges below (fractions along each outline, from its first point) are
 * specific to Psdigital Logo-01.svg. If the artwork changes, find the caps again
 * (plot the outline with its sample indices) and update them.
 */
import { readFileSync } from "node:fs";

const SOURCE = "Psdigital Logo-01.svg";
const OUTER_WIDTH = 56; // mask stroke widths (ribbons are ~28–32 and ~8 units wide)
const INNER_WIDTH = 18;

// Outer ribbon: stroke A runs from the stem foot up the diagonal and round the bowl,
// stroke B from the top-left cap round the left loop to the junction.
const OUTER_A = { edge: [0.549, 0.874], opposite: [0.879, 0.543] };
const OUTER_B = { edge: [0.19, 0.343], opposite: [0.35, 0.5], reverse: true };
// Inner line: foot → diagonal → loop → end cap.
const INNER = { edge: [0.314, 0.802], opposite: [0.806, 0.309] };
// The stem is a straight extrusion of the diagonal (right edge: l268.61-539.2 from the foot).
const STEM = "M458.7 560L285.1 908.6";

/* ---------- SVG path → absolute cubic segments ---------- */
function parse(d) {
  const t = d.match(/[a-zA-Z]|-?(?:\d*\.\d+|\d+\.?)(?:e-?\d+)?/g);
  let i = 0, cmd = null, x = 0, y = 0, sx = 0, sy = 0, pcx = null, pcy = null;
  const segs = [];
  const num = () => parseFloat(t[i++]);
  const line = (nx, ny) => {
    segs.push([[x, y], [x + (nx - x) / 3, y + (ny - y) / 3], [x + (2 * (nx - x)) / 3, y + (2 * (ny - y)) / 3], [nx, ny]]);
    x = nx; y = ny; pcx = null;
  };
  while (i < t.length) {
    if (/[a-zA-Z]/.test(t[i])) cmd = t[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    if (C === "M") {
      let nx = num(), ny = num();
      if (rel) { nx += x; ny += y; }
      x = sx = nx; y = sy = ny; cmd = rel ? "l" : "L"; pcx = null;
    } else if (C === "L") {
      let nx = num(), ny = num();
      if (rel) { nx += x; ny += y; }
      line(nx, ny);
    } else if (C === "H") line(num() + (rel ? x : 0), y);
    else if (C === "V") line(x, num() + (rel ? y : 0));
    else if (C === "C" || C === "S") {
      let c1x, c1y;
      if (C === "C") { c1x = num(); c1y = num(); if (rel) { c1x += x; c1y += y; } }
      else { c1x = pcx === null ? x : 2 * x - pcx; c1y = pcx === null ? y : 2 * y - pcy; }
      let c2x = num(), c2y = num(), nx = num(), ny = num();
      if (rel) { c2x += x; c2y += y; nx += x; ny += y; }
      segs.push([[x, y], [c1x, c1y], [c2x, c2y], [nx, ny]]);
      pcx = c2x; pcy = c2y; x = nx; y = ny;
    } else if (C === "Z") {
      if (Math.hypot(x - sx, y - sy) > 1e-6) line(sx, sy);
      x = sx; y = sy; pcx = null;
    } else throw new Error(`Unsupported path command ${cmd}`);
  }
  return segs;
}

const bez = (s, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]); };

/** Points roughly 1 unit apart along the outline. */
function sample(segs) {
  const pts = [];
  for (const s of segs) {
    let len = 0, p = s[0];
    for (let k = 1; k <= 20; k++) { const q = bez(s, k / 20); len += Math.hypot(q[0] - p[0], q[1] - p[1]); p = q; }
    const n = Math.max(2, Math.ceil(len));
    for (let k = 0; k < n; k++) pts.push(bez(s, k / n));
  }
  return pts;
}

/* ---------- centre line ---------- */
const range = (pts, [a, b]) => {
  const out = [], n = pts.length;
  for (let i = Math.round(a * n) % n, j = Math.round(b * n) % n; i !== j; i = (i + 1) % n) out.push(pts[i]);
  return out;
};
function midline(pts, { edge, opposite, reverse = false }, step = 6) {
  const e = range(pts, edge), o = range(pts, opposite), out = [];
  if (reverse) e.reverse();
  for (let k = 0; k < e.length; k += step) {
    const p = e[k];
    let best = o[0], bd = Infinity;
    for (const q of o) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < bd) { bd = d; best = q; } }
    out.push([(p[0] + best[0]) / 2, (p[1] + best[1]) / 2]);
  }
  return out;
}
const smooth = (a, w = 3) => a.map((p, i) => {
  if (i === 0 || i === a.length - 1) return p;
  let sx = 0, sy = 0, n = 0;
  for (let k = -w; k <= w; k++) { const q = a[Math.min(a.length - 1, Math.max(0, i + k))]; sx += q[0]; sy += q[1]; n++; }
  return [sx / n, sy / n];
});
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let dm = 0, im = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const p = pts[i];
    const d = Math.abs((b[1] - a[1]) * p[0] - (b[0] - a[0]) * p[1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(b[0] - a[0], b[1] - a[1]);
    if (d > dm) { dm = d; im = i; }
  }
  return dm > eps ? [...simplify(pts.slice(0, im + 1), eps).slice(0, -1), ...simplify(pts.slice(im), eps)] : [a, b];
}
const extend = (a, d) => {
  const f = (p, q) => { const l = Math.hypot(p[0] - q[0], p[1] - q[1]); return [p[0] + ((p[0] - q[0]) / l) * d, p[1] + ((p[1] - q[1]) / l) * d]; };
  return [f(a[0], a[Math.min(3, a.length - 1)]), ...a, f(a[a.length - 1], a[Math.max(0, a.length - 4)])];
};
const r1 = (v) => Math.round(v * 10) / 10;
function toPath(pts) {
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}
const prep = (pts, ext) => toPath(extend(simplify(smooth(pts), 0.6), ext));

/* ---------- build ---------- */
const svg = readFileSync(SOURCE, "utf8");
const [innerD, outerD] = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
const outer = sample(parse(outerD)), inner = sample(parse(innerD));

const a = midline(outer, OUTER_A);
const b = midline(outer, OUTER_B);
const join = a.findIndex((p) => p[1] < 640); // where the diagonal clears the junction
const main = prep([...b.slice(4, -2), ...a.slice(join, -3)], OUTER_WIDTH * 0.6);
const innerLine = prep(midline(inner, INNER, 5).slice(2, -3), INNER_WIDTH);

console.log(`  main: "${main}",\n  stem: "${STEM}",\n  inner:\n    "${innerLine}",`);

if (process.argv.includes("--check")) {
  const { default: sharp } = await import("sharp");
  const view = 'viewBox="37 168 1006 711" width="2012" height="1422"';
  const mask = (id, w, ...ds) => `<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1080">${ds.map((d) => `<path d="${d}" stroke="#fff" stroke-width="${w}" fill="none"/>`).join("")}</mask>`;
  const render = (body) => sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" ${view}><rect x="0" y="0" width="1080" height="1080" fill="#fff"/><g fill="#000">${body}</g></svg>`)).greyscale().raw().toBuffer();
  const full = await render(`<path d="${outerD}"/><path d="${innerD}"/>`);
  const drawn = await render(`<defs>${mask("o", OUTER_WIDTH, main, STEM)}${mask("i", INNER_WIDTH, innerLine)}</defs><path d="${outerD}" mask="url(#o)"/><path d="${innerD}" mask="url(#i)"/>`);
  let ink = 0, missed = 0;
  for (let i = 0; i < full.length; i++) if (full[i] < 128) { ink++; if (drawn[i] >= 128) missed++; }
  console.log(`\nCoverage: ${(100 - (100 * missed) / ink).toFixed(3)}% of logo pixels revealed when fully drawn (expect > 99.9%).`);
}
