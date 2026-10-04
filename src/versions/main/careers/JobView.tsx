import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import { ApplyBar } from "@/versions/main/careers/ApplyBar";
import { JobApply } from "@/versions/main/careers/JobApply";
import { JobCard } from "@/versions/main/careers/JobCard";
import type { RoleDetail } from "@/versions/main/careers/roles";
import { StickyAside } from "@/versions/main/careers/StickyAside";
import { getCopy } from "@/versions/main/copy";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { BackLink } from "@/versions/main/ui/BackLink";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { Check, Clock, MapPin, Users } from "lucide-react";
import Image from "next/image";

/**
 * A role's own page: what the role is, the responsibilities and requirements,
 * with the application form beside them. The open application has no brief,
 * so it goes straight to the form.
 */
export function JobView({ lang, role }: { lang: Locale; role: RoleDetail }) {
  const { copy, roles } = getCopy(lang);
  const t = copy.careers.role;
  const hasBrief = role.description.length + role.responsibilities.length + role.requirements.length > 0;

  const facts = [
    { term: t.team, value: role.department, Icon: Users },
    { term: t.location, value: role.location, Icon: MapPin },
    { term: t.type, value: role.type, Icon: Clock },
  ];

  // Same team first, then the rest of the list.
  const others = roles.filter((item) => item.id !== role.id);
  const more = [...others.filter((item) => item.department === role.department), ...others.filter((item) => item.department !== role.department)].slice(0, 3);

  const jsonLd = role.open
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: role.title,
        description: [role.summary, ...role.description].join("\n\n"),
        responsibilities: role.responsibilities.join("\n"),
        qualifications: role.requirements.join("\n"),
        employmentType: role.type,
        hiringOrganization: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: role.location } },
      };

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}

      <section className="relative isolate overflow-hidden pb-8 pt-28 md:pb-16 md:pt-44">
        <div aria-hidden className="absolute inset-0 -z-10 [mask-image:linear-gradient(180deg,#000_0%,#000_55%,transparent_100%)]">
          <Image src="/images/site/who-we-are.webp" alt="" fill priority sizes="100vw" quality={70} className="object-cover opacity-40" />
          <PointerLight className="opacity-60" />
          <FlutedGlass className="absolute inset-0" flute={34} />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-ink-900)_30%,transparent)_0%,color-mix(in_srgb,var(--color-ink-900)_65%,transparent)_55%,var(--color-ink-900)_100%)]" />
        </div>

        <div className="gutter">
          <BackLink href="/careers" label={t.back} transitionLabel={copy.meta.pages.careers.title} />
          <StretchHeading as="h1" lines={twoLines(role.title)} immediate delay={0.35} className="text-headline mt-8 md:mt-12 md:text-[clamp(1.76rem,4.2vw,4.75rem)]" />
          <Reveal immediate delay={0.8}>
            <ul data-reveal-item className="mt-6 flex flex-wrap gap-2 text-sm text-fg md:mt-8">
              {facts.map(({ term, value, Icon }) => (
                <li key={term} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2">
                  <Icon aria-hidden className="size-4 text-sky" />
                  <span className="sr-only">{term}: </span>
                  {value}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {hasBrief ? (
        <section className="gutter section-y">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
            <Reveal className="flex flex-col gap-14 lg:col-span-6 md:gap-20 xl:col-span-7" stagger={0.1}>
              {role.description.length ? (
                <div data-reveal-item>
                  <h2 className="text-label mb-6 text-subtle">{t.about}</h2>
                  <div className="text-lead flex flex-col gap-5">
                    {role.description.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              ) : null}

              {role.responsibilities.length ? (
                <div data-reveal-item>
                  <h2 className="text-label mb-6 text-subtle">{t.responsibilities}</h2>
                  <ol className="border-b border-line">
                    {role.responsibilities.map((item, index) => (
                      <li key={item} className="flex items-start gap-5 border-t border-line py-5">
                        <span className="text-label mt-1.5 tabular-nums text-sky">{String(index + 1).padStart(2, "0")}</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {role.requirements.length ? (
                <div data-reveal-item>
                  <h2 className="text-label mb-6 text-subtle">{t.requirements}</h2>
                  <ul className="grid gap-3">
                    {role.requirements.map((item) => (
                      <li key={item} className="glass flex items-start gap-4 rounded-card p-5">
                        <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-sky text-ink-900">
                          <Check aria-hidden className="size-3.5" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </Reveal>

            <StickyAside className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
              <div id="apply" tabIndex={-1} className="scroll-mt-24 focus:outline-none">
                <JobApply role={role.open ? "" : role.id} />
              </div>
            </StickyAside>
          </div>
          {/* Below lg the form comes after the brief: a bar at the foot of the screen leads to it. */}
          <ApplyBar target="apply" label={t.apply.title.join(" ")} />
        </section>
      ) : (
        <section className="gutter section-y">
          <div className="mx-auto max-w-2xl">
            <JobApply role={role.open ? "" : role.id} />
          </div>
        </section>
      )}

      {more.length ? (
        <section className="gutter section-y">
          <SectionHead label={t.more.label} title={t.more.title} actionEnd action={<BackLink large href="/careers" label={t.back} transitionLabel={copy.meta.pages.careers.title} />} />
          <Reveal as="ul" className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 xl:grid-cols-3" stagger={0.1}>
            {more.map((item) => (
              <li key={item.id} data-reveal-item>
                <JobCard role={item} />
              </li>
            ))}
          </Reveal>
        </section>
      ) : null}
    </>
  );
}

/** Splits a title at the word break that keeps its two lines closest in length. */
function twoLines(title: string): string[] {
  const words = title.split(" ");
  let best = [title];
  let bestWidth = Infinity;
  for (let i = 1; i < words.length; i++) {
    const lines = [words.slice(0, i).join(" "), words.slice(i).join(" ")];
    const width = Math.max(lines[0].length, lines[1].length);
    if (width < bestWidth) {
      best = lines;
      bestWidth = width;
    }
  }
  return best;
}
