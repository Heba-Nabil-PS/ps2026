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
