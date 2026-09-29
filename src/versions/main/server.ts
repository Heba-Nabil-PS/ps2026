import { getLocale } from "@/i18n/server";
import { getCopy } from "./copy";

/** Copy, facts, work and roles for the current route (main design, Server Components). */
export async function getServerCopy() {
  return getCopy(await getLocale());
}
