/** Seeded, so the server and the browser draw the same sky. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const next = random(7);
/** Three layers that twinkle out of step with each other. */
const layers = Array.from({ length: 3 }, () =>
  Array.from({ length: 70 }, () => ({
    x: +(next() * 100).toFixed(2),
    y: +(next() * 100).toFixed(2),
    r: +(0.035 + next() * 0.075).toFixed(3),
    o: +(0.35 + next() * 0.65).toFixed(2),
  })),
);

/** The universe's star field: tiny white dots on a square that turns with the orbit. */
export function Stars() {
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden>
      {layers.map((stars, layer) => (
        <g key={layer} className="universe-twinkle" style={{ animationDelay: `${layer * -1.6}s` }} fill="#fff">
          {stars.map((star, index) => (
            <circle key={index} cx={star.x} cy={star.y} r={star.r} opacity={star.o} />
          ))}
        </g>
      ))}
    </svg>
  );
}
