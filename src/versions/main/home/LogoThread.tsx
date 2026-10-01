"use client";

import { gsap } from "@/lib/gsap";
import { LOGO_DRAW, LOGO_PATHS, LOGO_VIEWBOX } from "@/shared/brand/logo-paths";
import { LOGO_BASELINE } from "@/shared/brand/logo-spine";
import { useEffect, useId, useRef } from "react";

type Point = { x: number; y: number };
/** A cubic Bézier: start, two handles, end. */
type Curve = [Point, Point, Point, Point];
type DrawStroke = "main" | "stem" | "inner";

/**
 * The two feet of the mark, in artwork units (see logo-paths): the stem's centre and the thin
 * inner line's centre, both on the baseline. `dir` is the stem's slant, pointing down.
 */
const FOOT = {
  stem: { x: 299.7, y: LOGO_BASELINE },
  inner: { x: 399, y: LOGO_BASELINE },
  dir: { x: -1.3, y: 2.7 },
  /** Ribbon widths across the line (the artwork's horizontal cuts, 32.31 and 9.31, times the slant). */
  stemWidth: 29,
  innerWidth: 8.4,
} as const;

/** Where the line swings to on each turn down the page, as fractions of its width; repeats. */
const SWINGS = [0.1, 0.88, 0.16, 0.82, 0.07, 0.9, 0.2, 0.84];
/** Height of each swing, in screens; repeats. */
const STEPS = [0.95, 1.15, 0.9, 1.05, 1.2, 0.85];
/** Where the drawn line's head rides, as a fraction of the screen from the top. */
const HEAD = 0.62;
/** How much faster than the scroll the head first runs, until it catches up with HEAD. */
const PULL = 2.4;
/** Length between the samples the line is read at (px). */
const SAMPLE = 8;
/** Behind a section's content the line shows this much of itself, fading in and out over `feather` px at its edges. */
const SHADE = { visible: 0.1, feather: 90 };
/** Room the line keeps around a `[data-thread-avoid]` element (a section heading), and how many tries it gets to route clear (px). */
const AVOID = { margin: 48, tries: 4 };
/** Room the hero title opens around the line where it crosses a row: before it, and after it (where the thin line runs) (px). */
const PART = { before: 10, after: 26 };
/**
 * The journey's end, in the footer's room for it (SiteFooter `[data-footer-mark]`): how much of the room
 * must be in view before it plays, and how long it takes (s). It plays on its own: the line runs on over the
 * footer into the mark's stem and is wound in there, while the mark draws itself and the name writes in beside it.
 */
const FINALE = { reveal: 0.6, duration: 3 };
/** When each part of the end plays, as fractions of FINALE.duration. */
const END = {
  head: [0, 0.3],
  tail: [0.15, 0.6],
  main: [0.3, 0.75],
  stem: [0.62, 0.78],
  inner: [0.7, 1],
} as const satisfies Record<string, readonly [number, number]>;

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const smoothstep = (n: number) => n * n * (3 - 2 * n);
const phase = (f: number, [from, to]: readonly [number, number]) => smoothstep(clamp01((f - from) / (to - from)));
const lineTo = (points: Point[]) => points.map((p) => `L${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join("");

/**
 * One smooth line through every point, as cubic Béziers. At each point the line runs the way its
 * neighbours lie (as Catmull-Rom); a handle is never longer than half its own segment, so a short
 * segment next to a long one does not overshoot. The first and last points only steer: the line runs
 * from the second to the one before last.
 */
function smoothPath(points: Point[]) {
  const curves: Curve[] = [];
  const handle = (from: Point, to: Point, length: number) => {
    const d = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    return { x: ((to.x - from.x) / d) * length, y: ((to.y - from.y) / d) * length };
  };
  let d = `M${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  for (let i = 1; i < points.length - 2; i++) {
    const p0 = points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2];
    const half = Math.hypot(p2.x - p1.x, p2.y - p1.y) / 2;
    const h1 = handle(p0, p2, Math.min(half, Math.hypot(p2.x - p0.x, p2.y - p0.y) / 6));
    const h2 = handle(p1, p3, Math.min(half, Math.hypot(p3.x - p1.x, p3.y - p1.y) / 6));
    const c1 = { x: p1.x + h1.x, y: p1.y + h1.y };
    const c2 = { x: p2.x - h2.x, y: p2.y - h2.y };
    curves.push([p1, c1, c2, p2]);
    d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return { d, curves };
}

/**
 * Points along the curves every `step` of their length, each with the way the line runs there.
 * Worked out here rather than with getPointAtLength, which re-reads the whole path on every call:
 * across a page-long line that is thousands of calls, and seconds of frozen scrolling.
 */
function walk(curves: Curve[], step: number) {
  const at = ([a, b, c, d]: Curve, t: number) => {
    const u = 1 - t;
    return {
      x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x,
      y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y,
    };
  };
  // Flatten finely, then read the flattened line at even lengths.
  const line: Point[] = [curves[0][0]];
  for (const curve of curves) {
    const [a, b, c, d] = curve;
    const n = Math.max(4, Math.ceil((Math.hypot(b.x - a.x, b.y - a.y) + Math.hypot(c.x - b.x, c.y - b.y) + Math.hypot(d.x - c.x, d.y - c.y)) / 2));
    for (let i = 1; i <= n; i++) line.push(at(curve, i / n));
  }
  const out: { point: Point; dir: Point }[] = [];
  let run = 0;
  let next = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1];
    const b = line[i];
    const length = Math.hypot(b.x - a.x, b.y - a.y);
    if (length < 1e-6) continue;
    const dir = { x: (b.x - a.x) / length, y: (b.y - a.y) / length };
    while (next <= run + length) {
      const k = next - run;
      out.push({ point: { x: a.x + dir.x * k, y: a.y + dir.y * k }, dir });
      next += step;
    }
    run += length;
  }
  return { samples: out, length: run };
}

/**
 * The home page's thread: the hero mark's own line, pulled out of its stem by the
 * scroll (after lusion.co). The thick stem and the thin blue line beside it run on
 * together from the logo's feet and zigzag down the page; the hero's letters step
 * aside to let them through, and behind each later section the line all but fades,
 * as if passing under it, to come out again past its end.
 *
 * In the footer the journey ends: the line runs over it into the stem of the footer mark, is wound
 * in there, and the mark draws itself, whole, beside the name. Scrolling back up plays it all in
 * reverse. Laid out in page coordinates from where the marks sit, and rebuilt whenever
 * the page changes height. With reduced motion the finished mark simply stands.
 */
export function LogoThread() {
  const root = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^\w-]/g, "");

  useEffect(() => {
    const el = root.current;
    const svg = el?.querySelector("svg");
    const mask = el?.querySelector<SVGMaskElement>("[data-thread='sections']");
    const shades = el?.querySelector<SVGGElement>("[data-thread='shades']");
    const stem = el?.querySelector<SVGPathElement>("[data-thread='stem']");
    const inner = el?.querySelector<SVGPathElement>("[data-thread='inner']");
    const tip = el?.querySelector<SVGCircleElement>("[data-thread='tip']");
    const logo = el?.querySelector<SVGGElement>("[data-thread='logo']");
    if (!el || !svg || !mask || !shades || !stem || !inner || !tip || !logo) return;
    const draws = Array.from(logo.ownerSVGElement!.querySelectorAll<SVGPathElement>("[data-draw]"));
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Set by layout(). Lengths are along the stem line.
    let xs: number[] = []; // the stem line at each sample…
    let ys: number[] = [];
    let lows: number[] = []; // …and the lowest it has reached by then
    let innerAt: number[] = []; // the thin line's length at each sample
    let total = 0;
    let innerTotal = 0;
    let originY = 0;
    let footY = 0;
    let heroEnd = 0; // samples inside the hero, where letters step aside
    let heroOut = 0; // scroll past which the hero is out of sight
    let parted = false; // whether any hero letter has stepped aside
    let laidOut = ""; // the page size the line was laid out for
    let finaleFrom = Infinity; // scroll at which the journey ends
    let chars: { node: HTMLElement; x: number; y: number }[] = [];
    const drawLength = new Map<SVGPathElement, number>();
    const widest = new WeakMap<Element, number>(); // the widest each `[data-thread-avoid]` has been
    let room: HTMLElement | null = null; // the footer's room for the mark, where the name writes in

    // What is drawn: the stem line from `tail` to `head`, and the footer mark on the end's own clock (0–1).
    let head = 0;
    let tail = 0;
    let logoDrawn = 0;
    const shown = { head: -1, tail: -1, logo: -1 };

    const layout = () => {
      const mark = document.querySelector<HTMLElement>("[data-hero-mark-inner]");
      const hero = document.querySelector<HTMLElement>("[data-hero-content]");
      const footer = document.querySelector<HTMLElement>("footer");
      const stage = document.querySelector<HTMLElement>("[data-footer-mark]");
      const spot = stage?.querySelector<HTMLElement>("[data-footer-mark-logo]");
      if (!mark || !hero || !footer || !stage || !spot) return;
      room = stage;
      const vw = document.documentElement.clientWidth;
      const vh = window.innerHeight;
      const box = el.getBoundingClientRect();
      originY = box.top + window.scrollY;
      const footerBox = footer.getBoundingClientRect();
      const footerTop = footerBox.top - box.top;
      // Ends with the footer, so the line never makes the page longer.
      const height = footerBox.bottom - box.top;

      const len = Math.hypot(FOOT.dir.x, FOOT.dir.y);
      const t = { x: FOOT.dir.x / len, y: FOOT.dir.y / len };
      const along = (p: Point, d: Point, k: number) => ({ x: p.x + d.x * k, y: p.y + d.y * k });

      // The hero mark, centred where it stands; its entrance scales it about that centre, so the layout size is what counts.
      const rect = mark.getBoundingClientRect();
      const s = mark.offsetWidth / LOGO_VIEWBOX.mark.width;
      const left = rect.left + rect.width / 2 - mark.offsetWidth / 2 - box.left;
      const top = rect.top + rect.height / 2 - mark.offsetHeight / 2 - box.top;
      const place = (p: Point): Point => ({ x: left + (p.x - LOGO_VIEWBOX.mark.x) * s, y: top + (p.y - LOGO_VIEWBOX.mark.y) * s });
      const foot = place(FOOT.stem);
      const innerFoot = place(FOOT.inner);
      footY = foot.y;

      // The footer mark: in its spot, beside the name.
      const spotBox = spot.getBoundingClientRect();
      const ls = spotBox.height / LOGO_VIEWBOX.mark.height;
      const lx = spotBox.left - box.left - LOGO_VIEWBOX.mark.x * ls;
      const ly = spotBox.top - box.top - LOGO_VIEWBOX.mark.y * ls;
      const endFoot = { x: lx + FOOT.stem.x * ls, y: ly + FOOT.stem.y * ls };

      // Out of the hero mark's stem along its slant (the first point only steers), side to side down the page,
      // on over the footer, and up into the footer mark's stem from below, where the journey ends (the last point
      // only steers): the line is wound into the mark there as it draws itself beside the name.
      const run = Math.min(vh * 0.3, 260);
      const points: Point[] = [along(foot, t, -run), along(foot, t, -6 * s), along(foot, t, run)];
      let y = points[2].y;
      for (let i = 0; ; i++) {
        y += STEPS[i % STEPS.length] * vh;
        if (y > footerTop - vh * 0.35) break;
        points.push({ x: SWINGS[i % SWINGS.length] * vw, y });
      }
      // Clear of `[data-thread-avoid]` (section headings): where the line would cut through one, the swing
      // nearest it is moved out beside it, to whichever side has more room, a little further on each try.
      // A heading stretches as it comes into view, so it is kept clear at the widest it has been. Narrow
      // screens leave no room beside.
      const swingsTo = points.length;
      const avoid = Array.from(document.querySelectorAll<HTMLElement>("[data-thread-avoid]"), (node) => {
        const r = node.getBoundingClientRect();
        const width = Math.max(r.width, widest.get(node) ?? 0);
        widest.set(node, width);
        const left = getComputedStyle(node).direction === "rtl" ? r.right - width : r.left;
        return { left: left - box.left - AVOID.margin, right: left + width - box.left + AVOID.margin, top: r.top - box.top - AVOID.margin, bottom: r.bottom - box.top + AVOID.margin };
      }).filter((r) => r.right - r.left < vw * 0.7);
      for (let attempt = 0; avoid.length && attempt < AVOID.tries; attempt++) {
        const samples = walk(smoothPath(points).curves, 24).samples;
        const hit = avoid.find((r) => samples.some(({ point: p }) => p.x > r.left && p.x < r.right && p.y > r.top && p.y < r.bottom));
        if (!hit) break;
        const middle = (hit.top + hit.bottom) / 2;
        let nearest = -1;
        for (let i = 3; i < swingsTo; i++) if (nearest < 0 || Math.abs(points[i].y - middle) < Math.abs(points[nearest].y - middle)) nearest = i;
        if (nearest < 0) break;
        const toRight = vw - hit.right >= hit.left;
        const out = attempt * AVOID.margin;
        points[nearest] = { x: toRight ? Math.min(vw - 16, hit.right + out) : Math.max(16, hit.left - out), y: points[nearest].y };
      }
      const dip = spotBox.height * 0.45;
      points.push(
        { x: endFoot.x + spotBox.width * 0.9, y: footerTop + (endFoot.y - footerTop) * 0.55 },
        along(endFoot, t, dip),
        endFoot,
        along(endFoot, t, -120),
      );

      el.style.height = `${height}px`;
      svg.setAttribute("viewBox", `0 0 ${vw} ${height}`);
      mask.setAttribute("width", String(vw));
      mask.setAttribute("height", String(height));
      const route = smoothPath(points);
      stem.setAttribute("d", route.d);
      stem.setAttribute("stroke-width", String(FOOT.stemWidth * s));
      inner.setAttribute("stroke-width", String(FOOT.innerWidth * s));
      tip.setAttribute("r", String(FOOT.stemWidth * s * 2.5));

      // Read the stem line at even lengths; the thin line runs beside it, on its right, as it leaves the mark.
      const right = (d: Point) => ({ x: d.y, y: -d.x });
      const gap = (innerFoot.x - foot.x) * right(t).x + (innerFoot.y - foot.y) * right(t).y;
      const lag = (innerFoot.x - foot.x) * t.x + (innerFoot.y - foot.y) * t.y;
      const heroBottom = hero.getBoundingClientRect().bottom - box.top;
      heroOut = heroBottom + originY;
      xs = [];
      ys = [];
      lows = [];
      innerAt = [];
      heroEnd = 0;
      const innerPoints: Point[] = [];
      let low = -Infinity;
      let innerLength = Math.max(0, -lag);
      const read = walk(route.curves, SAMPLE);
      total = read.length;
      for (const { point: a, dir: d } of read.samples) {
        const p = { x: a.x + right(d).x * gap, y: a.y + right(d).y * gap };
        const prev = innerPoints[innerPoints.length - 1];
        if (prev) innerLength += Math.hypot(p.x - prev.x, p.y - prev.y);
        innerPoints.push(p);
        low = Math.max(low, a.y);
        xs.push(a.x);
        ys.push(a.y);
        lows.push(low);
        innerAt.push(innerLength);
        if (a.y < heroBottom) heroEnd = xs.length;
      }
      inner.setAttribute("d", `M${innerFoot.x.toFixed(1)} ${innerFoot.y.toFixed(1)}` + lineTo(innerPoints));
      innerTotal = inner.getTotalLength();

      // Behind each section after the hero, the line all but fades: across its content, between its padding.
      shades.replaceChildren();
      const main = el.closest("main") ?? document.body;
      const band = (y0: number, h: number, fill: string) => {
        const node = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        for (const [name, value] of [["x", 0], ["y", y0], ["width", vw], ["height", h]] as const) node.setAttribute(name, String(value));
        node.setAttribute("fill", fill);
        shades.appendChild(node);
      };
      /** Whether the line is out of sight where `section` ends (a clear section, or one it fades out of for good). */
      const endsClear = (section: Element | null) => !!section && (section.hasAttribute("data-thread-hidden") || !!section.querySelector("[data-thread-end]"));
      for (const section of Array.from(main.children) as HTMLElement[]) {
        if (section.contains(el) || section.contains(hero) || getComputedStyle(section).position === "fixed") continue;
        // Sections that keep the line in full (the selected work: it runs beside the cards), up to a
        // `[data-thread-end]` inside, if any: the line fades out just before it and stays out to the section's end.
        if (section.hasAttribute("data-thread-visible")) {
          const stop = section.querySelector("[data-thread-end]");
          if (stop) {
            const top = stop.getBoundingClientRect().top - box.top;
            const bottom = section.getBoundingClientRect().bottom - box.top;
            band(top - SHADE.feather, SHADE.feather, `url(#${id}-clear-in)`);
            band(top, bottom - top, "#000");
          }
          continue;
        }
        // Sections the line keeps clear of entirely, padding and all (the client wall: it would cut across the marks).
        const clear = section.hasAttribute("data-thread-hidden");
        const r = section.getBoundingClientRect();
        const css = getComputedStyle(section);
        const from = r.top - box.top + (clear ? 0 : parseFloat(css.paddingTop));
        const to = r.bottom - box.top - (clear ? 0 : parseFloat(css.paddingBottom));
        if (to - from < 40) continue;
        const feather = Math.min(SHADE.feather, (to - from) / 2);
        const kind = clear ? "clear" : "fade";
        // Back-to-back clear sections are one stretch: the line does not come out between them.
        const joinsAbove = clear && endsClear(section.previousElementSibling);
        const joinsBelow = clear && !!section.nextElementSibling?.hasAttribute("data-thread-hidden");
        const start = joinsAbove ? from : from + feather;
        const end = joinsBelow ? to : to - feather;
        if (!joinsAbove) band(from, feather, `url(#${id}-${kind}-in)`);
        band(start, end - start, clear ? "#000" : `url(#${id}-shade)`);
        if (!joinsBelow) band(to - feather, feather, `url(#${id}-${kind}-out)`);
      }

      logo.setAttribute("transform", `translate(${lx.toFixed(1)} ${ly.toFixed(1)}) scale(${ls.toFixed(4)})`);
      for (const path of draws) {
        const length = path.getTotalLength();
        drawLength.set(path, length);
        path.style.strokeDasharray = `${length} ${length}`;
      }
      const roomBox = stage.getBoundingClientRect();
      finaleFrom = roomBox.top + window.scrollY - vh + roomBox.height * FINALE.reveal;

      for (const char of chars) char.node.style.translate = "";
      chars = Array.from(document.querySelectorAll<HTMLElement>("[data-hero-char]"), (node) => ({ node, x: 0, y: 0 }));

      shown.head = shown.tail = shown.logo = -1;
      if (still.matches) {
        head = tail = 0;
        logoDrawn = 1;
      }
      stage.toggleAttribute("data-drawn", still.matches || ending);
      paint();
    };

    /** The thin line's length beside `l` of the stem line. */
    const thinAt = (l: number) => (l > 0 ? (innerAt[Math.min(innerAt.length - 1, Math.floor(l / SAMPLE))] ?? 0) : 0);

    const paint = () => {
      if (Math.abs(head - shown.head) > 0.5 || Math.abs(tail - shown.tail) > 0.5) {
        shown.head = head;
        shown.tail = tail;
        const length = Math.max(0, head - tail);
        stem.style.strokeDasharray = `0 ${tail} ${length} ${total * 2}`;
        inner.style.strokeDasharray = `0 ${thinAt(tail)} ${Math.max(0, thinAt(head) - thinAt(tail))} ${innerTotal * 2}`;
        // The head, between the two samples either side of it.
        const i = Math.min(xs.length - 1, Math.floor(head / SAMPLE));
        const j = Math.min(xs.length - 1, i + 1);
        const k = head / SAMPLE - i;
        tip.setAttribute("cx", String(xs[i] + (xs[j] - xs[i]) * k));
        tip.setAttribute("cy", String(ys[i] + (ys[j] - ys[i]) * k));
        tip.style.opacity = head > 2 && head < total - 2 && length > 2 ? "1" : "0";
      }
      if (Math.abs(logoDrawn - shown.logo) > 0.001) {
        shown.logo = logoDrawn;
        for (const path of draws) {
          const length = drawLength.get(path) ?? 0;
          path.style.strokeDashoffset = String(length * (1 - phase(logoDrawn, END[path.dataset.draw as DrawStroke])));
        }
      }
    };

    /** The stem line's length whose lowest point reaches `y`. */
    const lengthAt = (y: number) => {
      let lo = 0;
      let hi = lows.length - 1;
      if (hi < 0 || y <= lows[0]) return 0;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (lows[mid] < y) lo = mid + 1;
        else hi = mid;
      }
      return Math.min(total, lo * SAMPLE);
    };

    /**
     * Each row of the hero title parts where the drawn line crosses it: the letters before the crossing
     * slide back and those after it slide on, together, so a clean gap opens around the line (and the thin
     * one beside it) without one letter running into the next. They close again as the line is wound back.
     */
    const part = () => {
      // Out of the hero with every letter back in place, there is nothing to do (and nothing to measure).
      if (window.scrollY > heroOut && !parted) return;
      parted = false;
      const shift = window.scrollY - originY;
      const reached = Math.min(heroEnd, Math.floor(head / SAMPLE) + 1);
      const headY = reached > 0 ? ys[reached - 1] : -Infinity;
      /** Where the drawn line is at height `y`, if it has got that far. */
      const crossing = (y: number) => {
        for (let i = 1; i < reached; i++) {
          if (ys[i] >= y && ys[i - 1] <= y) return xs[i - 1] + ((xs[i] - xs[i - 1]) * (y - ys[i - 1])) / (ys[i] - ys[i - 1] || 1);
        }
        return null;
      };
      // Each letter where it rests, without the step it has already taken, gathered into rows.
      const rows: { box: { left: number; right: number; top: number; bottom: number }; char: (typeof chars)[number] }[][] = [];
      for (const char of chars) {
        const r = char.node.getBoundingClientRect();
        const box = { left: r.left - char.x, right: r.right - char.x, top: r.top + shift, bottom: r.bottom + shift };
        const row = rows.find((items) => Math.abs(items[0].box.top - box.top) < r.height / 2);
        if (row) row.push({ box, char });
        else rows.push([{ box, char }]);
      }
      for (const row of rows) {
        const top = Math.min(...row.map((item) => item.box.top));
        const bottom = Math.max(...row.map((item) => item.box.bottom));
        const upper = head > 0 ? crossing(top) : null;
        const lower = head > 0 ? (crossing(bottom) ?? (headY > top ? xs[reached - 1] : null)) : null;
        let before = 0;
        let after = 0;
        let edge = Infinity;
        if (upper !== null && lower !== null) {
          const from = Math.min(upper, lower) - PART.before;
          const to = Math.max(upper, lower) + PART.after;
          const middle = (upper + lower) / 2;
          // The row splits at the letter edge nearest the line.
          row.sort((a, b) => a.box.left - b.box.left);
          if (middle > row[0].box.left && middle < row[row.length - 1].box.right) {
            edge = row[0].box.left;
            for (const item of row) if (Math.abs(item.box.right - middle) < Math.abs(edge - middle)) edge = item.box.right;
            const opened = smoothstep(clamp01((headY - top) / (bottom - top)));
            before = Math.min(0, from - edge) * opened;
            after = Math.max(0, to - edge) * opened;
          }
        }
        for (const { box, char } of row) {
          const target = box.right <= edge + 0.5 ? before : after;
          char.x += (target - char.x) * 0.14;
          char.y = 0;
          if (target === 0 && Math.abs(char.x) < 0.05) {
            char.x = 0;
            if (char.node.style.translate) char.node.style.translate = "";
          } else {
            parted = true;
            char.node.style.translate = `${char.x.toFixed(1)}px 0px`;
          }
        }
      }
    };

    // The head is pulled out of the stem faster than the page moves, then rides at HEAD down the screen.
    // Once the footer's room is in view the end plays on its own clock, and back again when scrolled away.
    const state = { end: 0 };
    let ending = false;
    let tailFrom = 0;
    const tick = () => {
      if (still.matches) return;
      const on = window.scrollY >= Math.min(finaleFrom, document.documentElement.scrollHeight - window.innerHeight - 2);
      if (on !== ending) {
        ending = on;
        // The tail is wound in from the top of the screen: what is above it is out of sight already.
        if (on) tailFrom = lengthAt(window.scrollY - originY);
        room?.toggleAttribute("data-drawn", on);
        gsap.to(state, on ? { end: 1, duration: FINALE.duration, ease: "none" } : { end: 0, duration: 1, ease: "power2.out" });
      }
      const pulled = lengthAt(Math.min(footY + Math.max(0, window.scrollY) * PULL, window.scrollY - originY + window.innerHeight * HEAD));
      const f = state.end;
      const headTo = pulled + phase(f, END.head) * (total - pulled);
      const tailTo = f > 0 ? tailFrom + phase(f, END.tail) * (total - tailFrom) : 0;
      head += (headTo - head) * 0.12;
      tail += (tailTo - tail) * 0.12;
      logoDrawn = f;
      paint();
      part();
    };

    // Laying out reads the whole line, so it waits for the page to settle (rows opening on hover, images
    // arriving) and runs only if the page's size has changed since; reduced motion switching always lays out.
    // Measured by where the footer ends, not the page's scroll height: the line's own (stale) height holds that
    // up when the content above it shrinks, and the mark would be drawn below its spot.
    const size = () => {
      const footer = document.querySelector("footer");
      const bottom = footer ? Math.round(footer.getBoundingClientRect().bottom + window.scrollY) : 0;
      return `${document.documentElement.clientWidth}x${bottom}x${window.innerHeight}`;
    };
    let timer = 0;
    const settle = () => {
      layout();
      laidOut = size();
    };
    const relayout = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (size() !== laidOut) settle();
      }, 200);
    };
    settle();
    gsap.ticker.add(tick);
    const observer = new ResizeObserver(relayout);
    observer.observe(document.body);
    // A heading the line keeps clear of lays it out again once it has stretched wider than before.
    const grown = new ResizeObserver((entries) => {
      if (!entries.some((entry) => entry.target.getBoundingClientRect().width > (widest.get(entry.target) ?? 0) + 1)) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(settle, 200);
    });
    for (const node of document.querySelectorAll("[data-thread-avoid]")) grown.observe(node);
    window.addEventListener("resize", relayout);
    window.addEventListener("load", relayout);
    // The footer's name is set in em, so the mark's spot moves once the font arrives.
    let alive = true;
    document.fonts?.ready.then(() => alive && relayout());
    still.addEventListener("change", settle);
    return () => {
      alive = false;
      window.clearTimeout(timer);
      gsap.ticker.remove(tick);
      gsap.killTweensOf(state);
      observer.disconnect();
      grown.disconnect();
      window.removeEventListener("resize", relayout);
      window.removeEventListener("load", relayout);
      still.removeEventListener("change", settle);
      for (const char of chars) char.node.style.translate = "";
      room?.removeAttribute("data-drawn");
    };
  }, [id]);

  // Opaque grey: in a mask, brightness is how much shows through.
  const shade = `rgb(${Array(3).fill(Math.round(255 * SHADE.visible)).join(" ")})`;
  const hidden = { strokeDasharray: "0 100000" };
  // Mask strokes for the footer mark (as DrawableLogo): each ribbon is revealed by a thick stroke along its centre line.
  const pen = (part: DrawStroke, d: string, width: number) => (
    <path data-draw={part} d={d} fill="none" stroke="#fff" strokeWidth={width} strokeLinejoin="round" style={{ strokeDasharray: "100000", strokeDashoffset: "100000" }} />
  );
  const region = {
    maskUnits: "userSpaceOnUse" as const,
    x: LOGO_VIEWBOX.mark.x - 80,
    y: LOGO_VIEWBOX.mark.y - 80,
    width: LOGO_VIEWBOX.mark.width + 160,
    height: LOGO_VIEWBOX.mark.height + 160,
  };

  // Behind the content: the hero's backdrop layers and the footer's ground sit lower still (see HeroSection, SiteFooter).
  return (
    <div ref={root} aria-hidden data-logo-thread className="pointer-events-none absolute inset-x-0 top-0 -z-5 overflow-hidden">
      <svg className="block h-full w-full" preserveAspectRatio="none" fill="none">
        <defs>
          <radialGradient id={`${id}-tip`}>
            <stop offset="0" stopColor="var(--color-paper)" />
            <stop offset="0.35" stopColor="var(--color-sky)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--color-sky)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-fade-in`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor={shade} />
          </linearGradient>
          <linearGradient id={`${id}-fade-out`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={shade} />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <linearGradient id={`${id}-clear-in`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <linearGradient id={`${id}-clear-out`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" />
            <stop offset="1" stopColor="#fff" />
          </linearGradient>
          <linearGradient id={`${id}-shade`}>
            <stop stopColor={shade} />
          </linearGradient>
          {/* What the line shows of itself: all of it, but faint behind each section's content. */}
          <mask id={`${id}-sections`} data-thread="sections" maskUnits="userSpaceOnUse" x="0" y="0">
            <rect width="100%" height="100%" fill="#fff" />
            <g data-thread="shades" />
          </mask>
          <mask id={`${id}-outer`} {...region}>
            {pen("main", LOGO_DRAW.main, LOGO_DRAW.outerWidth)}
            {pen("stem", LOGO_DRAW.stem, LOGO_DRAW.outerWidth)}
          </mask>
          <mask id={`${id}-inner`} {...region}>
            {pen("inner", LOGO_DRAW.inner, LOGO_DRAW.innerWidth)}
          </mask>
        </defs>
        <g mask={`url(#${id}-sections)`}>
          <path data-thread="inner" stroke="var(--color-accent)" strokeLinejoin="round" style={hidden} />
          <path data-thread="stem" stroke="var(--color-paper)" strokeLinejoin="round" style={hidden} />
          <circle data-thread="tip" fill={`url(#${id}-tip)`} style={{ opacity: 0 }} />
        </g>
        {/* The footer mark, drawn whole and on its own as the journey ends. */}
        <g data-thread="logo">
          <path d={LOGO_PATHS.inner} mask={`url(#${id}-inner)`} fill="var(--color-accent)" />
          <path d={LOGO_PATHS.outer} mask={`url(#${id}-outer)`} fill="var(--color-paper)" />
        </g>
      </svg>
    </div>
  );
}
