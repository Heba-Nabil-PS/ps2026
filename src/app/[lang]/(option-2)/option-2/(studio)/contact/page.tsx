import { alternatesFor, getLocale } from "@/i18n/server";
import { ContactView } from "@/versions/option-2/components/studio/contact/ContactView";
import { getServerContent } from "@/versions/option-2/i18n/server";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { site, t } = await getServerContent();
  const title = t.meta.contact.title;
  const description = t.meta.contact.description.replace("{email}", site.email);
  const alternates = alternatesFor("/contact", locale, "option-2");
  return { title, description, alternates, openGraph: { title, description, url: alternates.canonical } };
}

export default function ContactPage() {
  return <ContactView />;
}
