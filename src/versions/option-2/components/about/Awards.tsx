import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { ScrollReveal } from "@/versions/option-2/components/portfolio/ScrollReveal";
import { SectionLabel } from "@/versions/option-2/components/ui/SectionLabel";
import { getServerContent } from "@/versions/option-2/i18n/server";
import Image from "next/image";

/**
 * Awards and platform partnerships. The badges are third-party marks, shown in their own
 * colours on a tile of their own background so badge and tile read as one piece.
 */
export async function Awards() {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section id="awards" aria-labelledby="awards-title" className="gutter scroll-mt-24 border-t border-line py-28 md:py-28">
      <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
        <div>
          <SectionLabel className="mb-6">
            {t.about.awardsLabel}
          </SectionLabel>
          <RevealText id="awards-title" as="h2" className="text-display font-extrabold uppercase">
            {t.about.awardsTitle}
          </RevealText>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-muted">{t.about.awardsBody}</p>
      </div>

      <ScrollReveal as="ul" targets="[data-award]" variant="up" stagger={0.09} className="grid grid-cols-1 border-s border-t border-line md:grid-cols-3">
        {siteConfig.awards.map((award) => (
          <li key={award.file} data-award className="flex flex-col border-b border-e border-line">
            <div className="grid aspect-[4/3] place-items-center" style={{ backgroundColor: award.surface }}>
              {/* SVG badges: served as-is, the image optimizer does not rasterize SVG. */}
              <Image
                src={`/images/awards/${award.file}.svg`}
                alt={`${award.title}, ${award.issuer}`}
                width={320}
                height={240}
                unoptimized
                className="h-[80%] w-[86%] object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6 md:p-8">
              <span className="text-label text-accent">{award.kind}</span>
              <h3 className="text-title font-extrabold uppercase">{award.title}</h3>
              <p className="text-sm text-muted">{award.issuer}</p>
              <p className="mt-auto max-w-sm pt-4 leading-relaxed text-muted">{award.body}</p>
            </div>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
