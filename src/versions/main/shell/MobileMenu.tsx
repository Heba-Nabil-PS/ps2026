"use client";

import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/versions/main/shell/LanguageSwitch";
import { ThemeSwitch } from "@/versions/main/shell/ThemeSwitch";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Full-screen menu for touch and small screens: the same order as the
 * desktop nav, set in the stretched face so it reads as a table of contents,
 * with room between the links so each is an easy tap. Start a project closes
 * the list as the one filled action, the same button as in the header.
 * Escape closes it, focus stays inside, and scrolling is paused underneath.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { copy, site } = useCopy();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const items = [...copy.nav.primary, copy.nav.contact];

  useEffect(() => {
    lenis?.stop();
    const previous = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => panel.current?.querySelector<HTMLElement>("a")?.focus());

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panel.current) return;
      const focusables = panel.current.querySelectorAll<HTMLElement>("a, button");
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      lenis?.start();
      previous?.focus?.();
    };
  }, [lenis, onClose]);

  return (
    <motion.div
      ref={panel}
      id="site-menu"
      role="dialog"
      aria-modal="true"
      aria-label={copy.ui.menu}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto overflow-x-hidden bg-ink-950 px-[clamp(1rem,3.2vw,3rem)] pb-10 pt-28"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.8, ease: ease.glass }}
    >
      <FlutedGlass className="absolute inset-0 opacity-60" flute={28} />
      {/* Ambient light that drifts in behind the menu. */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -end-1/4 -top-1/4 size-[80vmax] rounded-full bg-[radial-gradient(closest-side,rgb(140_196_230/0.16),transparent)]"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        transition={{ duration: 1.4, ease: ease.expo }}
      />

      <nav aria-label={copy.ui.mainNav} className="relative">
        <ul className="flex flex-col gap-3 md:gap-2">
          {items.map((item, index) => (
            <li key={item.href} className="overflow-hidden">
              <motion.div
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                exit={{ y: "110%" }}
                transition={{ duration: 0.9, ease: ease.expo, delay: 0.15 + index * 0.05 }}
              >
                <AppLink
                  href={item.href}
                  transitionLabel={item.label}
                  onClick={onClose}
                  aria-current={isActive(pathname, item.href) ? "page" : undefined}
                  className={cn(
                    "group stretch flex items-baseline py-2 text-[clamp(1.25rem,5.6vw,3.5rem)] leading-[1.05] transition-colors",
                    isActive(pathname, item.href) ? "text-sky" : "text-fg",
                  )}
                >
                  <span
                    data-line
                    className="transition-transform duration-700 ease-expo group-hover:translate-x-4 group-focus-visible:translate-x-4 rtl:group-hover:-translate-x-4 rtl:group-focus-visible:-translate-x-4"
                  >
                    {item.label}
                  </span>
                </AppLink>
              </motion.div>
            </li>
          ))}
        </ul>
      </nav>

      <motion.div
        className="relative mt-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.8, ease: ease.expo, delay: 0.2 + items.length * 0.05 }}
      >
        <ButtonLink href={copy.nav.start.href} transitionLabel={copy.nav.start.label} onClick={onClose} className="min-h-14 text-base">
          {copy.nav.start.label}
        </ButtonLink>
      </motion.div>

      <motion.div
        className="relative mt-auto flex flex-wrap items-end justify-between gap-6 pt-12 text-sm text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <a href={`mailto:${site.email}`} className="text-fg underline decoration-line-strong underline-offset-8">
          {site.email}
        </a>
        <div className="flex items-center gap-4">
          <ThemeSwitch className="-my-3" />
          <LanguageSwitch />
        </div>
      </motion.div>
    </motion.div>
  );
}
