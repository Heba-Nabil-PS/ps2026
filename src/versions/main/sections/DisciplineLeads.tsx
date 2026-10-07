import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * The whole team at once: one portrait grid, every photo cropped to the same
 * head-and-shoulders frame (scripts/team-portraits.mjs),
 * shown in full colour. Every
 * other column drops on wide screens for an editorial rhythm. The header button opens Careers.
 * Shared by About and Team.
 */
export async function DisciplineLeads() {
  const { copy, site } = await getServerCopy();
  const section = copy.team.leads;
  const members = site.team.members;

  return (
    <section className="gutter section-y">
      <SectionHead
        label={section.label}
        title={section.title}
        intro={section.intro}
        action={
          <ButtonLink href="/careers" variant="glass" transitionLabel={copy.meta.pages.careers.title}>
            {section.more.action}
          </ButtonLink>
        }
      />

      <Reveal as="ul" className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-16 md:gap-x-6 lg:grid-cols-4" stagger={0.18}>
        {members.map((member) => (
          <li key={member.name} data-reveal-item className="group lg:even:mt-16">
            <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-navy-700">
              <Image
                src={member.image}
                alt=""
                fill
                sizes="(min-width: 1024px) 24vw, 48vw"
                quality={78}
                className="object-cover transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04] motion-reduce:transition-none"
              />
                          </div>
            <div className="relative mt-4 border-t border-line pt-4">
              <span aria-hidden className="absolute -top-px start-0 h-px w-0 bg-sky transition-[width] duration-700 ease-expo group-hover:w-full" />
              <h3 className="text-title font-medium">{member.name}</h3>
              <p className="mt-1 text-sm text-muted">{member.role}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
