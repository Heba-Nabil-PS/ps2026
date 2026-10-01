"use client";

import { cn } from "@/lib/utils";
import { Magnetic } from "@/versions/main/motion/Magnetic";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ArrowUpRight } from "lucide-react";
import type { ComponentProps, PointerEvent, ReactNode } from "react";

type Variant = "primary" | "glass" | "line";

const base =
  "group inline-flex min-h-12 items-center gap-3 rounded-full ps-6 pe-2 py-2 text-[0.95rem] font-medium tracking-[-0.01em] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  // Sky-whispered liquid glass (principle P6): the one primary action per view.
  primary: "glass-button glass-button-primary",
  // Clear liquid glass for every other action.
  glass: "glass-button",
  line: "sheen border border-line-strong text-fg transition-[border-color,color,transform] duration-300 hover:border-fg active:scale-[0.97]",
};

/** Feeds the pointer position to the glass so its light follows the cursor. */
function trackLight(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
  el.style.setProperty("--my", `${event.clientY - rect.top}px`);
}

function Content({ children, variant }: { children: ReactNode; variant: Variant }) {
  return (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className={cn(
          "grid size-8 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-300 rtl:-scale-x-100",
          variant === "line"
            ? "bg-paper text-ink-900"
            : "bg-fg/10 text-paper shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] ring-1 ring-inset ring-fg/15 group-hover:bg-paper group-hover:text-ink-900",
        )}
      >
        <span className="arrow-swap">
          <ArrowUpRight className="size-4" />
          <ArrowUpRight className="size-4" />
        </span>
      </span>
    </>
  );
}

/** Internal or external link styled as a liquid-glass button, with magnetic pull and a light that follows the pointer. */
export function ButtonLink({
  href,
  variant = "primary",
  children,
  className,
  transitionLabel,
  onPointerMove,
  ...props
}: Omit<ComponentProps<typeof AppLink>, "children"> & { variant?: Variant; children: ReactNode }) {
  return (
    <Magnetic>
      <AppLink
        href={href}
        transitionLabel={transitionLabel}
        className={cn(base, variants[variant], className)}
        onPointerMove={(event) => {
          if (variant !== "line") trackLight(event);
          onPointerMove?.(event);
        }}
        {...props}
      >
        <Content variant={variant}>{children}</Content>
      </AppLink>
    </Magnetic>
  );
}

export function Button({ variant = "primary", children, className, onPointerMove, ...props }: ComponentProps<"button"> & { variant?: Variant; children: ReactNode }) {
  return (
    <Magnetic>
      <button
        className={cn(base, variants[variant], className)}
        onPointerMove={(event) => {
          if (variant !== "line") trackLight(event);
          onPointerMove?.(event);
        }}
        {...props}
      >
        <Content variant={variant}>{children}</Content>
      </button>
    </Magnetic>
  );
}
