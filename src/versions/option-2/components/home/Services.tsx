import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { ScrollMarquee } from "@/versions/option-2/components/ui/ScrollMarquee";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import { getServerContent } from "@/versions/option-2/i18n/server";

export async function Services() {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section aria-labelledby="services-title" className="py-28 md:py-28">
      <ScrollMarquee
        items={siteConfig.services.map((service) => service.title)}
        className="text-mega mb-24 font-extrabold uppercase md:mb-20"
      />

      <div className="gutter grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel className="mb-6">
            {t.site.capabilitiesLabel}
          </SectionLabel>
          <RevealText id="services-title" as="h2" className="text-headline font-extrabold uppercase">
            {t.site.capabilitiesTitle}
          </RevealText>
        </div>

        <ol className="border-b border-line md:col-span-8">
          {siteConfig.services.map((service, i) => (
            <li
              key={service.title}
              className="group relative grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-t border-line py-7 md:grid-cols-[4rem_1fr_minmax(0,18rem)] md:py-9"
            >
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 h-px origin-left rtl:origin-right scale-x-0 bg-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:scale-x-100"
              />
              <span className="text-label tabular-nums text-muted transition-colors group-hover:text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title font-medium transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-3 rtl:group-hover:-translate-x-3">
                {service.title}
              </h3>
              <p className="col-start-2 mt-3 max-w-sm text-sm leading-relaxed text-muted md:col-start-3 md:mt-0">
                {service.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
