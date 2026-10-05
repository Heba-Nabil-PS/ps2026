import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

/** Section label: small caps in steel. */
export function Label({ children, className, as: Component = "p" }: { children: ReactNode; className?: string; as?: "p" | "span" | "h2" }) {
  return (
    <Component className={cn("text-label flex items-center gap-3 text-eyebrow", className)}>
      <span>{children}</span>
    </Component>
  );
}
