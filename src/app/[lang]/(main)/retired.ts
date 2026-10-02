import { hasLocale, localizeHref } from "@/i18n/config";
import { permanentRedirect } from "next/navigation";

/**
 * Routes from the previous site (case studies, projects, work, home-opt2) now
 * live under /portfolio. next.config.ts redirects them before they
 * render; these stubs keep the old files buildable as a safety net.
 * The original pages are preserved in archive/previous-site/.
 */
export async function redirectRetired(params: Promise<{ lang: string; slug?: string }>, base: "/portfolio" | "/") {
  const { lang, slug } = await params;
  const path = base === "/portfolio" && slug ? `/portfolio/${slug}` : base;
  permanentRedirect(hasLocale(lang) ? localizeHref(path, lang) : path);
}
