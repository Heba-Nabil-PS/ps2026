import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * The whole team at once: one portrait grid, every photo cropped to the same
 * head-and-shoulders frame (scripts/team-portraits.mjs) and graded to one navy
 * duotone, so mixed sources read as a set. Hover restores the colour. Every
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
                className="mono object-cover transition-[filter,transform] duration-[1.2s] ease-expo group-hover:scale-[1.04] group-hover:[filter:none] motion-reduce:transition-none"
              />
              {/* Navy duotone: tint the greyscale image, then cap its highlights at steel so light and dark
                  backgrounds land in one tonal range. Both layers fade out on hover. Light mode keeps the
                  pale steel: its own steel token is dark ink and would crush the portraits. */}
              <span aria-hidden className="absolute inset-0 bg-navy-500 mix-blend-color transition-opacity duration-700 group-hover:opacity-0" />
              <span aria-hidden className="absolute inset-0 bg-steel mix-blend-multiply transition-opacity light:bg-[#c3d3e2] duration-700 group-hover:opacity-0" />
              <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(7_18_31/0.55))]" />            </div>
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
