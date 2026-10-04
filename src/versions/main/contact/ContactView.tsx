import { getServerCopy } from "@/versions/main/server";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ContactForm } from "@/versions/main/contact/ContactForm";
import { directionsHref } from "@/versions/main/sections/Offices";
import { AppLink } from "@/versions/main/ui/AppLink";
import { PageHero } from "@/versions/main/ui/PageHero";
import { ArrowUpRight, MapPin } from "lucide-react";

/** Contact — a message form (questions, problems) beside the direct email and the office addresses. */
export async function ContactView() {
  const { copy, site } = await getServerCopy();
  const page = copy.contact;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/site/contact.webp" />

      <section className="gutter grid gap-12 pb-[clamp(5.5rem,12vw,11rem)] pt-[clamp(3.5rem,8vw,7rem)] md:grid-cols-12 md:gap-8">
        <div className="md:col-span-7 md:col-start-6 md:row-start-1">
          <h2 className="mb-8 text-2xl font-medium md:text-3xl">{page.form.label}</h2>
          <ContactForm />
        </div>

        <Reveal className="flex flex-col gap-10 md:col-span-4 md:col-start-1 md:row-start-1" stagger={0.1}>
          <div data-reveal-item>
            <h2 className="mb-8 text-2xl font-medium md:text-3xl">{page.reach.label}</h2>
            <p className="text-sm text-muted">{page.reach.email}</p>
            <a href={`mailto:${site.email}`} className="-my-2.5 inline-block py-2.5 text-lg text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {site.email}
            </a>
          </div>

          <div className="flex flex-col gap-4">
            <p data-reveal-item className="text-label text-subtle">
              {page.offices.label}
            </p>
            {site.offices.map((office) => (
              <address key={office.city} data-reveal-item className="glass flex flex-col gap-3 rounded-frame p-6 not-italic">
                <p className="flex items-center gap-2 text-lg font-medium">
                  <MapPin aria-hidden className="size-4 text-sky" />
                  {office.city}
                </p>
                <p className="leading-[1.6] text-muted">{office.address}</p>
                <a
                  href={directionsHref(office.address)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link -my-3 inline-flex w-fit items-center gap-2 py-3 text-sm text-fg transition-colors duration-500 hover:text-sky"
                >
                  {copy.ui.directions}
                  <ArrowUpRight aria-hidden className="size-4 transition-transform duration-500 ease-expo group-hover/link:rotate-45 rtl:-scale-x-100" />
                </a>
              </address>
            ))}
          </div>

          <p data-reveal-item className="text-sm text-muted">
            {page.project.body}{" "}
            <AppLink href={copy.nav.start.href} transitionLabel={copy.nav.start.label} className="text-fg underline decoration-line-strong underline-offset-8 transition-colors hover:decoration-sky">
              {page.project.action}
            </AppLink>
          </p>
        </Reveal>
      </section>
    </>
  );
}
