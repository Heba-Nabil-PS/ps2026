import { Magnetic } from "@/components/animations/Magnetic";
import { TransitionLink } from "@/components/navigation/TransitionLink";
import { Logo } from "@/components/brand/Logo";
import { BackToTop } from "@/components/ui/BackToTop";
import { LocalTime } from "@/components/ui/LocalTime";
import { getServerContent } from "@/i18n/server";
import { ArrowUpRight } from "lucide-react";

export async function Footer() {
  const { site: siteConfig, t } = await getServerContent();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="gutter relative overflow-hidden border-t border-line pt-16 md:pt-24">
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
        <div className="col-span-2 md:col-span-5">
          <p className="text-label mb-5 text-muted">{t.common.newBusiness}</p>
          <Magnetic strength={0.15}>
            <a
              href={`mailto:${siteConfig.email}`}
              className="text-title group inline-flex items-center gap-3 font-medium tracking-tight"
            >
              {siteConfig.email}
              <ArrowUpRight
                aria-hidden
                className="size-[0.8em] text-accent transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              />
            </a>
          </Magnetic>
        </div>

        <nav aria-label={t.common.footer} className="md:col-span-2 md:col-start-7">
          <p className="text-label mb-5 text-muted">{t.common.sitemap}</p>
          <ul className="flex flex-col gap-2">
            {[{ label: t.common.home, href: "/" }, ...siteConfig.nav].map((item) => (
              <li key={item.href}>
                <TransitionLink href={item.href} transitionLabel={item.label} className="transition-colors hover:text-accent">
                  {item.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="col-span-2 md:col-span-3">
          <p className="text-label mb-5 text-muted">{t.common.offices}</p>
          <ul className="flex flex-col gap-4">
            {siteConfig.offices.map((office) => (
              <li key={office.city}>
                <p className="font-medium">{office.city}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{office.address}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-2 md:col-span-2">
          <p className="text-label mb-5 text-muted">{t.common.localTime}</p>
          <p className="flex flex-col gap-2">
            <span>{siteConfig.location}</span>
            <LocalTime className="tabular-nums text-muted" />
          </p>
        </div>
      </div>

      <Logo className="mt-20 h-24 w-auto text-fg md:mt-32 md:h-44" title={siteConfig.name} />

      <div className="text-label flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-muted">
        <p>
          © {year} {siteConfig.name}. {t.common.rightsReserved}
        </p>
        <BackToTop />
      </div>
    </footer>
  );
}
