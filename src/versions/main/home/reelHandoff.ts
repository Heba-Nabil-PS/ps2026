/**
 * The handoff between the positioning frame and the showreel. The positioning
 * frame lands on exactly the showreel's opening rectangle (the same share of the
 * screen, the same crop, the same corners), so the two read as one frame.
 */
export const REEL_START_SIZE = { phone: 0.88, wide: 0.65 } as const;
export const REEL_START_RADIUS = 28;
