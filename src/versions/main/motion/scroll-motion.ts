/**
 * Scroll state shared between ScrollAnimationController (writer) and the
 * home background (reader). A plain object, read every frame, so the
 * background follows the scroll without any React re-render.
 */
export const scrollMotion = {
  /** 0 at the top of the hero, 1 once it has scrolled away. */
  progress: 0,
  /** How far the page has scrolled, in viewport heights. */
  page: 0,
  /** Scroll velocity in px/s, positive downwards; 0 once the scroll has settled. */
  velocity: 0,

  /* The logo in particles, scrubbed by the hero's scroll (see HERO_STATES). */

  /** 0 while the discs float, 1 once every one of them has taken its place on the logo. */
  form: 0,
  /** 0 while the logo holds, 1 once its discs have been let go again. */
  release: 0,
  /** 0 → 1 across the whole hero: the formed logo's slow turn, lift and push-in. */
  travel: 0,
  /** Screens of scroll at which the page behind starts to go quiet (see `calmBehindPage`); null = the home hero's. */
  calmFrom: null as number | null,
};

/**
 * The logo's scroll, in screens (viewport heights) from the top of the page, and
 * where each state of the particle logo sits on it. The hero itself is one screen:
 * the lines start drawing as it begins to scroll away, and the logo goes on
 * forming, holding and breaking apart behind the sections that follow it.
 */
export const HERO_SCREENS = 3.2;
export const HERO_STATES = {
  /** State 1, floating: the very top of the page. State 2, forming: the discs gather into the logo. */
  form: { at: 0.08, screens: 1.12 },
  /** State 3, the formed logo travelling with the scroll, lies between the two. State 4, breaking apart. */
  release: { at: 1.85, screens: 0.9 },
} as const;

/** Screens of scroll at which the home page behind goes quiet: once the hero is on its way out. */
const HOME_CALM_FROM = 0.6;

/**
 * 0 over the hero, rising to 1 as the next section takes the screen (`page` is
 * the scroll in screens): behind the rest of the page, where there is text to
 * read, the background goes quieter.
 */
export function calmBehindPage(page: number) {
  const from = scrollMotion.calmFrom ?? HOME_CALM_FROM;
  const t = Math.min(Math.max((page - from) / 0.9, 0), 1);
  return t * t * (3 - 2 * t);
}
