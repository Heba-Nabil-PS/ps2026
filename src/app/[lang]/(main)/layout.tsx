/**
 * Root layout of the main (current) design. Other design versions have their own
 * root layout (see src/versions/registry.ts), so switching versions is a full page load.
 */
import { hasLocale, localeDirection, locales } from "@/i18n/config";
import { getCopy } from "@/versions/main/copy";
import { alternatesFor } from "@/i18n/server";
import { siteConfig } from "@/lib/site";
import { AppShell } from "@/versions/main/shell/AppShell";
import type { Metadata, Viewport } from "next";
import { Alexandria, Anybody, IBM_Plex_Sans_Arabic, Inter_Tight } from "next/font/google";
import { notFound } from "next/navigation";
import "@/versions/main/styles.css";

/* Display: Anybody's width axis (50–150) lets headlines animate from
   condensed to extended. */
const stretch = Anybody({
  variable: "--font-stretch",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

/* Text: Helvetica Neue per the deck, where installed; Inter Tight otherwise. */
const text = Inter_Tight({
  variable: "--font-text",
  subsets: ["latin"],
  display: "swap",
});

/* Arabic display: Alexandria, a geometric, wide-set Arabic whose heavy cuts carry the
   same extended, futuristic voice as Anybody. Arabic text: IBM Plex Sans Arabic, the
   closest open grotesque to Helvetica Neue. Neither is preloaded, so English pages
   never download them. */
const arabicDisplay = Alexandria({
  variable: "--font-arabic-display",
  subsets: ["arabic", "latin"],
  display: "swap",
  preload: false,
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const { copy, site } = getCopy(lang);
  const title = `${site.name} — ${copy.meta.siteTitle}`;

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: title, template: `%s — ${site.name}` },
    description: copy.meta.description,
    applicationName: site.name,
    keywords: [...copy.meta.keywords],
    alternates: alternatesFor("/", lang),
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: lang === "ar" ? "ar_AR" : "en_US",
      title,
      description: copy.meta.description,
      url: alternatesFor("/", lang).canonical,
      images: [{ url: "/images/og.jpg", width: 1200, height: 630, alt: site.name }],
    },
    twitter: { card: "summary_large_image", title, description: copy.meta.description, images: ["/images/og.jpg"] },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#07121f",
  colorScheme: "dark light",
};

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const { copy, site } = getCopy(lang);

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    email: site.email,
    description: copy.meta.description,
    address: site.offices.map((office) => ({ "@type": "PostalAddress", addressLocality: office.city, streetAddress: office.address })),
  };

  return (
    <html lang={lang} dir={localeDirection(lang)} className={`${stretch.variable} ${text.variable} ${arabic.variable} ${arabicDisplay.variable}`} suppressHydrationWarning>
      <head>
        {/* Reveal animations hide content only once we know scripts run. Safety net: if the
            app has not started within 5 s (a script failed to load), drop the flag so every
            section shows as plain content instead of staying hidden.
            It has already run by the time React hydrates, and browser extensions or the dev
            overlay can empty inline scripts in the DOM, so React must not compare its contents.
            It also decides, before first paint, whether the loading intro plays: on the first full
            load of a browser session (key "ps-intro", set by IntroAnimation), never with reduced motion (the "intro-play" class is named in
            versions/main/intro/intro-signal.ts). And it applies the saved light/dark choice
            (key "ps-theme", see versions/main/shell/ThemeSwitch.tsx) so the page never flashes.
            Safari gets a "safari" class: it scrolls natively (see SmoothScroll) and draws lighter glass (styles.css). */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html:
              "var d=document.documentElement;d.classList.add('js');try{if(/^((?!chrome|chromium|android|crios|fxios|edg).)*safari/i.test(navigator.userAgent))d.classList.add('safari')}catch(e){}try{if(localStorage.getItem('ps-theme')==='light')d.dataset.theme='light'}catch(e){}try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!sessionStorage.getItem('ps-intro'))d.classList.add('intro-play')}catch(e){}setTimeout(function(){if(!window.__psReady)d.classList.remove('js','intro-play')},5000)",
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {/* Structured data lives in <body> (as the Next.js JSON-LD guide does): in <head> the
            served HTML can reach the browser without its type attribute, which React reports
            as a hydration mismatch. */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }}
        />
        <AppShell locale={lang}>{children}</AppShell>
      </body>
    </html>
  );
}
