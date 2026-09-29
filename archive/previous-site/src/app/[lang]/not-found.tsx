import { Magnetic } from "@/components/animations/Magnetic";
import { RevealText } from "@/components/animations/RevealText";
import { TransitionLink } from "@/components/navigation/TransitionLink";
import { getServerContent } from "@/i18n/server";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerContent();
  return { title: t.meta.notFound, robots: { index: false } };
}

export default async function NotFound() {
  const { t } = await getServerContent();

  return (
    <main id="main" className="gutter flex min-h-[100svh] flex-col justify-center gap-10 pb-16 pt-32">
      <p className="text-label text-accent">{t.site.notFoundLabel}</p>
      <RevealText as="h1" mode="lines" immediate className="text-mega font-extrabold uppercase">
        {t.site.notFoundTitle}
      </RevealText>
      <p className="max-w-md text-muted">{t.site.notFoundBody}</p>
      <Magnetic className="self-start">
        <TransitionLink
          href="/"
          transitionLabel={t.common.home}
          className="text-label group flex items-center gap-3 border border-line px-6 py-4 transition-colors hover:border-fg"
        >
          <ArrowLeft aria-hidden className="size-4 transition-transform duration-500 group-hover:-translate-x-1" />
          {t.common.backHome}
        </TransitionLink>
      </Magnetic>
    </main>
  );
}
