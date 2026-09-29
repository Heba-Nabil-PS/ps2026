"use client";

import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { useSound } from "@/versions/option-2/components/sound/SoundProvider";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

type PillButtonProps = {
  children: string;
  href?: string;
  onClick?: () => void;
  /** "ink" = dark pill on light sections, "paper" = light pill on dark sections. */
  tone?: "ink" | "paper" | "outline";
  icon?: ReactNode;
  className?: string;
  external?: boolean;
  /** Button-only: "submit" lets the pill submit a form. */
  type?: "button" | "submit";
  disabled?: boolean;
};

const tones = {
  ink: "bg-[#07121f] text-[#f2f3f5]",
  paper: "bg-[#f2f3f5] text-[#07121f]",
  outline: "border border-current text-current transition-colors duration-500 hover:border-[#88bbd8] hover:text-[#07121f]",
};

const fills = {
  ink: "bg-[#122443]",
  paper: "bg-[#88bbd8]",
  outline: "bg-[#88bbd8]",
};

/**
 * Rounded button with a rolling label and a liquid fill that rises from the
 * bottom on hover. Renders a transition link, an external link or a button.
 */
export function PillButton({ children, href, onClick, tone = "ink", icon, className, external, type = "button", disabled }: PillButtonProps) {
  const { play } = useSound();

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-full origin-bottom scale-y-0 rounded-[inherit] transition-transform duration-500 ease-[var(--ease-expo)] group-hover:scale-y-100",
          fills[tone],
        )}
      />
      <span className="relative block overflow-hidden">
        <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">
          {children}
        </span>
        <span
          aria-hidden
          className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0"
        >
          {children}
        </span>
      </span>
      <span className="relative grid size-6 place-items-center overflow-hidden rounded-full">
        {icon ?? (
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-500 ease-[var(--ease-expo)] group-hover:rotate-45"
          />
        )}
      </span>
    </>
  );

  const classes = cn(
    "group relative isolate inline-flex h-12 items-center gap-3 overflow-hidden rounded-full ps-6 pe-4 text-sm font-medium tracking-tight disabled:pointer-events-none disabled:opacity-60 md:h-14 md:text-base",
    tones[tone],
    className,
  );

  const sharedProps = { className: classes, onPointerEnter: () => play("hover") };

  return (
    <Magnetic strength={0.25}>
      {href && external ? (
        <a href={href} {...sharedProps}>
          {content}
        </a>
      ) : href ? (
        <TransitionLink href={href} transitionLabel={children} {...sharedProps}>
          {content}
        </TransitionLink>
      ) : (
        <button
          type={type}
          disabled={disabled}
          {...sharedProps}
          onClick={() => {
            play("click");
            onClick?.();
          }}
        >
          {content}
        </button>
      )}
    </Magnetic>
  );
}
