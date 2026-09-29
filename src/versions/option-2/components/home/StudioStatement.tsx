import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { ScrollHighlightText } from "@/versions/option-2/components/animations/ScrollHighlightText";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import { getServerContent } from "@/versions/option-2/i18n/server";
import { ArrowUpRight } from "lucide-react";

export async function StudioStatement() {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section aria-labelledby="studio-title" className="gutter border-t border-line py-28 md:py-28">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel>{t.site.whoWeAre}</SectionLabel>
          <h2 id="studio-title" className="sr-only">
            {t.site.whoWeAre}
          </h2>
        </div>

        <div className="md:col-span-9">
          <ScrollHighlightText className="text-headline font-extrabold uppercase">
            {t.site.statement}
          </ScrollHighlightText>

          <dl className="mt-20 grid grid-cols-1 gap-10 border-t border-line pt-10 sm:grid-cols-3 md:mt-28">
            {siteConfig.stats.map((stat, i) => (
              <div key={stat.value} className="flex flex-col">
                <dt className="order-2 mt-4 text-sm leading-relaxed text-muted">{stat.label}</dt>
                <dd className="order-1">
                  <RevealText as="span" delay={i * 0.08} className="text-display block font-extrabold tabular-nums text-accent">
                    {stat.value}
                  </RevealText>
                </dd>
              </div>
            ))}
          </dl>

          <Magnetic className="mt-14">
            <TransitionLink
              href="/about"
              transitionLabel={siteConfig.nav[2].label}
              className="text-label group flex items-center gap-3 border-b border-line pb-2 transition-colors hover:border-fg"
            >
              {t.site.insideAgency}
              <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45" />
            </TransitionLink>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
