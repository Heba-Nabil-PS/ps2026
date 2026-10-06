import { LOGO_DRAW, LOGO_PATHS, LOGO_VIEWBOX, viewBoxOf } from "@/shared/brand/logo-paths";
import { Fragment, useId, type ReactNode, type SVGProps } from "react";

export type DrawStroke = "main" | "stem" | "inner";

/** Props every mask stroke needs; the renderer adds its own animation props on top. */
export type DrawStrokeProps = SVGProps<SVGPathElement> & {
  d: string;
  "data-draw": DrawStroke;
};

/**
 * The logo as a drawable SVG: each ribbon is filled normally but masked by a
 * thick white stroke along its centre line (see LOGO_DRAW). Animate the
 * strokes' dash offset and the artwork appears as if drawn by one pen.
 *
 * `renderStroke` decides how the strokes animate (GSAP targets `[data-draw]`,
 * Framer Motion returns motion.path), so both drivers share the same markup.
 */
export function DrawableLogo({
  variant = "mark",
  renderStroke,
  className,
  accent = true,
  title,
  children,
}: {
  variant?: "full" | "mark";
  renderStroke: (props: DrawStrokeProps) => ReactNode;
  className?: string;
  /** Tint the inner line with the brand blue (false for single-colour contexts). */
  accent?: boolean;
  /** Accessible name; without it the drawing is decorative. */
  title?: string;
  /** Extra artwork drawn on top, e.g. the wordmark. */
  children?: ReactNode;
}) {
  const uid = useId().replace(/[^\w-]/g, "");
  const box = LOGO_VIEWBOX[variant];
  // The mask region must include the stroke overhang past the artwork edges.
  const region = { maskUnits: "userSpaceOnUse" as const, x: box.x - 80, y: box.y - 80, width: box.width + 160, height: box.height + 160 };
  const stroke = (name: DrawStroke, d: string, width: number) => (
    <Fragment key={name}>
      {renderStroke({ d, "data-draw": name, fill: "none", stroke: "#fff", strokeWidth: width, strokeLinecap: "butt", strokeLinejoin: "round" })}
    </Fragment>
  );

  return (
    <svg viewBox={viewBoxOf(box)} focusable="false" className={className} {...(title ? { role: "img", "aria-label": title } : { "aria-hidden": true })}>
      <defs>
        <mask id={`${uid}-outer`} {...region}>
          {stroke("main", LOGO_DRAW.main, LOGO_DRAW.outerWidth)}
          {stroke("stem", LOGO_DRAW.stem, LOGO_DRAW.outerWidth)}
        </mask>
        <mask id={`${uid}-inner`} {...region}>
          {stroke("inner", LOGO_DRAW.inner, LOGO_DRAW.innerWidth)}
        </mask>
      </defs>
      <path data-logo-part="inner" d={LOGO_PATHS.inner} mask={`url(#${uid}-inner)`} fill={accent ? "var(--color-accent)" : "currentColor"} />
      <path data-logo-part="outer" d={LOGO_PATHS.outer} mask={`url(#${uid}-outer)`} fill="currentColor" />
      {children}
    </svg>
  );
}
