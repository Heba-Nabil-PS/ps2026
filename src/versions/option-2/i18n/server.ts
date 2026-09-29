import { getLocale } from "@/i18n/server";
import { getContent } from "./content";

/** Localized content for the current route (option-2 design, Server Components). */
export async function getServerContent() {
  return getContent(await getLocale());
}
