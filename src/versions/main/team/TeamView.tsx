import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { DisciplineLeads } from "@/versions/main/sections/DisciplineLeads";
import { Leadership } from "@/versions/main/sections/Leadership";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/**
 * Team — the human side of the brand (principle P5: people in black and
 * white). Leadership, the discipline leads, the seven crafts, then careers.
 * Leads are typographic cards until real portraits are shot.
 */
export async function TeamView() {
  const { copy } = await getServerCopy();
  const page = copy.team;

  return (
    <>
      <PageHero label={page.hero.label} title={page.hero.title} intro={page.hero.intro} image="/images/site/who-we-are.webp" />

      <Leadership />
      <DisciplineLeads />

      <section className="gutter pb-[clamp(5.5rem,12vw,11rem)]">
        <SectionHead label={page.disciplines.label} title={page.disciplines.title} />
        <Reveal as="ol" className="mt-14 grid border-b border-line md:mt-20 md:grid-cols-2 md:gap-x-10" stagger={0.06}>
          {page.disciplines.items.map((item, index) => (
            <li key={item.title} data-reveal-item className="group flex gap-6 border-t border-line py-7">
              <span className="text-label pt-1.5 tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-title font-medium transition-colors duration-500 group-hover:text-sky">{item.title}</h3>
                <p className="mt-2 text-sm text-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </section>

      <ClosingCta
        label={page.closing.label}
        title={page.closing.title}
        body={page.closing.body}
        primary={{ label: page.closing.primary, href: "/careers" }}
        secondary={{ label: page.closing.secondary, href: "/about" }}
      />
    </>
  );
}
