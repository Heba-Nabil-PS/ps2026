import { LOGO_PATHS, LOGO_VIEWBOX, viewBoxOf } from "@/components/brand/logo-paths";
import { cn } from "@/lib/utils";

/**
 * The PSdigital mark: one continuous line inspired by the infinity symbol.
 * Paths come straight from the master artwork (see logo-paths.ts); the
 * viewBox is cropped to the artwork's true bounds so the logo optically
 * aligns with text next to it.
 *
 * `variant="mark"` drops the wordmark. The thin inner line uses the identity's
 * soft blue on dark surfaces, exactly as it appears on the brand cover.
 */
export function Logo({
  variant = "full",
  className,
  accent = true,
  title = "PSdigital",
}: {
  variant?: "full" | "mark";
  className?: string;
  /** Tint the inner line with the brand blue (set false for single-colour contexts). */
  accent?: boolean;
  title?: string;
}) {
  return (
    <svg viewBox={viewBoxOf(LOGO_VIEWBOX[variant])} role="img" aria-label={title} className={cn("fill-current", className)}>
      {/* Inner line */}
      <path style={accent ? { fill: "var(--color-accent)" } : undefined} d={LOGO_PATHS.inner} />
      {/* Outer line + stem */}
      <path d={LOGO_PATHS.outer} />
      {variant === "full" ? (
        <g>
          {LOGO_PATHS.wordmark.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      ) : null}
    </svg>
  );
}
