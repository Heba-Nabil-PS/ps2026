import { RevealText } from "@/components/animations/RevealText";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { getServerContent } from "@/i18n/server";
import Image from "next/image";

/**
 * A light page, like the client wall in the company profile: the logos are
 * printed artwork on white, so the section carries its own light theme.
 */
export async function Clients({ index = "04" }: { index?: string }) {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section aria-labelledby="clients-title" className="theme-light gutter py-28 md:py-40">
      <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
        <div>
          <SectionLabel index={index} className="mb-6">
            {t.site.clientsLabel}
          </SectionLabel>
          <RevealText id="clients-title" as="h2" className="text-headline font-extrabold uppercase">
            {t.site.clientsTitle}
          </RevealText>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted">
          {t.site.clientsBody}
        </p>
      </div>

      <ScrollReveal
        as="ul"
        targets="[data-client]"
        variant="up"
        stagger={0.04}
        className="grid grid-cols-2 border-s border-t border-line sm:grid-cols-3 lg:grid-cols-5"
      >
        {siteConfig.clients.map((client) => (
          <li
            key={client.file}
            data-client
            // The tile needs its own background: mix-blend-multiply blends against
            // it, which is what drops the white box around each printed logo.
            className="group relative flex aspect-[3/2] items-center justify-center overflow-hidden border-b border-e border-line bg-bg px-6 py-8"
          >
            <span
              aria-hidden
              className="absolute inset-0 translate-y-full bg-surface transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0"
            />
            <Image
              src={`/images/clients/${client.file}.png`}
              alt={client.name}
              width={280}
              height={120}
              sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 45vw"
              className="relative max-h-14 w-auto max-w-[72%] object-contain opacity-85 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-100"
            />
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
