"use client";

import { portfolioHref } from "@/data/portfolio";
import { useContent } from "@/versions/main/portfolio/content";
import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/versions/main/shell/LanguageSwitch";
import { ThemeSwitch } from "@/versions/main/shell/ThemeSwitch";
import { AppLink } from "@/versions/main/ui/AppLink";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Full-screen menu for touch and small screens: the same order as the
 * desktop nav, set in the stretched face so it reads as a table of contents,
 * with shortcuts into the portfolio beside it.
 * Escape closes it, focus stays inside, and scrolling is paused underneath.
 */
export function MobileMenu({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const { copy, site } = useCopy();
  const { portfolio, t } = useContent();
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

      <div className="relative grid grid-cols-1 gap-12 md:grid-cols-12">
      <nav aria-label={copy.ui.mainNav} className="md:col-span-7">
        <ul className="flex flex-col gap-0.5">
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
                    "group stretch flex items-baseline py-1.5 text-[clamp(1.25rem,5.6vw,3.5rem)] leading-[1.05] transition-colors",
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

        {/* Shortcuts into the portfolio. */}
        <motion.aside
          aria-label={t.common.projectShortcuts}
          className="md:col-span-4 md:col-start-9"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          transition={{ duration: 0.9, ease: ease.expo, delay: 0.35 }}
        >
          <p className="text-label mb-5 text-muted">{t.common.selectedWork}</p>
          <ul className="grid grid-cols-2 gap-4">
            {portfolio.slice(0, 4).map((project) => (
              <li key={project.slug}>
                <AppLink href={portfolioHref(project.slug)} transitionLabel={project.title} onClick={onClose} className="group block">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-xl" style={{ backgroundColor: project.color }}>
                    <Image
                      src={project.heroImage}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 16vw, 45vw"
                      className="object-cover transition-transform duration-1000 ease-expo group-hover:scale-110"
                    />
                  </span>
                  <span className="mt-2 block text-sm font-medium text-fg">{project.title}</span>
                  <span className="text-label mt-1 block text-muted">{project.category}</span>
                </AppLink>
              </li>
            ))}
          </ul>
        </motion.aside>
      </div>


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
