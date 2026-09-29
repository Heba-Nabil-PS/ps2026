import { ImageReveal } from "@/components/animations/ImageReveal";
import { RevealText } from "@/components/animations/RevealText";
import { ScrollHighlightText } from "@/components/animations/ScrollHighlightText";
import { Clients } from "@/components/home/Clients";
import { Reasons } from "@/components/home/Reasons";
import { Services } from "@/components/home/Services";
import { ScrollReveal } from "@/components/portfolio/ScrollReveal";
import { CallToAction } from "@/components/ui/CallToAction";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { t } = await getServerContent();
  const { title, description } = t.meta.about;
  const alternates = alternatesFor("/about", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function AboutPage() {
  const { site, t } = await getServerContent();
  const { lead, members } = site.team;
  const copy = t.about;

  return (
    <>
      <section aria-labelledby="about-title" className="gutter pb-20 pt-36 md:pb-32 md:pt-48">
        <RevealText
          id="about-title"
          as="h1"
          immediate
          delay={0.1}
          className="text-mega font-extrabold uppercase"
          lineClassName="nth-2:text-accent md:nth-2:ps-[14vw]"
        >
          {copy.title}
        </RevealText>
      </section>

      <section aria-label={copy.introLabel} className="gutter grid grid-cols-1 gap-14 pb-28 md:grid-cols-12 md:pb-44">
        <ImageReveal
          src="/images/site/who-we-are.webp"
          alt={copy.teamImageAlt}
          sizes="(min-width: 768px) 40vw, 100vw"
          preload
          parallax={0.1}
          delay={0.3}
          className="aspect-[4/5] md:col-span-5"
        />
        <div className="flex flex-col justify-end gap-10 md:col-span-6 md:col-start-7">
          <SectionLabel index="01">{t.site.whoWeAre}</SectionLabel>
          <ScrollHighlightText className="text-lead font-medium">{copy.who}</ScrollHighlightText>
          <p className="max-w-md leading-relaxed text-muted">{copy.noHandoffs}</p>
        </div>
      </section>

      <ImageReveal src="/images/site/sky.webp" alt={copy.skyAlt} sizes="100vw" parallax={0.12} className="h-[46svh] md:h-[80svh]" />

      <Reasons index="02" />

      <section aria-labelledby="process-title" className="gutter py-28 md:py-44">
        <SectionLabel index="03" className="mb-6">
          {copy.howWeWork}
        </SectionLabel>
        <RevealText id="process-title" as="h2" className="text-display mb-6 font-extrabold uppercase">
          {copy.processTitle}
        </RevealText>
        <ScrollReveal as="ol" targets="[data-step]" variant="up" stagger={0.09} className="mt-16 grid grid-cols-1 border-t border-line md:mt-24 md:grid-cols-2">
          {site.process.map((step, i) => (
            <li
              key={step.title}
              data-step
              className="group flex flex-col gap-6 border-b border-line py-10 md:px-8 md:py-14 md:odd:border-e md:odd:ps-0"
            >
              <span className="text-label tabular-nums text-accent">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-title font-extrabold uppercase transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-x-2">
                {step.title}
              </h3>
              <p className="max-w-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </ScrollReveal>
      </section>

      <section aria-labelledby="team-title" className="gutter border-t border-line py-28 md:py-44">
        <SectionLabel index="04" className="mb-6">
          {copy.teamLabel}
        </SectionLabel>
        <RevealText id="team-title" as="h2" className="text-display font-extrabold uppercase">
          {copy.teamTitle}
        </RevealText>

        <div className="mt-16 grid grid-cols-1 gap-12 md:mt-24 md:grid-cols-12">
          <figure className="md:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface">
              <Image src={lead.image} alt={lead.name} fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="mt-5">
              <p className="text-title font-extrabold uppercase text-accent">{lead.name}</p>
              <p className="mt-1 text-muted">{lead.role}</p>
            </figcaption>
          </figure>

          <div className="md:col-span-6 md:col-start-7 md:self-center">
            <ScrollReveal as="ul" targets="[data-member]" variant="up" stagger={0.07} className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
              {members.map((member) => (
                <li key={member.name} data-member className="border-t border-line py-6">
                  <p className="font-extrabold uppercase tracking-tight text-accent">{member.name}</p>
                  <p className="mt-1 text-sm text-muted">{member.role}</p>
                </li>
              ))}
            </ScrollReveal>
            <p className="mt-10 max-w-md leading-relaxed text-muted">{copy.teamBody}</p>
          </div>
        </div>
      </section>

      <Services index="05" />
      <Clients index="06" />
      <CallToAction eyebrow={copy.ctaEyebrow} title={t.site.ctaTitle} />
    </>
  );
}
