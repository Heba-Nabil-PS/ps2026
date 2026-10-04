/**
 * The handoff between the positioning frame and the showreel. The positioning
 * frame lands on exactly the showreel's opening rectangle (the same share of the
 * screen, the same crop, the same corners), so the two read as one frame.
 * The share is set across (w) and down (h): phones keep the frame shorter than the
 * screen, so it reads as a card rather than a wall.
 */
export const REEL_START_SIZE = { phone: { w: 0.88, h: 0.6 }, wide: { w: 0.65, h: 0.65 } } as const;
export const REEL_START_RADIUS = 28;
