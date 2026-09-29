import { ContactDetails } from "@/components/studio/contact/ContactDetails";
import { ContactForm } from "@/components/studio/contact/ContactForm";
import { OfficesStrip } from "@/components/studio/contact/OfficesStrip";
import { PageHero } from "@/components/studio/PageHero";
import { alternatesFor, getLocale, getServerContent } from "@/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { site, t } = await getServerContent();
  const title = t.meta.contact.title;
  const description = t.meta.contact.description.replace("{email}", site.email);
  const alternates = alternatesFor("/contact", locale);
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default async function ContactPage() {
  const { contactPage, site } = await getServerContent();
  const { hero, form } = contactPage;

  return (
    <>
      <PageHero
        label={hero.label}
        title={hero.title}
        intro={hero.intro}
        meta={hero.meta}
        aside={
          <a href={`mailto:${site.email}`} className="text-base underline decoration-black/20 underline-offset-8 transition-colors hover:decoration-[#88bbd8] md:text-lg">
            {site.email}
          </a>
        }
      />

      <section id="contact" aria-labelledby="form-title" className="bg-[#eceef2] px-4 py-24 text-[#0b0c0e] md:px-8 md:py-36">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-label mb-4 flex items-center gap-2 text-black/50">
              <span aria-hidden className="size-1.5 rounded-full bg-[#0b0c0e]" />
              {form.label}
            </p>
            <h2 id="form-title" className="mb-12 font-medium tracking-[-0.04em] text-[clamp(2rem,4.5vw,4.5rem)] leading-[1]">
              {form.title}
            </h2>
            <ContactForm />
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <ContactDetails />
          </div>
        </div>
      </section>

      <OfficesStrip />
    </>
  );
}
