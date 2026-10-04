import { cn } from "@/lib/utils";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowLeft } from "lucide-react";

/** The "← back to the index" link on every detail page (roles, industries, insights, services, work). */
export function BackLink({ href, label, transitionLabel, large }: { href: string; label: string; transitionLabel?: string; large?: boolean }) {
  return (
    <AppLink
      href={href}
      transitionLabel={transitionLabel ?? label}
      className={cn("group text-label -my-3 flex items-center gap-3 py-3 text-muted transition-colors hover:text-fg", large && "gap-4 text-base uppercase tracking-[0.14em] md:text-lg rtl:tracking-normal")}
    >
      <ArrowLeft
        aria-hidden
        className={cn(
          "size-4 transition-transform duration-500 group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1",
          large && "size-5 md:size-6",
        )}
      />
      {label}
    </AppLink>
  );
}
