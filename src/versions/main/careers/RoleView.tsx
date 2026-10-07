import type { Locale } from "@/i18n/config";
import { siteConfig } from "@/lib/site";
import type { RoleDetail } from "@/versions/main/careers/roles";
import { RoleApply } from "@/versions/main/careers/RoleApply";
import { getCopy } from "@/versions/main/copy";
import { Reveal } from "@/versions/main/motion/Reveal";
import { BackLink } from "@/versions/main/ui/BackLink";
import { ButtonLink } from "@/versions/main/ui/Button";
import { PageHero } from "@/versions/main/ui/PageHero";

/** A role: what it is, what you will do and bring, then the application with the role already chosen. */
export function RoleView({ lang, role }: { lang: Locale; role: RoleDetail }) {
  const { copy } = getCopy(lang);
  const labels = copy.careers.roles;

  const jsonLd = role.open
    ? null
    : {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        title: role.title,
        description: role.summary,
        employmentType: role.type,
        hiringOrganization: { "@type": "Organization", name: siteConfig.name, sameAs: siteConfig.url },
        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: role.location } },
      };

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /> : null}

      <PageHero title={[role.title]} intro={role.summary} image="/images/careers/careers-banner.webp" imageClassName="object-[72%_center] md:object-center" raw>
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="#apply">{copy.careers.hero.cta}</ButtonLink>
          <BackLink href="/careers" label={copy.careers.role.back} transitionLabel={copy.meta.pages.careers.title} />
        </div>
      </PageHero>

      {role.responsibilities.length || role.requirements.length ? (
        <section className="gutter section-y">
          <Reveal className="grid gap-12 md:grid-cols-12" stagger={0.1}>
            {[
              { label: labels.youWill, items: role.responsibilities },
              { label: labels.youBring, items: role.requirements },
            ].map((group, index) =>
              group.items.length ? (
                <div key={group.label} data-reveal-item className={index === 0 ? "md:col-span-6" : "md:col-span-5 md:col-start-8"}>
                  <p className="text-label mb-6 text-subtle">{group.label}</p>
                  <ul className="border-b border-line">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-4 border-t border-line py-5">
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null,
            )}
          </Reveal>
        </section>
      ) : null}

      <RoleApply role={role.open ? "" : role.id} />
    </>
  );
}
