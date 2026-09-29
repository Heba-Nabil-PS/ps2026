import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Asterisk } from "@/versions/main/ui/Label";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { ArrowUpRight } from "lucide-react";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

/**
 * The discipline leads as typographic cards (until real portraits are shot),
 * ending on a card that opens Careers. Shared by About and Team.
 */
export async function DisciplineLeads() {
  const { copy, site } = await getServerCopy();
  const section = copy.team.leads;

  return (
    <section className="gutter section-y">
      <SectionHead label={section.label} title={section.title} intro={section.intro} />
      <Reveal as="ul" className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-14 lg:grid-cols-3" stagger={0.08}>
        {site.team.members.map((member) => (
          <li key={member.name} data-reveal-item className="glass group relative flex min-h-72 flex-col justify-between overflow-hidden rounded-card p-7">
            <span aria-hidden className="stretch pointer-events-none absolute -end-4 -top-6 text-[9rem] leading-none text-paper/[0.05] transition-colors duration-700 group-hover:text-sky/20">
              <span data-line className="block">
                {initials(member.name)}
              </span>
            </span>
            <Asterisk className="size-5 text-sky" />
            <div>
              <h3 className="text-title font-medium">{member.name}</h3>
              <p className="mt-2 text-sm text-muted">{member.role}</p>
            </div>
          </li>
        ))}
        <li data-reveal-item>
          <AppLink href="/careers" transitionLabel={copy.meta.pages.careers.title} className="group flex h-full min-h-72 flex-col justify-between rounded-card bg-sky p-7 text-ink-950">
            <span className="stretch text-[clamp(3.5rem,6vw,5.5rem)] leading-none">
              <span data-line className="block">
                {section.more.value}
              </span>
            </span>
            <span>
              <span className="block text-lg">{section.more.title}</span>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                {section.more.action}
                <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 group-hover:rotate-45 rtl:-scale-x-100" />
              </span>
            </span>
          </AppLink>
        </li>
      </Reveal>
    </section>
  );
}
