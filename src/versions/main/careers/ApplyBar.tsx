"use client";

import { cn } from "@/lib/utils";
import { useLenis } from "lenis/react";
import { ArrowDown } from "lucide-react";
import { useEffect, useState, type MouseEvent } from "react";

/**
 * Phones and tablets read the role first and find the form at the very end, so a bar pinned to the
 * foot of the screen takes them straight to it. It shows only while the form is still below the
 * screen: it steps away once the form comes into view (and stays away past it, over the footer), and
 * is not needed from lg up, where the form sits beside the brief.
 */
export function ApplyBar({ target, label }: { target: string; label: string }) {
  const lenis = useLenis();
  /** The form is still below the screen. */
  const [ahead, setAhead] = useState(true);

  useEffect(() => {
    const form = document.getElementById(target);
    if (!form) return;
    const observer = new IntersectionObserver(([entry]) => setAhead(!entry.isIntersecting && entry.boundingClientRect.top > 0), { rootMargin: "0px 0px -20% 0px" });
    observer.observe(form);
    return () => observer.disconnect();
  }, [target]);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const form = document.getElementById(target);
    if (!form) return;
    event.preventDefault();
    if (lenis) lenis.scrollTo(form, { offset: -96 });
    else form.scrollIntoView({ behavior: "smooth", block: "start" });
    // Moves focus to the form too (its container, so a phone does not pop its keyboard up uninvited).
    form.focus({ preventScroll: true });
  };

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink-950/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md transition-[translate,opacity] duration-500 ease-expo lg:hidden",
        !ahead && "pointer-events-none translate-y-full opacity-0",
      )}
      inert={!ahead}
    >
      <a
        href={`#${target}`}
        onClick={onClick}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-sky text-[0.95rem] font-medium text-ink-900 transition-colors hover:bg-sky-200"
      >
        {label}
        <ArrowDown aria-hidden className="size-4" />
      </a>
    </div>
  );
}
