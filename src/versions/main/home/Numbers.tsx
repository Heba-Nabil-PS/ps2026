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
    <section className="gutter section-y">
      <SectionHead label={section.label} title={section.title} intro={section.intro} />
      <Reveal as="dl" className="mt-10 grid border-t border-line sm:grid-cols-2 md:mt-14 lg:grid-cols-4" stagger={0.1}>
        {section.items.map((item) => {
          const figure = splitFigure(item.value);
          return (
            <div
              key={item.client}
              data-reveal-item
              className="group flex flex-col gap-4 border-b border-line py-8 sm:even:border-s sm:even:ps-6 lg:border-b-0 lg:pe-6 lg:ps-6 lg:first:ps-0 lg:[&:not(:first-child)]:border-s"
            >
              <dt className="order-2 text-muted">{item.caption}</dt>
              <dd className="stretch order-1 text-[clamp(2.6rem,4.6vw,4.4rem)] leading-none text-fg" style={{ ["--wdth" as string]: 112 }}>
                {figure ? (
                  <>
                    {figure.prefix}
                    <Counter value={figure.number} suffix={figure.suffix} />
                  </>
                ) : (
                  item.value
                )}
              </dd>
              <dd className="order-3 mt-auto text-label text-sky">{item.client}</dd>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
