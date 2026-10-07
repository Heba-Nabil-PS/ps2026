import { fill } from "@/versions/main/copy-helpers";
import { getServerCopy } from "@/versions/main/server";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { ClientLogoSection } from "@/versions/main/sections/ClientLogoSection";
import { IndustryCard } from "@/versions/main/sections/IndustryCard";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";
import { cn } from "@/lib/utils";

/** Industries — every sector we serve, each linking to its page and its real work. */
export async function IndustriesView() {
  const { copy, site, industries } = await getServerCopy();
  const page = copy.industries;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/projects/texas-chicken/hero.webp">
        <p className="text-label text-subtle">
          <span className="text-sky tabular-nums">{String(industries.length).padStart(2, "0")}</span> — {copy.meta.pages.industries.title}
        </p>
      </PageHero>

      <section className="gutter pb-[clamp(1.5rem,3vw,2.5rem)]">
        <ul className="grid gap-x-6 gap-y-16 md:grid-cols-12 md:gap-y-24">
          {industries.map((industry, index) => (
            <li key={industry.slug} className={cn(index < 2 ? "md:col-span-6" : "md:col-span-4")}>
              <IndustryCard
                industry={industry}
                index={index}
                count={fill(page.labels.projects, { count: String(industry.work.length) })}
                flag={copy.nav.menus.flagship}
                viewLabel={copy.ui.view}
                tall={index < 2}
                sizes={index < 2 ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
                frame={(media) => <FrameRise>{media}</FrameRise>}
              />
            </li>
          ))}
        </ul>
      </section>

      <ClientLogoSection label={copy.work.clients.label} title={copy.work.clients.title} clients={site.clients} />

      <ClosingCta
        label={page.closing.label}
        title={page.closing.title}
        body={page.closing.body}
        primary={{ label: page.closing.primary, href: "/start" }}
        secondary={{ label: page.closing.secondary, href: "/portfolio" }}
      />
    </>
  );
}
