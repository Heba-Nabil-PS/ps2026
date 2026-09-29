import { alternatesFor, getLocale } from "@/i18n/server";
import { getServerCopy } from "@/versions/main/server";
import { ServicesView } from "@/versions/main/services/ServicesView";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { copy } = await getServerCopy();
  const page = copy.meta.pages.services;
  return { title: page.title, description: page.description, alternates: alternatesFor("/services", await getLocale()) };
}

export default function ServicesPage() {
  return <ServicesView />;
}
