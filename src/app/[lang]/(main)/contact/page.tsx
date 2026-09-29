import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { ContactView } from "@/versions/main/contact/ContactView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.contact;
  return { title: page.title, description: page.description, alternates: alternatesFor("/contact", await getLocale()) };
}

export default function ContactPage() {
  return <ContactView />;
}
