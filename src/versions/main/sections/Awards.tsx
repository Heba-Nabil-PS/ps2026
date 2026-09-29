import { Reveal } from "@/versions/main/motion/Reveal";
import { Label } from "@/versions/main/ui/Label";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

type Award = { file: string; surface: string; kind: string; title: string; issuer: string; body: string };

/**
 * Awards and partnerships. Badges keep their own colours (they are third-party marks, so no
 * monochrome treatment); each sits on a tile of its own background so badge and tile read as one.
 */
export function Awards({ label, title, intro, awards }: { label: string; title: readonly string[]; intro?: string; awards: readonly Award[] }) {
  return (
    <section id="awards" className="gutter scroll-mt-24 pb-[clamp(5.5rem,12vw,11rem)]">
      <SectionHead label={label} title={title} intro={intro} />
      <Reveal as="ul" className="mt-14 grid gap-px overflow-hidden rounded-frame border border-line bg-line md:mt-20 md:grid-cols-3" stagger={0.08}>
        {awards.map((award) => (
          <li key={award.file} data-reveal-item className="flex flex-col bg-ink-900">
            <div className="grid aspect-[4/3] place-items-center" style={{ backgroundColor: award.surface }}>
              {/* SVG badges: served as-is, the image optimizer does not rasterize SVG. */}
              <Image
                src={`/images/awards/${award.file}.svg`}
                alt={`${award.title}, ${award.issuer}`}
                width={320}
                height={240}
                unoptimized
                className="h-auto max-h-[62%] w-auto max-w-[62%] object-contain"
              />
            </div>
            <div className="flex flex-1 flex-col gap-4 p-7 md:p-9">
              <Label>{award.kind}</Label>
              <h3 className="text-title font-medium">{award.title}</h3>
              <p className="text-sm text-subtle">{award.issuer}</p>
              <p className="mt-auto pt-4 text-muted">{award.body}</p>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
