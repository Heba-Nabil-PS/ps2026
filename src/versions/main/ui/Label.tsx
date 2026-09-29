import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** The ✳ signature mark (principle P9). Decorative; spins inside a `.group` on hover. */
export function Asterisk({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn("asterisk size-[0.9em] shrink-0 fill-current", className)}>
      {[0, 45, 90, 135].map((angle) => (
        <rect key={angle} x="10.75" y="0" width="2.5" height="24" rx="1.25" transform={`rotate(${angle} 12 12)`} />
      ))}
    </svg>
  );
}

/** Section label: ✳ + small caps in steel. Optional index ("01") after the text. */
export function Label({ children, index, className, as: Component = "p" }: { children: ReactNode; index?: string; className?: string; as?: "p" | "span" | "h2" }) {
  return (
    <Component className={cn("text-label flex items-center gap-3 text-muted", className)}>
      <Asterisk className="text-sky" />
      <span>{children}</span>
      {index ? <span className="text-subtle tabular-nums">/{index}</span> : null}
    </Component>
  );
}
