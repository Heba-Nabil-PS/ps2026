"use client";

import { useLocale } from "@/i18n/locale-context";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Magnetic } from "@/versions/main/motion/Magnetic";
import { NavUnderline } from "@/versions/main/shell/NavMenu";
import { AppLink } from "@/versions/main/ui/AppLink";
import { versionHref, versions } from "@/versions/registry";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

/**
 * "Home" in the main navigation, with the design versions underneath
 * (Home, Home Option 2, …) read from src/versions/registry.ts. The current
 * design is an in-app link; other versions are plain links, because each
 * has its own root layout and loads as a fresh page.
 */
export function HomeMenu({ active, highlighted, onHover }: { active: boolean; highlighted: boolean; onHover: (hovering: boolean) => void }) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLLIElement>(null);
  const menuId = useId();
  // A mouse opens the menu on hover, so its click must not toggle it shut again.
  const pointerType = useRef<string>("");
  const main = versions[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        root.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
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
      onBlur={(event) => {
        if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <Magnetic>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={menuId}
          onPointerDown={(event) => (pointerType.current = event.pointerType)}
          onClick={() => {
            if (pointerType.current === "mouse") setOpen(true);
            else setOpen((value) => !value);
            pointerType.current = "";
          }}
          onFocus={() => onHover(true)}
          className={cn("relative flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors duration-500", active || open ? "text-fg" : "text-muted hover:text-fg")}
        >
          {main.label[locale]}
          <ChevronDown aria-hidden className={cn("size-3.5 transition-transform duration-500", open && "rotate-180")} />
          <NavUnderline shown={highlighted} />
        </button>
      </Magnetic>

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
            <ul className="w-72 rounded-3xl border border-line-strong bg-ink-900/95 p-2 shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl">
              {versions.map((version) => {
                const current = version.id === "main";
                const content = (
                  <>
                    <span>
                      <span className="block text-sm text-fg">{version.label[locale]}</span>
                      <span className="block text-xs text-subtle">{version.description[locale]}</span>
                    </span>
                  </>
                );
                const className = "group flex items-start gap-3 rounded-2xl px-4 py-3 transition-colors duration-300 hover:bg-paper/10 focus-visible:bg-paper/10";
                return (
                  <li key={version.id}>
                    {current ? (
                      <AppLink href="/" transitionLabel={version.label[locale]} className={className} aria-current={active ? "page" : undefined} onClick={() => setOpen(false)}>
                        {content}
                      </AppLink>
                    ) : (
                      <a href={versionHref("/", version.id, locale)} className={className}>
                        {content}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}
