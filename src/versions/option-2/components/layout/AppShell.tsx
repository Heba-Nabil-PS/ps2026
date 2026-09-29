import type { Locale } from "@/i18n/config";
import { LocaleProvider } from "@/i18n/locale-context";
import { VersionProvider } from "@/versions/VersionProvider";
import { Providers } from "@/versions/option-2/components/layout/Providers";
import { Navbar } from "@/versions/option-2/components/navigation/Navbar";
import { VersionSwitch } from "@/versions/option-2/components/navigation/VersionSwitch";
import { getContent } from "@/versions/option-2/i18n/content";
import type { ReactNode } from "react";

/**
 * Everything inside <body> for Option 2: skip link, providers, navigation and the
 * switch back to the current design. Each route group's shell adds its own <main>.
 */
export function AppShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  const { t } = getContent(locale);

  return (
    <>
      <a href="#main" className="text-label fixed start-4 top-4 z-[100] -translate-y-24 bg-fg px-4 py-3 text-bg focus:translate-y-0">
        {t.common.skipToContent}
      </a>
      <LocaleProvider locale={locale}>
        <VersionProvider version="option-2">
          <Providers>
            <Navbar />
            {children}
            <VersionSwitch />
          </Providers>
        </VersionProvider>
      </LocaleProvider>
      <div aria-hidden className="grain" />
    </>
  );
}
