"use client";

import { useCopy } from "@/versions/main/use-copy";
import { AppLink } from "@/versions/main/ui/AppLink";
import { industryHref, serviceHref } from "@/versions/main/data/routes";
import { LOGO_PATHS, LOGO_VIEWBOX, viewBoxOf } from "@/shared/brand/logo-paths";
import { DrawableLogo } from "@/shared/brand/DrawableLogo";
import { directionsHref } from "@/versions/main/sections/Offices";
import { useLenis } from "lenis/react";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/** The wordmark's own bounds in the logo artwork (cap tops to the g's descender). */
const WORDMARK_BOX = { x: 482, y: 782, width: 546, height: 130 };
/** Where the wordmark sits over the mark's box in the full logo, as fractions of that box. */
const WORDMARK_PLACE: CSSProperties = {
  left: `${((WORDMARK_BOX.x - LOGO_VIEWBOX.mark.x) / LOGO_VIEWBOX.mark.width) * 100}%`,
  top: `${((WORDMARK_BOX.y - LOGO_VIEWBOX.mark.y) / LOGO_VIEWBOX.mark.height) * 100}%`,
  width: `${(WORDMARK_BOX.width / LOGO_VIEWBOX.mark.width) * 100}%`,
  height: `${(WORDMARK_BOX.height / LOGO_VIEWBOX.mark.height) * 100}%`,
};

/**
 * Every page ends on the quiet sitemap (services, industries, company) and
 * studio details.
 */
export function SiteFooter() {
  const { copy, site, industries } = useCopy();
  const lenis = useLenis();
  const markRef = useRef<HTMLDivElement>(null);
  /** Phones fold the sitemap columns into an accordion (the column title that is open, or none). */
  const [openColumn, setOpenColumn] = useState<string | null>(null);

  // Off the home page there is no thread to end here (LogoThread drives the mark there), so the mark draws itself
  // whenever the footer's room comes into view, and wipes away again when it leaves.
  useEffect(() => {
    const mark = markRef.current;
    if (!mark) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (document.querySelector("[data-logo-thread]")) return;
        mark.toggleAttribute("data-drawn", entry.isIntersecting);
      },
      { threshold: 0.6 },
    );
    observer.observe(mark);
    return () => observer.disconnect();
  }, []);

  const columns = [
    { title: copy.footer.services, links: copy.services.list.map((service) => ({ label: service.title, href: serviceHref(service.slug) })) },
    { title: copy.footer.industries, links: industries.map((industry) => ({ label: industry.title, href: industryHref(industry.slug) })) },
    {
      title: copy.footer.company,
      links: [
        ...copy.nav.primary.filter((item) => item.href !== "/services" && item.href !== "/industries"),
        copy.nav.contact,
        copy.nav.start,
      ],
    },
  ];

  return (
    <footer className="gutter relative pb-8 pt-6">
      {/* The ground is its own layer under the content, so the home page's thread (LogoThread) can draw between them. */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-navy-800" />
      <div className="grid gap-10 pt-4 text-sm sm:gap-12 sm:pt-10 md:grid-cols-12">
        {/* Phones: each column folds behind its title, so the footer opens on the studios rather than three long lists. */}
        <nav aria-label={copy.footer.sitemap} className="grid border-b border-line sm:gap-12 sm:border-0 sm:grid-cols-3 md:col-span-8">
          {columns.map((column, index) => {
            const expanded = openColumn === column.title;
            const list = `footer-column-${index}`;
            return (
            <div key={column.title} className="border-t border-line sm:border-0">
              <h2 className="text-label mb-5 hidden text-subtle sm:block">{column.title}</h2>
              <h2 className="sm:hidden">
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={list}
                  onClick={() => setOpenColumn(expanded ? null : column.title)}
                  className="text-label flex min-h-13 w-full items-center justify-between text-start text-subtle"
                >
                  {column.title}
                  <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-500 ease-expo", expanded && "rotate-180")} />
                </button>
              </h2>
              <ul id={list} className={cn("flex flex-col items-start gap-3 max-md:gap-0 max-sm:pb-4 pointer-coarse:gap-0", !expanded && "max-sm:hidden")}>
                {column.links.map((item) => (
                  <li key={item.href}>
                    <AppLink href={item.href} transitionLabel={item.label} className="-my-1.5 inline-flex items-center py-1.5 text-muted transition-colors hover:text-fg max-md:my-0 max-md:min-h-11 max-md:py-0 pointer-coarse:my-0 pointer-coarse:min-h-11 pointer-coarse:py-0">
                      {item.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
            );
          })}
        </nav>
        <div className="flex flex-col gap-8 sm:gap-10 md:col-span-4 md:row-span-2">
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.studios}</h2>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-5">
              {site.offices.map((office) => (
                <li key={office.city}>
                  <a
                    href={directionsHref(office.address)}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${office.city}, ${office.address}: ${copy.ui.directions}`}
                    className="group block"
                  >
                    <span className="flex items-center gap-2 text-fg transition-colors group-hover:text-sky">
                      {office.city}
                      <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45 rtl:-scale-x-100" />
                    </span>
                    <span className="mt-1 block max-w-[16rem] text-muted transition-colors group-hover:text-fg">{office.address}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.write}</h2>
            <a href={`mailto:${site.email}`} className="-my-3 inline-block py-3 text-fg transition-colors hover:text-sky">
              {site.email}
            </a>
          </div>
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.awards}</h2>
            <ul className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              {site.awards.map((award) => (
                <li key={award.file} className="flex h-14 items-center sm:h-16 sm:w-28 justify-center overflow-hidden rounded-md p-1.5" style={{ backgroundColor: award.surface }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG badge, nothing to optimize */}
                  <img src={`/images/awards/${award.file}.svg`} alt={`${award.title}, ${award.issuer}`} title={`${award.title}, ${award.issuer}`} className="h-full w-full object-contain" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </div>
        {/* Room for the home page's thread to draw the mark again (LogoThread); on pages without it, the footer
            draws it itself. Under the sitemap, beside the studio column, so it adds no height. The mark is
            always drawn left to right, so on Arabic pages it is pushed to the right edge, where reading starts. */}
        <div ref={markRef} aria-hidden data-footer-mark dir="ltr" className="footer-mark md:col-span-8 md:self-end ar:justify-end">
          <span data-footer-mark-logo className="footer-mark-logo" style={{ aspectRatio: `${LOGO_VIEWBOX.mark.width} / ${LOGO_VIEWBOX.mark.height}` }}>
            <DrawableLogo className="block h-full w-full text-paper" renderStroke={(stroke) => <path {...stroke} pathLength={1} />} />
            {/* The name rises in once the mark is mostly drawn, letter by letter, where and as large as it sits in
                the header logo. Its own layer, so it shows on the home page too, where the thread draws the mark. */}
            <span className="footer-mark-name" style={WORDMARK_PLACE}>
              <svg viewBox={viewBoxOf(WORDMARK_BOX)} focusable="false" className="block h-full w-full text-paper">
                {LOGO_PATHS.wordmark.map((d, index) => (
                  <path key={d} d={d} fill="currentColor" style={{ "--i": index } as CSSProperties} />
                ))}
              </svg>
            </span>
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-subtle">
        <p>
          © {new Date().getFullYear()} {site.name}. {copy.ui.copyright}
        </p>
        <div className="flex items-center gap-6">
          <button
            type="button"
            aria-label={copy.ui.backToTop}
            title={copy.ui.backToTop}
            onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))}
            className="group grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-colors duration-500 hover:border-sky hover:bg-sky hover:text-ink-900"
          >
            <ArrowUp aria-hidden className="size-4 transition-transform duration-500 ease-expo group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
