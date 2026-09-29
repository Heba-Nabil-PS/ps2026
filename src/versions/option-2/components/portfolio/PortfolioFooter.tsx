import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { ScrollReveal } from "@/versions/option-2/components/portfolio/ScrollReveal";
import { BackToTop } from "@/versions/option-2/components/ui/BackToTop";
import { LocalTime } from "@/versions/option-2/components/ui/LocalTime";
import { getServerContent } from "@/versions/option-2/i18n/server";
import { ArrowUpRight } from "lucide-react";

/** Large editorial footer for the portfolio experience. */
export async function PortfolioFooter() {
  const { site: siteConfig, t } = await getServerContent();
  const navigation = [{ label: t.common.home, href: "/" }, ...siteConfig.nav.filter((item) => !item.href.startsWith("#"))];
  return (
    <footer id="contact" className="gutter relative overflow-hidden border-t border-line pt-14 md:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-1/2 left-1/2 size-[90vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklab,var(--color-accent)_12%,transparent),transparent)]"
      />

      <div className="relative">
        <RevealText as="p" className="text-label mb-8 text-muted">
          {t.portfolio.conversation}
        </RevealText>
        <RevealText as="h2" mode="words" className="text-mega font-extrabold uppercase">
          {t.portfolio.footerTitle}
        </RevealText>

        <Magnetic strength={0.12} className="mt-8 md:mt-10">
          <a href={`mailto:${siteConfig.email}`} className="group inline-flex items-center gap-4 md:gap-8">
            <span className="text-display font-serif font-medium italic transition-colors duration-500 group-hover:text-accent">{t.portfolio.footerCta}</span>
            <span className="flex size-16 items-center justify-center rounded-full border border-fg/30 transition-[background-color,border-color,transform] duration-700 ease-[var(--ease-expo)] group-hover:rotate-45 rtl:group-hover:-rotate-45 group-hover:border-accent group-hover:bg-accent md:size-24">
              <ArrowUpRight aria-hidden className="size-6 transition-colors group-hover:text-bg md:size-8" />
            </span>
          </a>
        </Magnetic>
      </div>

      <ScrollReveal targets="[data-col]" className="relative mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:mt-20 md:grid-cols-12">
        <div data-col className="col-span-2 md:col-span-4">
          <p className="text-label mb-4 text-muted">{t.common.email}</p>
          <a href={`mailto:${siteConfig.email}`} className="text-title font-medium transition-colors hover:text-accent">
            {siteConfig.email}
          </a>
        </div>
        <nav data-col aria-label={t.portfolio.footerNav} className="md:col-span-2 md:col-start-7">
          <p className="text-label mb-4 text-muted">{t.common.navigation}</p>
          <ul className="flex flex-col gap-2">
            {navigation.map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} transitionLabel={item.label} className="transition-colors hover:text-accent">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>
        <div data-col className="md:col-span-2">
          <p className="text-label mb-4 text-muted">{t.common.offices}</p>
          <ul className="flex flex-col gap-2">
            {siteConfig.offices.map((office) => (
              <li key={office.city}>{office.city}</li>
            ))}
          </ul>
        </div>
        <div data-col className="col-span-2 md:col-span-2">
          <p className="text-label mb-4 text-muted">{t.common.localTime}</p>
          <p className="flex flex-col gap-2">
            <span>{siteConfig.location}</span>
            <LocalTime className="tabular-nums text-muted" />
          </p>
        </div>
      </ScrollReveal>

      {/* Sits at the end edge so the fixed version pill (bottom start corner) never covers it. */}
      <div className="text-label relative mt-12 flex flex-wrap items-center justify-end gap-x-10 gap-y-3 border-t border-line py-6 text-muted">
        <p>
          © {new Date().getFullYear()} {siteConfig.name}
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
