import { ContactDetails } from "@/versions/option-2/components/studio/contact/ContactDetails";
import { ContactForm } from "@/versions/option-2/components/studio/contact/ContactForm";
import { OfficesStrip } from "@/versions/option-2/components/studio/contact/OfficesStrip";
import { PageHero } from "@/versions/option-2/components/studio/PageHero";
import { getServerContent } from "@/versions/option-2/i18n/server";

export async function ContactView() {
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
          <a href={`mailto:${site.email}`} className="text-base underline decoration-[#07121f]/20 underline-offset-8 transition-colors hover:decoration-[#88bbd8] md:text-lg">
            {site.email}
          </a>
        }
      />

      <section id="contact" aria-labelledby="form-title" className="bg-[#eceef2] px-4 py-24 text-[#07121f] md:px-8 md:py-36">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="text-label mb-4 flex items-center gap-2 text-[#07121f]/50">
              <span aria-hidden className="size-1.5 rounded-full bg-[#07121f]" />
              {form.label}
            </p>
            <h2 id="form-title" className="mb-12 font-medium tracking-[-0.04em] text-[clamp(1.75rem,3.4vw,3.25rem)] leading-[1]">
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
