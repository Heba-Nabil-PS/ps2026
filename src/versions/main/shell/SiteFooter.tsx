"use client";

import { useCopy } from "@/versions/main/use-copy";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Asterisk } from "@/versions/main/ui/Label";
import { industryHref, serviceHref } from "@/versions/main/data/routes";
import { useLenis } from "lenis/react";

/**
 * Every page ends on the quiet sitemap (services, industries, company) and
 * studio details.
 */
export function SiteFooter() {
  const { copy, site, industries } = useCopy();
  const lenis = useLenis();

  const columns = [
    { title: copy.footer.services, links: copy.services.list.map((service) => ({ label: service.title, href: serviceHref(service.slug) })) },
    { title: copy.footer.industries, links: industries.map((industry) => ({ label: industry.title, href: industryHref(industry.slug) })) },
    {
      title: copy.footer.company,
      links: [
        ...copy.nav.primary.filter((item) => item.href !== "/services" && item.href !== "/industries"),
        copy.nav.team,
        copy.nav.contact,
        copy.nav.start,
      ],
    },
  ];

  return (
    <footer className="gutter relative pb-8">
      <div className="grid gap-12 border-t border-line pb-10 pt-10 text-sm md:grid-cols-12">
        <nav aria-label={copy.footer.sitemap} className="grid gap-12 sm:grid-cols-3 md:col-span-8">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-label mb-5 text-subtle">{column.title}</h2>
              <ul className="flex flex-col gap-3">
                {column.links.map((item) => (
                  <li key={item.href}>
                    <AppLink href={item.href} transitionLabel={item.label} className="text-muted transition-colors hover:text-fg">
                      {item.label}
                    </AppLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-10 md:col-span-4">
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.studios}</h2>
            <ul className="grid gap-5 sm:grid-cols-2">
              {site.offices.map((office) => (
                <li key={office.city}>
                  <p className="text-fg">{office.city}</p>
                  <p className="mt-1 max-w-[16rem] text-muted">{office.address}</p>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.write}</h2>
            <a href={`mailto:${site.email}`} className="text-fg transition-colors hover:text-sky">
              {site.email}
            </a>
            <p className="mt-3">
              <AppLink href="/careers" transitionLabel={copy.meta.pages.careers.title} className="text-muted transition-colors hover:text-fg">
                {copy.footer.careers}
              </AppLink>
            </p>
          </div>
          <div>
            <h2 className="text-label mb-5 text-subtle">{copy.footer.awards}</h2>
            <ul className="flex flex-wrap items-center gap-3">
              {site.awards.map((award) => (
                <li key={award.file} className="flex h-14 items-center overflow-hidden rounded-md p-1" style={{ backgroundColor: award.surface }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG badge, nothing to optimize */}
                  <img src={`/images/awards/${award.file}.svg`} alt={`${award.title}, ${award.issuer}`} title={`${award.title}, ${award.issuer}`} className="h-full w-auto" loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-subtle">
        <p className="flex items-center gap-2">
          <Asterisk className="text-sky" />© {new Date().getFullYear()} {site.name}. {copy.ui.copyright}
        </p>
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => (lenis ? lenis.scrollTo(0) : window.scrollTo({ top: 0, behavior: "smooth" }))} className="transition-colors hover:text-fg">
            {copy.ui.backToTop}
          </button>
        </div>
      </div>
    </footer>
  );
}
