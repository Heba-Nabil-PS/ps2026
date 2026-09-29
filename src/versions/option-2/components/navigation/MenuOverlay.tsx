"use client";

import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { LocalTime } from "@/versions/option-2/components/ui/LocalTime";
import { SoundToggle } from "@/versions/option-2/components/ui/SoundToggle";
import { portfolioHref } from "@/data/portfolio";
import { parseRoute } from "@/versions/registry";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { ease } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";

type MenuOverlayProps = {
  pathname: string;
  onNavigate: () => void;
};

/** Full-screen menu: staggered primary links, project shortcuts and contact. */
export function MenuOverlay({ pathname: currentPath, onNavigate }: MenuOverlayProps) {
  const { site: siteConfig, portfolio, t } = useContent();
  const links = [{ label: t.common.home, href: "/" }, ...siteConfig.nav, ...siteConfig.moreNav];
  const shortcuts = portfolio.slice(0, 4);
  const { pathname } = parseRoute(currentPath);
  return (
    <motion.div
      id="site-menu"
      aria-label={t.common.menu}
      className="gutter fixed inset-0 z-40 flex flex-col overflow-y-auto bg-surface pb-8 pt-24 md:pt-32"
      initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
      exit={{ clipPath: "inset(0% 0% 100% 0%)", transition: { duration: 0.6, ease: ease.quart, delay: 0.1 } }}
      transition={{ duration: 0.8, ease: ease.expo }}
      data-lenis-prevent
    >
      {/* Ambient light that drifts in behind the menu */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -end-1/4 -top-1/4 size-[80vmax] rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_16%,transparent),transparent)]"
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        transition={{ duration: 1.4, ease: ease.expo }}
      />

      <div className="relative grid flex-1 grid-cols-1 gap-12 md:grid-cols-12">
        <nav aria-label={t.common.menu} className="md:col-span-7">
          <ul className="flex flex-col">
            {links.map((item, i) => {
              const active = pathname === item.href || (item.href.length > 1 && pathname.startsWith(`${item.href}/`));
              return (
                <li key={item.href} className="overflow-hidden border-b border-line/60">
                  <motion.div
                    initial={{ y: "105%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "105%", transition: { duration: 0.4, ease: ease.quart } }}
                    transition={{ duration: 0.9, ease: ease.expo, delay: 0.12 + i * 0.06 }}
                  >
                    <TransitionLink
                      href={item.href}
                      transitionLabel={item.label}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className="group flex items-baseline justify-between py-2 md:py-3"
                    >
                      <span
                        className={cn(
                          "text-headline font-extrabold uppercase transition-[color,transform] duration-700 ease-[var(--ease-expo)] group-hover:translate-x-4 group-focus-visible:translate-x-4 rtl:group-hover:-translate-x-4 rtl:group-focus-visible:-translate-x-4",
                          active ? "text-accent" : "text-fg group-hover:text-accent",
                        )}
                      >
                        {item.label}
                      </span>
                      <span className="text-label tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                    </TransitionLink>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        </nav>

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
            {shortcuts.map((project) => (
              <li key={project.slug}>
                <TransitionLink href={portfolioHref(project.slug)} transitionLabel={project.title} onClick={onNavigate} className="group block">
                  <span className="relative block aspect-[4/3] overflow-hidden" style={{ backgroundColor: project.color }}>
                    <Image
                      src={project.heroImage}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 16vw, 45vw"
                      className="object-cover transition-transform duration-1000 ease-[var(--ease-expo)] group-hover:scale-110"
                    />
                  </span>
                  <span className="mt-2 block text-sm font-medium">{project.title}</span>
                  <span className="text-label mt-1 block text-muted">{project.category}</span>
                </TransitionLink>
              </li>
            ))}
          </ul>
        </motion.aside>
      </div>

      <motion.div
        className="relative mt-12 flex flex-wrap items-end justify-between gap-6 border-t border-line pt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.8, delay: 0.45 }}
      >
        <div className="flex flex-col gap-3">
          <a href={`mailto:${siteConfig.email}`} className="text-title font-medium transition-colors hover:text-accent">
            {siteConfig.email}
          </a>
          <p className="text-label flex gap-2 text-muted">
            {siteConfig.location} <LocalTime />
          </p>
        </div>
        <ul className="text-label flex flex-wrap gap-x-6 gap-y-2 text-muted">
          {siteConfig.offices.map((office) => (
            <li key={office.city}>{office.city}</li>
          ))}
          <li>{siteConfig.website}</li>
        </ul>
        <SoundToggle />
      </motion.div>
    </motion.div>
  );
}
