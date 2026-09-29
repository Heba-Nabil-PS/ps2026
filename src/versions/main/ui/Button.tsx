"use client";

import { cn } from "@/lib/utils";
import { Magnetic } from "@/versions/main/motion/Magnetic";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "glass" | "line";

const base =
  "group sheen inline-flex min-h-12 items-center gap-4 rounded-full ps-6 pe-2 py-2 text-[0.95rem] font-medium tracking-[-0.01em] transition-[border-color,color] duration-500 ease-expo disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Sky-tinted glass (principle P6): the one primary action per view.
  primary: "glass-button glass-button-primary",
  // Clear frosted glass for every other action.
  glass: "glass-button",
  line: "border border-line-strong text-fg hover:border-fg",
};

function Content({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className={cn(
          "grid size-8 place-items-center rounded-full transition-transform duration-700 ease-expo group-hover:rotate-45 rtl:-scale-x-100",
          variant === "line"
            ? "bg-paper text-ink-900"
            : "bg-white/12 text-paper ring-1 ring-inset ring-white/25 backdrop-blur-md transition-[background-color,color,transform] group-hover:bg-paper group-hover:text-ink-900",
        )}
      >
        <ArrowUpRight className="size-4" />
      </span>
    </>
  );
}

/** Internal or external link styled as a glass button, with magnetic pull and a light sheen. */
export function ButtonLink({
  href,
  variant = "primary",
  children,
  className,
  transitionLabel,
  ...props
}: Omit<ComponentProps<typeof AppLink>, "children"> & { variant?: Variant; children: ReactNode }) {
  return (
    <Magnetic>
      <AppLink href={href} transitionLabel={transitionLabel} className={cn(base, variants[variant], className)} {...props}>
        <Content variant={variant}>{children}</Content>
      </AppLink>
    </Magnetic>
  );
}

export function Button({ variant = "primary", children, className, ...props }: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <Magnetic>
      <button className={cn(base, variants[variant], className)} {...props}>
        <Content variant={variant}>{children}</Content>
      </button>
    </Magnetic>
  );
}
