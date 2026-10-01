import { Fragment, type CSSProperties } from "react";

/**
 * One glyph cut in two with its horizontal strokes pulled out between the halves,
 * the "stretched text" effect: the arms of an E or the bar of an H run long and
 * push the rest of the word along.
 *
 * The letter stays in flow, transparent, to give the box its size, and three
 * copies draw it: the part left of the cut, a hairline slice at the cut stretched
 * to fill the gap, and the part right of the cut slid over by the same amount. The
 * copies are generated content, so the heading's text holds the letter once. The
 * gap is `--x` (in em) and the box grows by padding, so the line reflows with it. It starts closed, looking like any other letter: animate `--x`
 * (GSAP handles CSS variables) through `data-stretch-letter`, to `stretchTo`.
 */
const SLICE = 0.02; // em
/** The halves reach this far over the slice, so no seam shows where the pieces meet. */
const LAP = "0.75px";

/**
 * The letters that can stretch, in order of preference, and where each is cut, in
 * % of the glyph's width: past its stem (mid-bar on the H), where a vertical line
 * crosses only horizontal strokes. Set for the display face, Anybody.
 */
const CUTS: Record<string, number> = { e: 65, l: 75, f: 70, t: 85, h: 49 };

/** How the letter pulls out: long, overshooting a little before it settles. */
export const PULL = { duration: 1.4, ease: "elastic.out(1, 0.6)" };
/** The furthest that ease swings past its end value. */
const OVERSHOOT = 1.16;

export function StretchLetter({ children }: { children: string }) {
  const at = `${CUTS[children.toLowerCase()] ?? 60}%`;
  const style = { "--x": 0, paddingInlineEnd: "calc(var(--x) * 1em)" } as CSSProperties;

  // Each piece is a window (overflow hidden, reaching 0.5em above and below the line) onto a copy of the glyph
  // moved so the right part shows through. Windows, not clip-path: Chrome on the GPU could drop a clip-path
  // after the title was scrolled away and back, painting a whole E beside the stretched one. No window is
  // scaled, since a window's edges snap to whole pixels and scaling would blow that up into a visible gap.
  const piece = (left: string, width: string, glyph: CSSProperties, window?: CSSProperties) => (
    <span aria-hidden className="absolute top-[-0.5em] bottom-[-0.5em] overflow-hidden" style={{ left, width, ...window }}>
      <span data-glyph={children} className="absolute left-0 top-[0.5em] whitespace-pre before:content-[attr(data-glyph)]" style={glyph} />
    </span>
  );

  return (
    <span data-stretch-letter className="inline-block" style={style}>
      {/* The letter itself sets the box and stays in the text (for reading and selection), but is drawn by the pieces. */}
      <span className="relative inline-block">
        <span className="text-transparent">{children}</span>
        {piece("-0.5em", `calc(${at} + ${LAP} + 0.5em)`, { transform: "translateX(0.5em)" })}
        {/* The slice: its window opens as wide as the pull, and the glyph inside is stretched from the cut to fill it. */}
        {piece(at, `calc((${SLICE} + var(--x)) * 1em + ${LAP})`, {
          transformOrigin: `${at} 50%`,
          transform: `translateX(calc(-1 * ${at})) scaleX(calc(1 + var(--x) / ${SLICE}))`,
        })}
        {piece(
          `calc(${at} + ${SLICE}em - ${LAP})`,
          `calc(100% - ${at} - ${SLICE}em + ${LAP})`,
          { transform: `translateX(calc(-1 * (${at} + ${SLICE}em - ${LAP})))` },
          { transform: "translateX(calc(var(--x) * 1em))" },
        )}
      </span>
    </span>
  );
}

/**
 * The letter a banner title stretches: E, or in a title without one the next
 * letter in CUTS. Latin only; Arabic letters join, so they are left whole.
 */
export function stretchLetterOf(title: string) {
  return Object.keys(CUTS).find((letter) => title.toLowerCase().includes(letter));
}

/**
 * `text` with every `letter` in it able to stretch; which one does is settled on
 * screen, by the room around it (see `stretchTo`). Their words stay on one row.
 */
export function StretchText({ text, letter }: { text: string; letter?: string }) {
  if (!letter) return text;
  return text.split(" ").map((word, index) => (
    <Fragment key={index}>
      {index > 0 ? " " : null}
      {word.toLowerCase().includes(letter) ? (
        <span className="whitespace-nowrap">
          {Array.from(word, (char, at) => (char.toLowerCase() === letter ? <StretchLetter key={at}>{char}</StretchLetter> : char))}
        </span>
      ) : (
        word
      )}
    </Fragment>
  ));
}

/** Where each piece of `box`'s content sits: one rectangle per row it spans. */
function rowsOf(box: HTMLElement) {
  const range = document.createRange();
  range.selectNodeContents(box);
  return Array.from(range.getClientRects());
}

/**
 * The longest pull (in em, up to `max`) that leaves the rest of `box`, the block
 * the letter's row sits in, where it is: nothing wraps to another row and nothing
 * sticks out, even at the overshoot. 0 when there is no room.
 */
function fitStretch(letter: HTMLElement, box: HTMLElement, max: number) {
  const pull = (x: number) => letter.style.setProperty("--x", String(x));
  // Measured flat: a box still tilted by its entrance would read a sideways push as rows moving.
  const entrance = box.style.transform;
  box.style.transform = "none";
  pull(0);
  const rest = rowsOf(box);

  let x = max;
  for (; x > 0; x -= 0.25) {
    pull(x * OVERSHOOT);
    const edge = box.getBoundingClientRect().right + 1;
    const rows = rowsOf(box);
    if (rows.length === rest.length && rows.every((row, i) => Math.abs(row.top - rest[i].top) < 2 && row.right <= edge)) break;
  }
  pull(0);
  box.style.transform = entrance;
  return Math.max(x, 0);
}

/**
 * The `--x` to tween a title's stretch letters to, as a GSAP function-based value:
 * the first letter with room for a full pull (or, failing that, the one with the
 * most room) gets its length, the others stay closed. `box` selects the block each
 * letter's row sits in. Measured on first use, so when the tween starts, by which
 * time the title's font is in and its lines are in place.
 */
export function stretchTo(box: string, max = 1) {
  let pick: { letter: HTMLElement; x: number } | undefined;

  return (_: number, target: HTMLElement, letters: HTMLElement[]) => {
    if (!pick) {
      pick = { letter: target, x: 0 };
      for (const letter of letters) {
        const x = fitStretch(letter, letter.closest<HTMLElement>(box)!, max);
        if (x > pick.x) pick = { letter, x };
        if (x === max) break;
      }
    }
    return pick.letter === target ? pick.x : 0;
  };
}
