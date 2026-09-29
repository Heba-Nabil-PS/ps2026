import { Magnetic } from "@/components/animations/Magnetic";
import { RevealText } from "@/components/animations/RevealText";
import { getServerContent } from "@/i18n/server";
import { ArrowUpRight } from "lucide-react";

type CallToActionProps = {
  eyebrow?: string;
  title?: string;
};

export async function CallToAction({ eyebrow, title }: CallToActionProps) {
  const { site: siteConfig, t } = await getServerContent();
  return (
    <section aria-labelledby="cta-title" className="gutter relative border-t border-line py-28 md:py-44">
      <p className="text-label mb-8 text-muted">{eyebrow ?? t.site.ctaEyebrow}</p>
      <div className="flex flex-col gap-14 md:flex-row md:items-end md:justify-between">
        <RevealText id="cta-title" as="h2" className="text-display font-extrabold uppercase" lineClassName="nth-2:text-accent">
          {title ?? t.site.ctaTitle}
        </RevealText>

        <Magnetic strength={0.4} className="self-start md:self-auto">
          <a
            href={`mailto:${siteConfig.email}`}
            className="group relative flex size-40 items-center justify-center overflow-hidden rounded-full border border-fg/30 md:size-52"
          >
            <span
              aria-hidden
              className="absolute inset-0 translate-y-full rounded-full bg-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0"
            />
            <span className="text-label relative flex flex-col items-center gap-2 transition-colors duration-500 group-hover:text-bg">
              <ArrowUpRight aria-hidden className="size-5 transition-transform duration-500 group-hover:rotate-45" />
              {t.common.startProject}
            </span>
          </a>
        </Magnetic>
      </div>
    </section>
  );
}
