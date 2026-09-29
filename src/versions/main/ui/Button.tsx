"use client";

import { cn } from "@/lib/utils";
import { Magnetic } from "@/versions/main/motion/Magnetic";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

type Variant = "metal" | "glass" | "line";

const base =
  "group sheen inline-flex min-h-12 items-center gap-4 rounded-full ps-6 pe-2 py-2 text-[0.95rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color] duration-500 ease-expo disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Brushed steel (principle P6): the one primary action per view.
  metal: "bg-[linear-gradient(180deg,#f7f9fb_0%,#c9d4df_55%,#a9bacb_100%)] text-ink-900 shadow-[inset_0_1px_0_rgb(255_255_255/0.8),0_12px_30px_-12px_rgb(140_196_230/0.45)]",
  glass: "glass text-fg hover:border-line-strong",
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
          variant === "metal" ? "bg-ink-900 text-paper" : "bg-paper text-ink-900",
        )}
      >
        <ArrowUpRight className="size-4" />
      </span>
    </>
  );
}

/** Internal or external link styled as a button, with magnetic pull and a metal sheen. */
export function ButtonLink({
  href,
  variant = "metal",
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

export function Button({ variant = "metal", children, className, ...props }: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <Magnetic>
      <button className={cn(base, variants[variant], className)} {...props}>
        <Content variant={variant}>{children}</Content>
      </button>
    </Magnetic>
  );
}
