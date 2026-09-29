import { fill } from "@/versions/main/copy";
import { getServerCopy } from "@/versions/main/server";
import { cn } from "@/lib/utils";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { IndustryCard } from "@/versions/main/sections/IndustryCard";
import { ButtonLink } from "@/versions/main/ui/Button";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/** Home — "We know your sector": every industry as a card, the flagship first and largest. */
export async function IndustriesPreview() {
  const { copy, industries } = await getServerCopy();
  const section = copy.home.industries;

  return (
    <section className="gutter section-y">
      <SectionHead
        label={section.label}
        title={section.title}
        intro={section.intro}
        action={
          <ButtonLink href="/industries" variant="glass" transitionLabel={copy.meta.pages.industries.title}>
            {section.cta}
          </ButtonLink>
        }
      />
      <ul className="mt-10 grid gap-x-6 gap-y-12 md:mt-14 md:grid-cols-12 md:gap-y-14">
        {industries.map((industry, index) => (
          <li key={industry.slug} className={cn(index < 2 ? "md:col-span-6" : "md:col-span-4")}>
            <IndustryCard
              industry={industry}
              index={index}
              count={fill(copy.industries.labels.projects, { count: String(industry.work.length) })}
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
  );
}
