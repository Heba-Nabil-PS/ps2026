import { RevealText } from "@/components/animations/RevealText";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getServerContent } from "@/i18n/server";
import Image from "next/image";

/** Why PSdigital — the four reasons from the company profile, over the agency floor. */
export async function Reasons({ index = "02" }: { index?: string }) {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section aria-labelledby="reasons-title" className="relative overflow-hidden border-t border-line py-28 md:py-44">
      <div aria-hidden className="absolute inset-0">
        <Image src="/images/site/why.webp" alt="" fill sizes="100vw" className="object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/85 to-bg/55 rtl:bg-gradient-to-l" />
      </div>

      <div className="gutter relative">
        <SectionLabel index={index} className="mb-6">
          {t.site.reasonsLabel}
        </SectionLabel>
        <RevealText id="reasons-title" as="h2" className="text-display font-extrabold uppercase" lineClassName="md:nth-2:ps-[6vw]">
          {t.site.reasonsTitle}
        </RevealText>

        <ScrollReveal
          as="ol"
          targets="[data-reason]"
          variant="up"
          stagger={0.09}
          className="mt-16 grid grid-cols-1 gap-x-12 gap-y-10 md:mt-28 md:grid-cols-2"
        >
          {siteConfig.reasons.map((reason, i) => (
            <li key={reason.title} data-reason className="flex flex-col gap-4 border-t border-line pt-6">
              <span className="text-label tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-title font-extrabold uppercase text-accent">{reason.title}</h3>
              <p className="max-w-md leading-relaxed text-fg/80">{reason.body}</p>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
