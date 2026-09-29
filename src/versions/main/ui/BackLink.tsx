import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowLeft } from "lucide-react";

/** The "← back to the index" link on every detail page (roles, industries, insights, services, work). */
export function BackLink({ href, label, transitionLabel }: { href: string; label: string; transitionLabel?: string }) {
  return (
    <AppLink href={href} transitionLabel={transitionLabel ?? label} className="group text-label flex items-center gap-3 text-muted transition-colors hover:text-fg">
      <ArrowLeft aria-hidden className="size-4 transition-transform duration-500 group-hover:-translate-x-1 rtl:-scale-x-100 rtl:group-hover:translate-x-1" />
      {label}
    </AppLink>
  );
}
