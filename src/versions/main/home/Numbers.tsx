import Image from "next/image";
import { clientMarks } from "@/data/client-marks";
import { getServerCopy } from "@/versions/main/server";
import { Counter } from "@/versions/main/motion/Counter";
import { Reveal } from "@/versions/main/motion/Reveal";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/** Splits "1 → 15" or "16×" around its last number, so only that number counts up. */
function splitFigure(value: string) {
  const match = value.match(/^(.*?)(\d+)(\D*)$/);
  return match ? { prefix: match[1], number: Number(match[2]), suffix: match[3] } : null;
}

/**
 * Home — "Numbers from real projects": proof placed right after the selected
 * work, so the visitor who just saw the cases sees what they delivered.
 */
export async function Numbers() {
  const { copy } = await getServerCopy();
  const section = copy.home.numbers;

  return (
    <section data-thread-hidden className="gutter section-y">
      <SectionHead label={section.label} title={section.title} intro={section.intro} />
      <Reveal as="dl" className="mt-10 grid grid-cols-2 border-t border-line md:mt-14 lg:grid-cols-4" stagger={0.1}>
        {section.items.map((item) => {
          const figure = splitFigure(item.value);
          const mark = clientMarks[item.mark];
          return (
            <div
              key={item.client}
              data-reveal-item
              className="group flex min-w-0 flex-col gap-3 border-b border-line py-6 pe-4 even:border-s even:ps-4 sm:gap-4 sm:py-8 sm:even:ps-6 lg:border-b-0 lg:pe-6 lg:ps-6 lg:first:ps-0 lg:[&:not(:first-child)]:border-s"
            >
              <dt className="order-2 text-sm leading-snug text-muted sm:text-base">{item.caption}</dt>
              <dd className="stretch text-grain order-1 text-[clamp(1.28rem,7vw,2.6rem)] leading-none lg:text-[clamp(2.08rem,4.6vw,4.4rem)] text-sky" style={{ ["--wdth" as string]: 112 }}>
                {figure ? (
                  <>
                    {figure.prefix}
                    <Counter value={figure.number} suffix={figure.suffix} />
                  </>
                ) : (
                  item.value
                )}
              </dd>
              <dd className="order-3 mt-auto flex h-8 items-center sm:h-10">
                {mark ? (
                  <Image
                    src={`/images/clients/marks/${item.mark}.webp`}
                    alt={item.client}
                    width={mark.width}
                    height={mark.height}
                    className="h-6 w-auto max-w-24 object-contain sm:h-8 sm:max-w-32 opacity-80 light:brightness-0"
                  />
                ) : (
                  <span className="text-label text-sky">{item.client}</span>
                )}
              </dd>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
