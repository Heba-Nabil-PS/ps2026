import { getServerCopy } from "@/versions/main/server";
import { Counter } from "@/versions/main/motion/Counter";
import { WordMarquee } from "@/versions/main/motion/WordMarquee";
import { MotionBlurReveal } from "@/versions/main/motion/MotionBlurReveal";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Awards } from "@/versions/main/sections/Awards";
import { ClientsGrid } from "@/versions/main/sections/ClientsGrid";
import { DisciplineLeads } from "@/versions/main/sections/DisciplineLeads";
import { Leadership } from "@/versions/main/sections/Leadership";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Label } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * About — the positioning in full: our story, the numbers, awards, who leads it, what we believe,
 * and the brands that stay with us. Ends on one call to action.
 */
export async function AboutView() {
  const { copy, site } = await getServerCopy();
  const page = copy.about;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/site/sky.webp" />

      <section className="gutter section-y grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Label className="mb-10">{page.statement.label}</Label>
          <ScrollHighlight text={page.statement.text} className="text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.025em]" />
          <Reveal as="dl" className="mt-14 grid grid-cols-2 gap-x-8 gap-y-10 md:mt-20 lg:grid-cols-4" stagger={0.08}>
            {page.numbers.items.map((item) => (
              <div key={item.label} data-reveal-item className="flex flex-col gap-3">
                <dt className="order-2 text-sm text-muted">{item.label}</dt>
                <dd className="stretch order-1 text-[clamp(2.6rem,4.5vw,4.5rem)] leading-none text-sky">
                  <span data-line className="block">
                    <Counter value={item.value} suffix={item.suffix} className="text-grain" />
                  </span>
                </dd>
              </div>
            ))}
          </Reveal>
        </div>
        <MotionBlurReveal className="aspect-[4/5] self-end rounded-card md:col-span-4 md:col-start-9">
          <Image data-media src="/images/site/who-we-are.webp" alt="" fill sizes="(min-width: 768px) 30vw, 100vw" quality={75} className="mono object-cover" />
        </MotionBlurReveal>
      </section>

      <Awards label={page.awards.label} title={page.awards.title} intro={page.awards.intro} awards={site.awards} />
      <Leadership />
      <DisciplineLeads />

      <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
        <SectionHead label={page.principles.label} title={page.principles.title} />
        <Reveal as="ol" className="mt-14 border-b border-line md:mt-20" stagger={0.08}>
          {site.reasons.map((reason, index) => (
            <li key={reason.title} data-reveal-item className="group grid gap-4 border-t border-line py-8 md:grid-cols-12 md:gap-8 md:py-10">
              <span className="text-label flex items-center gap-3 tabular-nums text-subtle md:col-span-2">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title font-medium md:col-span-4">{reason.title}</h3>
              <p className="text-muted md:col-span-5 md:col-start-8">{reason.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <WordMarquee items={site.services.map((service) => service.title)} className="text-mega pb-[clamp(5.5rem,12vw,11rem)] font-extrabold uppercase" />
      <ClientsGrid label={page.clients.label} title={page.clients.title} intro={page.clients.intro} clients={site.clients} />
      <ClosingCta
        label={page.closing.label}
        title={page.closing.title}
        body={page.closing.body}
        primary={{ label: page.closing.primary, href: "/start" }}
        secondary={{ label: page.closing.secondary, href: "/team" }}
      />
    </>
  );
}
