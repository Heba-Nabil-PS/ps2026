import type { Insight } from "@/data/insights";
import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import { fill, formatDate, getCopy } from "@/versions/main/copy";
import { workHref } from "@/versions/main/data/work";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { InsightCard } from "@/versions/main/sections/InsightCard";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Label } from "@/versions/main/ui/Label";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * An article: the title and lead, the cover rising into place, the text with
 * an "in this article" index beside it, the case study it draws on, then more.
 */
export function InsightView({ lang, insight }: { lang: Locale; insight: Insight }) {
  const { copy, work, insights: list } = getCopy(lang);
  const labels = copy.insights;
  const minutes = fill(labels.minutes, { count: String(insight.read) });
  const related = insight.related ? work.find((project) => project.slug === insight.related) : undefined;
  const more = list.filter((item) => item.slug !== insight.slug).slice(0, 3);
  const closing = copy.home.closing;

  // Long "Topic: explanation" titles keep only the topic at headline size; the rest drops to a deck line.
  const split = insight.title.length > 60 ? insight.title.match(/^(.+?)[:：]\s+(.+)$/) : null;
  const headline = split ? split[1] : insight.title;
  const deck = split ? split[2] : undefined;

  // Headings get stable ids for the index beside the text.
  let heading = 0;
  const blocks = insight.body.map((block) => (block.type === "heading" ? { ...block, id: `section-${++heading}` } : { ...block, id: undefined }));
  const toc = blocks.filter((block) => block.type === "heading");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.lead,
    image: `${siteConfig.url}${insight.cover}`,
    inLanguage: lang,
    publisher: { "@type": "Organization", name: siteConfig.name, url: siteConfig.url },
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="gutter pb-14 pt-36 md:pt-44">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <BackLink href="/insights" label={labels.back} transitionLabel={copy.meta.pages.insights.title} />
          <p className="text-label tabular-nums text-subtle">{minutes}</p>
        </div>
        <Label className="mb-8">{insight.topic}</Label>
        <StretchHeading as="h1" lines={[headline]} immediate delay={0.3} className="text-headline max-w-[22ch]" />
        {deck ? (
          <Reveal immediate delay={0.6} className="mt-6 md:mt-8">
            <p data-reveal-item className="text-title max-w-[48ch] text-muted">
              {deck}
            </p>
          </Reveal>
        ) : null}
      </header>

      <div className="gutter">
        <FrameRise frameClassName="aspect-[16/10] md:aspect-[16/7]">
          <Image src={insight.cover} alt="" fill priority sizes="100vw" quality={85} className="object-cover" />
        </FrameRise>
      </div>

      <section className="gutter section-y grid gap-12 md:grid-cols-12">
        {toc.length ? (
          <nav aria-label={labels.toc} className="md:col-span-3">
            <div className="md:sticky md:top-32">
              <Label className="mb-6">{labels.toc}</Label>
              <ol className="flex flex-col gap-3 text-sm">
                {toc.map((block, index) => (
                  <li key={block.id} className="flex gap-3">
                    <span className="tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
                    <a href={`#${block.id}`} className="text-muted transition-colors hover:text-fg">
                      {"text" in block ? block.text : null}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        ) : null}

        <Reveal className="flex flex-col gap-8 md:col-span-7 md:col-start-5">
          {blocks.map((block, index) => {
            if (block.type === "heading" && "text" in block) {
              return (
                <h2 key={index} id={block.id} data-reveal-item className="text-title mt-6 scroll-mt-32 font-medium first:mt-0">
                  {block.text}
                </h2>
              );
            }
            if (block.type === "pull" && "text" in block) {
              return (
                <blockquote key={index} data-reveal-item className="my-4 flex gap-5 border-s border-sky ps-6 text-[clamp(1.25rem,2.4vw,2.2rem)] font-medium leading-[1.2] tracking-[-0.02em] text-sky">
                  {block.text}
                </blockquote>
              );
            }
            if (block.type === "list" && "items" in block) {
              return (
                <ul key={index} data-reveal-item className="flex flex-col gap-3">
                  {block.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-lead text-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              );
            }
            return "text" in block ? (
              <p key={index} data-reveal-item className="text-lead text-muted">
                {block.text}
              </p>
            ) : null;
          })}

          {related ? (
            <div data-reveal-item className="mt-6 border-t border-line pt-8">
              <ButtonLink href={workHref(related.slug)} variant="glass" transitionLabel={related.title}>
                {labels.related}: {related.title}
              </ButtonLink>
            </div>
          ) : null}
        </Reveal>
      </section>

      {more.length ? (
        <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
          <SectionHead label={labels.more.label} title={labels.more.title} />
          <ul className="mt-14 grid gap-x-6 gap-y-16 md:mt-20 md:grid-cols-2 lg:grid-cols-3">
            {more.map((item) => (
              <li key={item.slug}>
                <InsightCard insight={item} date={formatDate(lang, item.date)} viewLabel={copy.ui.readMore} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ClosingCta label={closing.label} title={closing.title} body={closing.body} primary={{ label: closing.primary, href: "/start" }} secondary={{ label: copy.nav.contact.label, href: "/contact" }} />
    </article>
  );
}
