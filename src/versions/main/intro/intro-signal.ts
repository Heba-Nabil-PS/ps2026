/**
 * Tells the home hero when the intro has opened onto it. The intro fires this
 * as its curtain starts to split (or at once when it does not play), and the
 * hero starts its own entrance then, so the two read as one sequence.
 *
 * Module state: once the intro has revealed the page it stays revealed for the
 * rest of the visit, so later client-side visits to the home animate at once.
 */

let revealed = false;
const listeners = new Set<() => void>();

export function signalIntroReveal() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((listener) => listener());
  listeners.clear();
}

/** Runs `callback` once the page is revealed (immediately if it already is). Returns an unsubscribe. */
export function onIntroReveal(callback: () => void) {
  if (revealed) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/** The <html> class the head script sets when the intro should play (see the main layout). */
export const INTRO_CLASS = "intro-play";

/*
 * The intro's logo flies into the hero and becomes its mark. While the intro plays it
 * claims the mark (so the hero does not draw its own), and hands it over as it lands.
 */
let markCarried = false;

/** Called by the intro, before the hero builds its entrance, when its logo will land on the hero mark (and with false once it is done). */
export function carryIntroMark(carry = true) {
  markCarried = carry;
}

/** Whether the hero mark arrives with the intro's logo rather than drawing itself. */
export function introCarriesMark() {
  return markCarried;
}

/*
 * Client-side visits to the home replay the whole intro (see RouteTransition), so the home
 * always opens the same way. The intro listens for the request; `onCovered` runs once its
 * curtain is up, which is when the route may change underneath it.
 */
let replayListener: ((onCovered: () => void) => void) | undefined;

/** Called by the intro to take replay requests. Returns an unsubscribe. */
export function onIntroReplay(listener: (onCovered: () => void) => void) {
  replayListener = listener;
  return () => {
    if (replayListener === listener) replayListener = undefined;
  };
}

/** Plays the intro again, landing on the home hero. Returns false when no intro can play (the caller navigates as usual). */
export function replayIntro(onCovered: () => void) {
  if (!replayListener) return false;
  revealed = false;
  markCarried = true;
  document.documentElement.classList.add(INTRO_CLASS);
  replayListener(onCovered);
  return true;
}
