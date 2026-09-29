import { VersionProvider } from "@/versions/VersionProvider";
import { LocaleProvider } from "@/i18n/locale-context";
import type { Locale } from "@/i18n/config";
import { getCopy } from "@/versions/main/copy";
import { Providers } from "@/versions/main/shell/Providers";
import { SiteFooter } from "@/versions/main/shell/SiteFooter";
import { SiteHeader } from "@/versions/main/shell/SiteHeader";
import type { ReactNode } from "react";

/** Everything inside <body> for the main design: skip link, providers, header, the one <main>, footer, grain. */
export function AppShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const { copy } = getCopy(locale);

  return (
    <>
      <a href="#main" className="text-label fixed start-4 top-4 z-100 -translate-y-24 rounded-full bg-paper px-5 py-3 text-ink-900 focus:translate-y-0">
        {copy.ui.skip}
      </a>
      <LocaleProvider locale={locale}>
        <VersionProvider version="main">
          <Providers>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </Providers>
        </VersionProvider>
      </LocaleProvider>
      <div aria-hidden className="grain" />
    </>
  );
}
