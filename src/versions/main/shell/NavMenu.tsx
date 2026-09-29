"use client";

import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Asterisk } from "@/versions/main/ui/Label";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type NavMenuItem = { href: string; label: string; description?: string; flag?: string };

/**
 * A primary nav item with a menu of its pages underneath (Services,
 * Industries). The label links to the hub page; hovering or focusing it opens
 * the panel, styled and animated like the Home menu. Escape closes it.
 */
export function NavMenu({
  href,
  label,
  items,
  active,
  highlighted,
  onHover,
}: {
  href: string;
  label: string;
  items: NavMenuItem[];
  active: boolean;
  highlighted: boolean;
  onHover: (hovering: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      root.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <li
      ref={root}
      className="relative"
      onPointerEnter={() => {
        setOpen(true);
        onHover(true);
      }}
      onPointerLeave={() => {
        setOpen(false);
        onHover(false);
      }}
      onFocus={() => {
        setOpen(true);
        onHover(true);
      }}
      onBlur={(event) => {
        if (root.current?.contains(event.relatedTarget as Node)) return;
        setOpen(false);
        onHover(false);
      }}
    >
      {highlighted ? (
        <motion.span layoutId="nav-highlight" aria-hidden className="absolute inset-x-3 bottom-0 h-px rounded-full bg-sky" transition={{ type: "spring", stiffness: 380, damping: 34 }} />
      ) : null}
      <AppLink
        href={href}
        transitionLabel={label}
        aria-current={active ? "page" : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(false)}
        className={cn("relative flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors duration-500", active || open ? "text-fg" : "text-muted hover:text-fg")}
      >
        {label}
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-500", open && "rotate-180")} />
      </AppLink>

      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            initial={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -6, filter: "blur(6px)" }}
            transition={{ duration: 0.35, ease: ease.expo }}
            // pt-3 bridges the gap so the pointer can travel from the pill into the panel.
            className="absolute start-0 top-full z-10 pt-3"
          >
            <ul className="w-96 rounded-3xl border border-line-strong bg-ink-900/95 p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl">
              {items.map((item) => (
                <li key={item.href}>
                  <AppLink
                    href={item.href}
                    transitionLabel={item.label}
                    onClick={() => setOpen(false)}
                    className="group flex items-start gap-3 rounded-2xl px-4 py-3 transition-colors duration-300 hover:bg-paper/10 focus-visible:bg-paper/10"
                  >
                    <Asterisk className="mt-1 size-3 text-subtle transition-colors duration-300 group-hover:text-sky group-focus-visible:text-sky" />
                    <span>
                      <span className="flex items-center gap-2 text-sm text-fg">
                        {item.label}
                        {item.flag ? <span className="rounded-full bg-sky px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-ink-900">{item.flag}</span> : null}
                      </span>
                      {item.description ? <span className="mt-0.5 block text-xs text-subtle">{item.description}</span> : null}
                    </span>
                  </AppLink>
                </li>
              ))}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
