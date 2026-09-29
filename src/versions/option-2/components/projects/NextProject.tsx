import { ImageReveal } from "@/versions/option-2/components/animations/ImageReveal";
import { RevealText } from "@/versions/option-2/components/animations/RevealText";
import { TransitionLink } from "@/versions/option-2/components/navigation/TransitionLink";
import type { Project } from "@/versions/option-2/data/projects";
import { getServerContent } from "@/versions/option-2/i18n/server";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

type NextProjectProps = {
  next: Project;
  previous: Project;
};

export async function NextProject({ next, previous }: NextProjectProps) {
  const { t } = await getServerContent();
  return (
    <nav aria-label={t.projects.moreProjects} className="border-t border-line pt-16 md:pt-24">
      <div className="gutter text-label mb-10 flex items-center justify-between text-muted md:mb-14">
        <TransitionLink
          href={`/projects/${previous.slug}`}
          transitionLabel={previous.title}
          className="group flex items-center gap-2 transition-colors hover:text-fg"
        >
          <ArrowLeft aria-hidden className="size-3.5 transition-transform duration-500 group-hover:-translate-x-1" />
          <span>
            {t.common.previous}<span className="hidden sm:inline"> — {previous.title}</span>
          </span>
        </TransitionLink>
        <span>{t.common.nextProject}</span>
      </div>

      <TransitionLink
        href={`/projects/${next.slug}`}
        transitionLabel={next.title}
        data-cursor="view"
        data-cursor-label={t.common.next}
        className="group block"
      >
        <div className="gutter mb-10 flex items-end justify-between gap-6 md:mb-14">
          <div>
            <span className="text-label mb-4 block text-accent">{next.number}</span>
            <RevealText
              as="span"
              mode="words"
              className="text-mega block font-extrabold uppercase transition-transform duration-1000 ease-[var(--ease-expo)] md:group-hover:translate-x-6 rtl:md:group-hover:-translate-x-6"
            >
              {next.title}
            </RevealText>
          </div>
          <ArrowUpRight
            aria-hidden
            className="mb-[2vw] size-10 shrink-0 text-accent transition-transform duration-700 ease-[var(--ease-expo)] group-hover:rotate-45 md:size-20"
          />
        </div>

        <ImageReveal
          src={next.heroImage}
          alt={`${next.title} — ${next.category}`}
          sizes="100vw"
          parallax={0.15}
          tone={next.color}
          className="h-[60svh] md:h-[80svh]"
          mediaClassName="transition-transform duration-[1400ms] ease-[var(--ease-expo)] group-hover:scale-[1.04]"
        />
      </TransitionLink>
    </nav>
  );
}
