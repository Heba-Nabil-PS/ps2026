"use client";

import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { DrawLogo } from "@/shared/brand/DrawLogo";
import { LanguageSwitch } from "@/versions/option-2/components/navigation/LanguageSwitch";
import { MenuOverlay } from "@/versions/option-2/components/navigation/MenuOverlay";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { useSound } from "@/versions/option-2/components/sound/SoundProvider";
import { LocalTime } from "@/versions/option-2/components/ui/LocalTime";
import { SoundToggle } from "@/versions/option-2/components/ui/SoundToggle";
import { ease } from "@/lib/motion";
import { parseRoute } from "@/versions/registry";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { isStudioRoute } from "@/lib/site";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`);

export function Navbar() {
  // Locale-free path, so server and client agree whatever prefix the proxy used.
  // Locale- and version-free path ("/ar/option-2/about" → "/about"), so it matches nav hrefs.
  const { pathname } = parseRoute(usePathname() ?? "/");
  const { site: siteConfig, t } = useContent();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();
  const { play } = useSound();

  // Hide on scroll down, reveal on scroll up. State only changes when direction flips.
  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const next = current > previous && current > 160;
    if (next !== hidden) setHidden(next);
  });

  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    const focusFrame = requestAnimationFrame(() => document.querySelector<HTMLElement>("#site-menu a")?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, lenis]);

  const closeMenu = () => setMenuOpen(false);

  // Studio routes render their own header (components/studio/StudioHeader).
  if (isStudioRoute(pathname)) return null;

  return (
    <>
      <motion.header
        className="gutter fixed inset-x-0 top-0 z-50 text-fg mix-blend-difference"
        initial={false}
        animate={{ y: hidden && !menuOpen ? "-100%" : "0%" }}
        transition={{ duration: 0.6, ease: ease.expo }}
      >
        <nav aria-label={t.common.main} className="flex items-center justify-between gap-6 py-5 md:py-6">
          <Magnetic strength={0.2} className="shrink-0">
            <TransitionLink
              href="/"
              transitionLabel={t.common.home}
              onClick={closeMenu}
              className="flex items-center gap-3"
              aria-label={`${siteConfig.name} — ${t.common.homeLabel}`}
            >
              {/* Single-colour inside the navbar: it sits in a mix-blend-difference layer */}
              <DrawLogo accent={false} title="" delay={0.6} className="h-16 w-auto md:h-20" />
              <span className="text-label hidden whitespace-nowrap font-normal text-muted sm:inline">{t.common.digitalAgency}</span>
            </TransitionLink>
          </Magnetic>

          <p className="text-label hidden min-w-0 whitespace-nowrap text-muted 2xl:flex 2xl:gap-2">
            <span>{siteConfig.location}</span>
            <LocalTime />
          </p>

          <div className="flex shrink-0 items-center gap-6 md:gap-8">
            <ul className="hidden items-center gap-6 lg:flex xl:gap-7">
              {siteConfig.nav.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Magnetic>
                      <TransitionLink
                        href={item.href}
                        transitionLabel={item.label}
                        aria-current={active ? "page" : undefined}
                        onPointerEnter={() => play("hover")}
                        className="text-label group relative block whitespace-nowrap py-2"
                      >
                        {item.label}
                        <span
                          aria-hidden
                          className={cn(
                            "absolute inset-x-0 bottom-0 h-px origin-left rtl:origin-right bg-current transition-transform duration-500 ease-[var(--ease-expo)]",
                            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                          )}
                        />
                      </TransitionLink>
                    </Magnetic>
                  </li>
                );
              })}
            </ul>
            <LanguageSwitch onNavigate={closeMenu} />
            <SoundToggle className="hidden md:flex" />
            <Magnetic>
              <button
                type="button"
                className="text-label group flex items-center gap-2 whitespace-nowrap py-2"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => {
                  play("click");
                  setMenuOpen((open) => !open);
                }}
              >
                <span aria-hidden className="relative flex h-2.5 w-4 flex-col justify-between">
                  <span className={cn("h-px w-full bg-current transition-transform duration-500", menuOpen && "translate-y-[4.5px] rotate-45")} />
                  <span className={cn("h-px w-full bg-current transition-transform duration-500", menuOpen && "-translate-y-[4.5px] -rotate-45")} />
                </span>
                {menuOpen ? t.common.close : t.common.menu}
              </button>
            </Magnetic>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>{menuOpen ? <MenuOverlay pathname={pathname} onNavigate={closeMenu} /> : null}</AnimatePresence>
    </>
  );
}
