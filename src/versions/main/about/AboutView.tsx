import { studioTimeZones } from "@/versions/main/data/studios";
import { getServerCopy } from "@/versions/main/server";
import { Counter } from "@/versions/main/motion/Counter";
import { MotionBlurReveal } from "@/versions/main/motion/MotionBlurReveal";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Awards } from "@/versions/main/sections/Awards";
import { DisciplineLeads } from "@/versions/main/sections/DisciplineLeads";
import { Leadership } from "@/versions/main/sections/Leadership";
import { Offices } from "@/versions/main/sections/Offices";
import { ProcessCards } from "@/versions/main/sections/ProcessCards";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { Asterisk, Label } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * About — the positioning in full: our story, the numbers, awards, who leads it, what we believe,
 * how we work and where. Ends on one call to action.
 */
export async function AboutView() {
  const { copy, site } = await getServerCopy();
  const page = copy.about;

  return (
    <>
      <PageHero label={page.hero.label} title={page.hero.title} intro={page.hero.intro} image="/images/site/sky.webp" />

      <section className="gutter section-y grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <Label className="mb-10">{page.statement.label}</Label>
          <ScrollHighlight text={page.statement.text} className="text-[clamp(1.6rem,3vw,3rem)] font-medium leading-[1.15] tracking-[-0.025em]" />
        </div>
        <MotionBlurReveal className="aspect-[4/5] self-end rounded-card md:col-span-4 md:col-start-9">
          <Image data-media src="/images/site/who-we-are.webp" alt="" fill sizes="(min-width: 768px) 30vw, 100vw" quality={75} className="mono object-cover" />
        </MotionBlurReveal>
      </section>

      <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
        <Label className="mb-10">{page.numbers.label}</Label>
        <Reveal as="dl" className="grid gap-px overflow-hidden rounded-frame border border-line bg-line sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {page.numbers.items.map((item) => (
            <div key={item.label} data-reveal-item className="flex min-h-64 flex-col justify-between bg-ink-900 p-7 md:p-9">
              <dt className="order-2 text-sm text-muted">{item.label}</dt>
              <dd className="stretch order-1 text-[clamp(3.2rem,6vw,6rem)] leading-none text-sky">
                <span data-line className="block">
                  <Counter value={item.value} suffix={item.suffix} />
                </span>
              </dd>
            </div>
          ))}
        </Reveal>
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
                <Asterisk className="text-sky" />
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="text-title font-medium md:col-span-4">{reason.title}</h3>
              <p className="text-muted md:col-span-5 md:col-start-8">{reason.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <ProcessCards label={page.process.label} title={page.process.title} steps={site.process} />
      <Offices label={page.offices.label} title={page.offices.title} offices={site.offices} timeZones={studioTimeZones} directionsLabel={copy.ui.directions} />
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
