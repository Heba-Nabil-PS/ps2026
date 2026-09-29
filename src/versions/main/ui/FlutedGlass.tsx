import { cn } from "@/lib/utils";

/**
 * Reeded glass (principle P1): vertical flutes that blur and catch the light
 * of whatever sits behind them. Purely decorative. `flute` is the rib width.
 */
export function FlutedGlass({ className, flute = 22 }: { className?: string; flute?: number }) {
  return <div aria-hidden className={cn("fluted pointer-events-none", className)} style={{ ["--flute" as string]: `${flute}px` }} />;
}
