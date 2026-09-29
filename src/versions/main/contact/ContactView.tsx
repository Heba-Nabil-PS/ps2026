import { studioTimeZones } from "@/versions/main/data/studios";
import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ContactForm } from "@/versions/main/contact/ContactForm";
import { Offices } from "@/versions/main/sections/Offices";
import { AppLink } from "@/versions/main/ui/AppLink";
import { Label } from "@/versions/main/ui/Label";
import { PageHero } from "@/versions/main/ui/PageHero";
import { Suspense } from "react";

/** Contact — one short form, direct lines, the way into a full project brief, what happens next, the studios. */
export async function ContactView() {
  const { copy, site } = await getServerCopy();
  const page = copy.contact;

  return (
    <>
      <PageHero label={page.hero.label} title={page.hero.title} intro={page.hero.intro} image="/images/site/contact.webp" />

      <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] md:grid-cols-12">
        <div className="md:col-span-8">
          <Label className="mb-8">{page.form.label}</Label>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </div>

        <Reveal className="flex flex-col gap-12 md:col-span-3 md:col-start-10 md:pt-16">
          <div data-reveal-item>
            <p className="text-label mb-4 text-subtle">{page.direct.label}</p>
            <p className="text-sm text-muted">{page.direct.email}</p>
            <a href={`mailto:${site.email}`} className="text-lg text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {site.email}
            </a>
            <p className="mt-6 text-sm text-muted">{page.direct.careers}</p>
            <AppLink href="/careers" transitionLabel={copy.meta.pages.careers.title} className="text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {copy.footer.careers}
            </AppLink>
          </div>
          <div data-reveal-item>
            <p className="text-label mb-4 text-subtle">{page.brief.label}</p>
            <p className="text-sm text-muted">{page.brief.body}</p>
            <AppLink href={copy.nav.start.href} transitionLabel={copy.nav.start.label} className="mt-3 inline-block text-lg text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {page.brief.action}
            </AppLink>
          </div>
          <div data-reveal-item>
            <p className="text-label mb-6 text-subtle">{page.next.label}</p>
            <ol className="flex flex-col gap-6">
              {page.next.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="text-label pt-1 tabular-nums text-sky">{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <p className="font-medium">{step.title}</p>
                    <p className="mt-1 text-sm text-muted">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </section>

      <Offices label={page.offices.label} offices={site.offices} timeZones={studioTimeZones} directionsLabel={copy.ui.directions} />
    </>
  );
}
