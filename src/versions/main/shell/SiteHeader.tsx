"use client";

import { DrawLogo } from "@/shared/brand/DrawLogo";
import { DrawWordmark } from "@/shared/brand/DrawWordmark";
import { stripLocale } from "@/i18n/config";
import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/versions/main/shell/LanguageSwitch";
import { Magnetic } from "@/versions/main/motion/Magnetic";
import { MobileMenu } from "@/versions/main/shell/MobileMenu";
import { NavUnderline } from "@/versions/main/shell/NavMenu";
import { ThemeSwitch } from "@/versions/main/shell/ThemeSwitch";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Header (deck slide 8, "first scroll, first impression"). Logo, plain text
 * links that lean toward the pointer and draw a thin underline on hover,
 * the language switch and one filled action, Start a project. Hides while
 * reading down, returns on the way up.
 */
export function SiteHeader() {
  const { copy } = useCopy();
  const { pathname } = stripLocale(usePathname() ?? "/");
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const nextHidden = current > previous && current > 240;
    if (nextHidden !== hidden) setHidden(nextHidden);
    const nextScrolled = current > 40;
    if (nextScrolled !== scrolled) setScrolled(nextScrolled);
  });

  // At the top of the home page the hero carries the mark, so the header shows the name alone (one mark per view).
  // Once the bar tightens into the capsule, the full logo draws itself in.
  const wordmarkOnly = pathname === "/" && !scrolled;

  const links = [...copy.nav.primary, copy.nav.contact];
  const highlighted = hovered ?? links.find((item) => isActive(pathname, item.href))?.href ?? null;

  return (
    <>
      <motion.header
        className="gutter fixed inset-x-0 top-0 z-50"
        // Rendered in place (no slide-in on load), so navigation is visible even before scripts run.
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
        transition={{ duration: 0.8, ease: ease.expo, delay: 0 }}
      >
        {/* At the top of the page the bar sits straight on the hero (ribbed glass, photography), so a soft scrim in the
            page colour settles the ground under the links and keeps them readable. It fades as the capsule takes over. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-20 h-40 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-900)_70%,transparent),transparent)] transition-opacity duration-700 light:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-900)_88%,transparent)_0%,color-mix(in_srgb,var(--color-ink-900)_55%,transparent)_55%,transparent)]",
            scrolled ? "opacity-0" : "opacity-100",
          )}
        />
        {/* Once the page scrolls, the bar tightens into a slim frosted capsule: the logo and actions draw in toward the centre. */}
        <div
          className={cn(
            "relative mx-auto transition-[max-width,margin,padding] duration-700 ease-expo",
            scrolled ? "mt-3 max-w-6xl px-4 md:mt-4 md:px-6" : "mt-0 max-w-full px-0",
          )}
        >
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 -z-10 rounded-full border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-900)_88%,transparent),color-mix(in_srgb,var(--color-ink-900)_72%,transparent))] shadow-[0_20px_40px_-24px_rgb(0_0_0/0.7)] light:shadow-[0_20px_40px_-24px_rgb(13_29_49/0.25)] backdrop-blur-md transition-[opacity,transform,border-color] duration-700 ease-expo",
              scrolled ? "scale-100 border-line opacity-100" : "scale-95 border-transparent opacity-0",
            )}
          />
        <div
          className={cn(
            "relative flex items-center justify-between gap-6 transition-[padding] duration-700 ease-expo",
            scrolled ? "py-1.5" : "py-4 md:py-5",
          )}
        >
          <Magnetic strength={0.2} className="relative z-10 shrink-0">
            <AppLink href="/" transitionLabel={copy.ui.home} aria-label={copy.ui.homeLabel} onClick={() => setMenuOpen(false)}>
              {wordmarkOnly ? (
                <DrawWordmark delay={0.3} className="block h-5 w-auto md:h-6" />
              ) : (
                <DrawLogo
                  title=""
                  delay={pathname === "/" ? 0 : 0.3}
                  redrawEvery={30}
                  className={cn(
                    "w-auto transition-[height] duration-700 ease-expo",
                    scrolled ? "h-10 md:h-12" : "h-14 md:h-18",
                  )}
                />
              )}
            </AppLink>
          </Magnetic>

          {/* At the top of the page (on wide screens) the links sit on the true page centre, in line with the hero logo.
              Once scrolled into the capsule they centre in the space between the logo and the actions instead. */}
          <nav
            aria-label={copy.ui.mainNav}
            className={cn(
              "hidden min-w-0 flex-1 justify-center xl:flex",
              !scrolled && "2xl:absolute 2xl:left-1/2 2xl:top-1/2 2xl:-translate-x-1/2 2xl:-translate-y-1/2",
            )}
          >
            <ul
              className="flex items-center gap-1 2xl:gap-3"
              onPointerLeave={() => setHovered(null)}
            >
              {links.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Magnetic>
                      <AppLink
                        href={item.href}
                        transitionLabel={item.label}
                        aria-current={active ? "page" : undefined}
                        onPointerEnter={() => setHovered(item.href)}
                        onFocus={() => setHovered(item.href)}
                        onBlur={() => setHovered(null)}
                        className={cn(
                          "relative flex items-center gap-1.5 whitespace-nowrap px-3 py-2.5 text-base font-medium tracking-[-0.005em] transition-colors duration-500 2xl:text-[1.0625rem]",
                          // Light mode: inactive links in near-navy, not steel, so they clear 4.5:1 over the hero.
                          active ? "text-fg" : "text-muted hover:text-fg light:text-fg/80 light:hover:text-fg",
                        )}
                      >
                        {item.label}
                        <NavUnderline shown={highlighted === item.href} />
                      </AppLink>
                    </Magnetic>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-5">
            <ThemeSwitch className="-me-3 hidden sm:grid light:text-fg/80" />
            <LanguageSwitch className="hidden min-h-11 items-center px-1 text-sm text-muted transition-colors hover:text-fg light:font-medium light:text-fg/80 sm:inline-flex" />
            <ButtonLink href={copy.nav.start.href} transitionLabel={copy.nav.start.label} className="hidden min-h-11 text-sm md:inline-flex">
              {copy.nav.start.label}
            </ButtonLink>
            <button
              type="button"
              className="glass flex min-h-11 items-center gap-3 rounded-full px-5 text-sm xl:hidden"
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span aria-hidden className="relative flex h-2.5 w-4 flex-col justify-between">
                <span className={cn("h-px w-full bg-current transition-transform duration-500", menuOpen && "translate-y-[4.5px] rotate-45")} />
                <span className={cn("h-px w-full bg-current transition-transform duration-500", menuOpen && "-translate-y-[4.5px] -rotate-45")} />
              </span>
              {menuOpen ? copy.ui.close : copy.ui.menu}
            </button>
          </div>
        </div>
        </div>
      </motion.header>

      <AnimatePresence>{menuOpen ? <MobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}
