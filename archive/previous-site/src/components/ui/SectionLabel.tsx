import { cn } from "@/lib/utils";

/** Small editorial index label, e.g. "(02) Selected work". */
export function SectionLabel({ index, children, className }: { index?: string; children: string; className?: string }) {
  return (
    <p className={cn("text-label flex items-center gap-3 text-muted", className)}>
      {index ? <span className="text-accent">({index})</span> : null}
      <span>{children}</span>
    </p>
  );
}
