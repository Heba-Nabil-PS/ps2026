"use client";

import { DrawLogo } from "@/shared/brand/DrawLogo";
import { stripLocale } from "@/i18n/config";
import { useCopy } from "@/versions/main/use-copy";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { LanguageSwitch } from "@/versions/main/shell/LanguageSwitch";
import { HomeMenu } from "@/versions/main/shell/HomeMenu";
import { MobileMenu } from "@/versions/main/shell/MobileMenu";
import { NavMenu, type NavMenuItem } from "@/versions/main/shell/NavMenu";
import { industryHref, serviceHref } from "@/versions/main/data/routes";
import { AppLink } from "@/versions/main/ui/AppLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

/**
 * Header (deck slide 8, "first scroll, first impression"). Logo, plain text
 * links with a thin underline that slides to the hovered item (Services and Industries
 * open a menu of their pages), the language switch and one filled action,
 * Start a project. Hides while reading down, returns on the way up.
 */
export function SiteHeader() {
  const { copy, industries } = useCopy();
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

  // Pages under a hub, listed in its menu (sitemap: /services/[slug], /industries/[slug]).
  const menus: Record<string, NavMenuItem[]> = {
    "/services": [
      { href: "/services", label: copy.nav.menus.services },
      ...copy.services.list.map((service) => ({ href: serviceHref(service.slug), label: service.title, description: service.summary })),
    ],
    "/industries": [
      { href: "/industries", label: copy.nav.menus.industries },
      ...industries.map((industry) => ({
        href: industryHref(industry.slug),
        label: industry.title,
        description: industry.short,
        flag: industry.flagship ? copy.nav.menus.flagship : undefined,
      })),
    ],
  };

  const highlighted = hovered ?? (pathname === "/" ? "/" : (copy.nav.primary.find((item) => isActive(pathname, item.href))?.href ?? null));

  return (
    <>
      <motion.header
        className="gutter fixed inset-x-0 top-0 z-50"
        // Rendered in place (no slide-in on load), so navigation is visible even before scripts run.
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-110%" : "0%" }}
        transition={{ duration: 0.8, ease: ease.expo, delay: 0 }}
      >
        {/* Navy frosted bar once the page scrolls, so content never shows through the logo and actions. */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -z-10 border-b bg-[linear-gradient(180deg,rgb(7_18_31/0.92),rgb(7_18_31/0.78))] shadow-[0_20px_40px_-24px_rgb(0_0_0/0.7)] backdrop-blur-xl transition-[opacity,border-color] duration-700 ease-expo",
            scrolled ? "border-line opacity-100" : "border-transparent opacity-0",
          )}
        />
        <div className="relative flex items-center justify-between gap-6 py-4 md:py-5">
          <AppLink href="/" transitionLabel={copy.ui.home} aria-label={copy.ui.homeLabel} className="relative z-10 shrink-0" onClick={() => setMenuOpen(false)}>
            <DrawLogo title="" delay={0.3} className="h-14 w-auto md:h-[4.5rem]" />
          </AppLink>

          <nav aria-label={copy.ui.mainNav} className="hidden xl:block">
            <ul
              className="flex items-center gap-2"
              onPointerLeave={() => setHovered(null)}
            >
              <HomeMenu active={pathname === "/"} highlighted={highlighted === "/"} onHover={(hovering) => setHovered(hovering ? "/" : null)} />
              {copy.nav.primary.map((item) => {
                const active = isActive(pathname, item.href);
                const menu = menus[item.href];
                if (menu) {
                  return (
                    <NavMenu
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      items={menu}
                      active={active}
                      highlighted={highlighted === item.href}
                      onHover={(hovering) => setHovered(hovering ? item.href : null)}
                    />
                  );
                }
                return (
                  <li key={item.href} className="relative">
                    {highlighted === item.href ? (
                      <motion.span
                        layoutId="nav-highlight"
                        aria-hidden
                        className="absolute inset-x-3 bottom-0 h-px rounded-full bg-sky"
                        transition={{ type: "spring", stiffness: 380, damping: 34 }}
                      />
                    ) : null}
                    <AppLink
                      href={item.href}
                      transitionLabel={item.label}
                      aria-current={active ? "page" : undefined}
                      onPointerEnter={() => setHovered(item.href)}
                      onFocus={() => setHovered(item.href)}
                      onBlur={() => setHovered(null)}
                      className={cn(
                        "relative flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors duration-500",
                        active ? "text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      {item.label}
                    </AppLink>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative z-10 flex items-center gap-5">
            <LanguageSwitch className="hidden min-h-11 items-center px-1 text-sm text-muted transition-colors hover:text-fg sm:inline-flex" />
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
      </motion.header>

      <AnimatePresence>{menuOpen ? <MobileMenu pathname={pathname} onClose={() => setMenuOpen(false)} /> : null}</AnimatePresence>
    </>
  );
}
