"use client";

import { useLocale } from "@/i18n/locale-context";
import { useCopy } from "@/versions/main/use-copy";
import { versionHref, versions } from "@/versions/registry";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/versions/main/shell/LanguageSwitch";
import { AppLink } from "@/versions/main/ui/AppLink";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Full-screen menu for touch and small screens: the same order as the
 * desktop nav, set in the stretched face so it reads as a table of contents.
 * Escape closes it, focus stays inside, and scrolling is paused underneath.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { copy, site } = useCopy();
  const locale = useLocale();
  const lenis = useLenis();
  const panel = useRef<HTMLDivElement>(null);
  const items = [...copy.nav.primary, copy.nav.contact, copy.nav.start];

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
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-ink-950/95 px-[clamp(1rem,3.2vw,3rem)] pb-10 pt-28"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.8, ease: ease.glass }}
    >
      <FlutedGlass className="absolute inset-0 opacity-60" flute={28} />
      <nav aria-label={copy.ui.mainNav} className="relative">
        <ul className="flex flex-col gap-1">
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
                    "stretch flex items-baseline gap-4 py-1 text-[clamp(2.4rem,11vw,5rem)] leading-[0.95] transition-colors",
                    isActive(pathname, item.href) ? "text-sky" : "text-fg",
                  )}
                >
                  <span className="font-sans text-xs font-normal tracking-normal text-subtle normal-case tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <span data-line>{item.label}</span>
                </AppLink>
              </motion.div>
            </li>
          ))}
        </ul>
      </nav>

      {/* Design versions: other versions load as a fresh page (separate root layouts). */}
      <motion.ul
        className="relative mt-10 flex flex-wrap gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.45 } }}
        exit={{ opacity: 0 }}
      >
        {versions.slice(1).map((version) => (
          <li key={version.id}>
            <a href={versionHref("/", version.id, locale)} className="glass inline-flex flex-col rounded-2xl px-4 py-3">
              <span className="text-sm text-fg">{version.label[locale]}</span>
              <span className="text-xs text-subtle">{version.description[locale]}</span>
            </a>
          </li>
        ))}
      </motion.ul>

      <motion.div
        className="relative mt-auto flex flex-wrap items-end justify-between gap-6 pt-12 text-sm text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.5 } }}
        exit={{ opacity: 0 }}
      >
        <a href={`mailto:${site.email}`} className="text-fg underline decoration-line-strong underline-offset-8">
          {site.email}
        </a>
        <LanguageSwitch />
      </motion.div>
    </motion.div>
  );
}
