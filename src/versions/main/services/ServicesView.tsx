import { getServerCopy } from "@/versions/main/server";
import { ProcessCards } from "@/versions/main/sections/ProcessCards";
import { ServiceStack } from "@/versions/main/services/ServiceStack";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";

/** Services — the deck's six disciplines, how we work, then one call to action. */
export async function ServicesView() {
  const { copy, site } = await getServerCopy();
  const page = copy.services;

  return (
    <>
      <PageHero label={page.hero.label} title={page.hero.title} intro={page.hero.intro}>
        <ul className="flex flex-wrap gap-2">
          {page.list.map((service) => (
            <li key={service.slug}>
              <a href={`#${service.slug}`} className="glass inline-flex rounded-full px-4 py-2 text-sm text-muted transition-colors hover:text-fg">
                {service.title}
              </a>
            </li>
          ))}
        </ul>
      </PageHero>
      <ServiceStack />
      <ProcessCards label={page.process.label} title={page.process.title} steps={site.process} />
      <ClosingCta
        label={page.closing.label}
        title={page.closing.title}
        body={page.closing.body}
        primary={{ label: page.closing.primary, href: "/start" }}
        secondary={{ label: page.closing.secondary, href: "/work" }}
      />
    </>
  );
}
