"use client";

import { Magnetic } from "@/components/animations/Magnetic";
import { Logo } from "@/components/brand/Logo";
import { LanguageSwitch } from "@/components/navigation/LanguageSwitch";
import { MenuOverlay } from "@/components/navigation/MenuOverlay";
import { TransitionLink } from "@/components/navigation/TransitionLink";
import { useSound } from "@/components/sound/SoundProvider";
import { useStudio } from "@/components/studio/StudioProvider";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { ease } from "@/lib/motion";
import { useContent } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useLenis } from "lenis/react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Home-only header: logo, "Let's talk" and a menu pill that follow the section theme. */
export function StudioHeader() {
  const pathname = usePathname();
  const { introDone, headerTheme } = useStudio();
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lenis = useLenis();
  const { play } = useSound();
  const { site, t } = useContent();

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    const next = current > previous && current > 200;
    if (next !== hidden) setHidden(next);
  });

  useEffect(() => {
    if (!menuOpen) return;
    lenis?.stop();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, lenis]);

  const dark = headerTheme === "dark" || menuOpen;
  const pill = dark ? "bg-[#f2f3f5] text-[#0b0c0e]" : "bg-[#0b0c0e] text-[#f2f3f5]";
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 px-4 transition-colors duration-500 md:px-8",
          dark ? "text-[#f2f3f5]" : "text-[#0b0c0e]",
        )}
        initial={{ y: "-110%" }}
        animate={{ y: !introDone || (hidden && !menuOpen) ? "-110%" : "0%" }}
        transition={{ duration: 0.9, ease: ease.expo, delay: introDone && !hidden ? 0.15 : 0 }}
      >
        <nav aria-label={t.common.main} className="flex items-center justify-between py-4 md:py-6">
          <Magnetic strength={0.15}>
            <TransitionLink href="/" onClick={closeMenu} aria-label={`${site.name} — ${t.common.homeLabel}`} className="flex items-center gap-3">
              <Logo accent={false} className="h-9 w-auto md:h-11" title={site.name} />
            </TransitionLink>
          </Magnetic>

          <ul className="text-label hidden items-center gap-8 lg:flex">
            {site.nav.slice(0, 3).map((item) => (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  transitionLabel={item.label}
                  onPointerEnter={() => play("hover")}
                  className="group relative block overflow-hidden py-1"
                >
                  <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0"
                  >
                    {item.label}
                  </span>
                </TransitionLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitch className="me-1 md:me-2" onNavigate={closeMenu} />
            <SoundToggle className="me-2 hidden md:flex" />
            <Magnetic strength={0.2} className="hidden sm:inline-block">
              <TransitionLink
                href="/contact"
                transitionLabel={t.common.contact}
                onClick={closeMenu}
                onPointerEnter={() => play("hover")}
                className={cn(
                  "group flex h-11 items-center gap-2 overflow-hidden rounded-full ps-5 pe-4 text-sm font-medium transition-colors duration-500",
                  pill,
                )}
              >
                <span className="relative block overflow-hidden">
                  <span className="block transition-transform duration-500 ease-[var(--ease-expo)] group-hover:-translate-y-full">
                    {t.common.letsTalk}
                  </span>
                  <span
                    aria-hidden
                    className="absolute inset-0 block translate-y-full transition-transform duration-500 ease-[var(--ease-expo)] group-hover:translate-y-0"
                  >
                    {t.common.letsTalk}
                  </span>
                </span>
                <span aria-hidden className="size-1.5 rounded-full bg-[#88bbd8] transition-transform duration-500 group-hover:scale-150" />
              </TransitionLink>
            </Magnetic>
            <Magnetic strength={0.2}>
              <button
                type="button"
                aria-expanded={menuOpen}
                aria-controls="site-menu"
                onClick={() => {
                  play("click");
                  setMenuOpen((open) => !open);
                }}
                className={cn(
                  "group flex h-11 items-center gap-3 rounded-full ps-5 pe-4 text-sm font-medium transition-colors duration-500",
                  dark ? "bg-white/10 backdrop-blur-md" : "bg-black/[0.06] backdrop-blur-md",
                )}
              >
                {menuOpen ? t.common.close : t.common.menu}
                <span aria-hidden className="relative flex size-4 items-center justify-center">
                  <span
                    className={cn(
                      "absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-expo)]",
                      menuOpen ? "rotate-45" : "-translate-y-[3px] group-hover:-translate-y-[4px]",
                    )}
                  />
                  <span
                    className={cn(
                      "absolute h-[1.5px] w-4 bg-current transition-transform duration-500 ease-[var(--ease-expo)]",
                      menuOpen ? "-rotate-45" : "translate-y-[3px] group-hover:translate-y-[4px]",
                    )}
                  />
                </span>
              </button>
            </Magnetic>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>{menuOpen ? <MenuOverlay pathname={pathname} onNavigate={closeMenu} /> : null}</AnimatePresence>
    </>
  );
}
