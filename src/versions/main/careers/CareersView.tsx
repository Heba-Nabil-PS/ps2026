import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { CareersBoard } from "@/versions/main/careers/CareersBoard";
import { ProcessCards } from "@/versions/main/sections/ProcessCards";
import { ButtonLink } from "@/versions/main/ui/Button";
import { PageHero } from "@/versions/main/ui/PageHero";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import { Suspense } from "react";

/**
 * Careers — objective 03. Why join, the open roles, and a three-step
 * application on the same page. /careers?role=<id> preselects a role.
 */
export async function CareersView() {
  const { copy, roles } = await getServerCopy();
  const page = copy.careers;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/site/who-we-are.webp">
        <div className="flex flex-wrap items-center gap-6">
          <ButtonLink href="#apply">{page.hero.cta}</ButtonLink>
          <p className="text-label text-subtle">
            <span className="tabular-nums text-sky">{String(roles.length).padStart(2, "0")}</span> — {page.roles.label}
          </p>
        </div>
      </PageHero>

      <section className="gutter section-y">
        <SectionHead label={page.values.label} title={page.values.title} />
        <Reveal as="ul" className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4" stagger={0.1}>
          {page.values.items.map((value) => (
            <li key={value.title} data-reveal-item className="glass group flex min-h-64 flex-col rounded-card p-7">
              <h3 className="text-title mt-auto pt-12 font-medium">{value.title}</h3>
              <p className="mt-3 text-sm text-muted">{value.body}</p>
            </li>
          ))}
        </Reveal>
      </section>

      <Suspense fallback={null}>
        <CareersBoard />
      </Suspense>

      <ProcessCards label={page.process.label} title={page.process.title} steps={page.process.steps} />
    </>
  );
}
