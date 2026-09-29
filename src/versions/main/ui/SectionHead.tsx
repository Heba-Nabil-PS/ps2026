import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Label } from "@/versions/main/ui/Label";
import type { ReactNode } from "react";

/**
 * The standard section opening: ✳ label, stretched two-line title, and an
 * optional intro and action aligned to the end column. Keeps every section
 * on every page starting the same way (P8: quiet, numbered structure).
 */
export function SectionHead({
  label,
  title,
  intro,
  action,
  className,
}: {
  label: string;
  title: readonly string[];
  intro?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-8 md:grid-cols-12 md:items-end", className)}>
      <div className="md:col-span-8">
        <Label className="mb-6">
          {label}
        </Label>
        <StretchHeading lines={title} className="text-headline" />
      </div>
      {intro || action ? (
        <Reveal className="flex flex-col items-start gap-6 md:col-span-4 md:pb-2">
          {intro ? (
            <p data-reveal-item className="max-w-sm text-muted">
              {intro}
            </p>
          ) : null}
          {action ? <div data-reveal-item>{action}</div> : null}
        </Reveal>
      ) : null}
    </header>
  );
}
