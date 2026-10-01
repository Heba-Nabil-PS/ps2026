import { cn } from "@/lib/utils";

/** Small editorial label, e.g. "Selected work". */
export function SectionLabel({ children, className }: { children: string; className?: string }) {
  return (
    <p className={cn("text-label flex items-center gap-3 text-muted", className)}>
      <span>{children}</span>
    </p>
  );
}
