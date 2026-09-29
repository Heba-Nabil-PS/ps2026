import type { ContentBlock, MediaRef, StatItem } from "@/data/portfolio";
import { cn } from "@/lib/utils";
import { Counter } from "@/versions/main/motion/Counter";
import { FrameRise } from "@/versions/main/motion/FrameRise";
import { MotionBlurReveal } from "@/versions/main/motion/MotionBlurReveal";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Label } from "@/versions/main/ui/Label";
import { CompareSlider } from "@/versions/main/work/CompareSlider";
import Image from "next/image";

type PostsBlock = Extract<ContentBlock, { type: "posts" }>;

const shapes: Record<NonNullable<PostsBlock["shape"]>, string> = {
  portrait: "aspect-[4/5]",
  square: "aspect-square",
  story: "aspect-[9/16]",
  phone: "aspect-[9/19]",
  screen: "aspect-[16/10]",
  wide: "aspect-[16/9]",
};

function Media({ image, className, sizes = "(min-width: 768px) 70vw, 100vw", contain }: { image: MediaRef; className?: string; sizes?: string; contain?: boolean }) {
  return (
    <MotionBlurReveal className={cn("rounded-card bg-navy-800", className)}>
      <Image data-media src={image.src} alt={image.alt} fill sizes={sizes} quality={80} className={contain ? "object-contain" : "object-cover"} />
    </MotionBlurReveal>
  );
}

function Heading({ eyebrow, title, body }: { eyebrow?: string; title?: string; body?: string }) {
  if (!eyebrow && !title && !body) return null;
  return (
    <div className="mb-10 grid gap-6 md:mb-14 md:grid-cols-12">
      <div className="md:col-span-6">
        {eyebrow ? <Label className="mb-5">{eyebrow}</Label> : null}
        {title ? <h2 className="text-title max-w-xl font-medium">{title}</h2> : null}
      </div>
      {body ? <p className="max-w-lg text-muted md:col-span-5 md:col-start-8 md:pt-10">{body}</p> : null}
    </div>
  );
}

/** Numbers that count up as they arrive — used by stats blocks and a case's results. */
export function CaseStats({ items }: { items: readonly StatItem[] }) {
  return (
    <Reveal
      as="dl"
      className={cn(
        "grid gap-px overflow-hidden rounded-card border border-line bg-line",
        items.length === 2 && "sm:grid-cols-2",
        items.length > 2 && "sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {items.map((item) => (
        <div key={item.label} data-reveal-item className="bg-ink-900 p-8 md:p-10">
          <dt className="text-sm text-muted">{item.label}</dt>
          <dd className="stretch mt-8 text-[clamp(3rem,7vw,6.5rem)] leading-none text-sky">
            <span data-line className="block">
              {item.prefix}
              <Counter value={item.value} suffix={item.suffix} />
            </span>
          </dd>
        </div>
      ))}
    </Reveal>
  );
}

type ImageBlock = Extract<ContentBlock, { type: "image" }>;

/** A portrait or square image pushed to one side leaves room for the text block before it. */
const pairsWithText = (block: ContentBlock | undefined): block is ImageBlock =>
  block?.type === "image" && (block.aspect === "portrait" || block.aspect === "square") && block.align !== "center";

/**
 * Renders a case study's content blocks (src/data/portfolio.ts). Inside a
 * case the work is shown in full colour — the index keeps it monochrome.
 * Campaign posts are never cropped: they sit whole inside their frame.
 */
export function CaseBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="flex flex-col gap-[clamp(5rem,11vw,10rem)]">
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "hero":
            return (
              <section key={key} className="gutter">
                {block.eyebrow ? <Label className="mb-6">{block.eyebrow}</Label> : null}
                <StretchHeading lines={[block.title]} width={100} className="text-headline max-w-[18ch]" />
                {block.image ? <Media image={block.image} className="mt-14 aspect-[16/9]" sizes="100vw" /> : null}
              </section>
            );
          case "text": {
            const next = blocks[index + 1];
            if (pairsWithText(next)) {
              // Text beside the image that follows it, so the image's side column isn't left empty.
              const imageFirst = next.align !== "right";
              return (
                <section key={key} className="gutter grid items-center gap-10 md:grid-cols-12">
                  <Reveal className={cn("md:col-span-6", imageFirst ? "md:order-2 md:col-start-7" : "md:col-start-1")}>
                    {block.eyebrow ? (
                      <div data-reveal-item>
                        <Label className="mb-5">{block.eyebrow}</Label>
                      </div>
                    ) : null}
                    <h2 data-reveal-item className="text-title font-medium">
                      {block.title}
                    </h2>
                    <p data-reveal-item className="mt-6 text-lead text-muted">
                      {block.body}
                    </p>
                  </Reveal>
                  <figure className={cn(next.aspect === "portrait" ? "md:col-span-5" : "md:col-span-6", imageFirst ? "md:order-1 md:col-start-1" : "md:col-start-[-6]")}>
                    <Media image={next.image} className={next.aspect === "portrait" ? "aspect-[4/5]" : "aspect-square"} sizes="(min-width: 768px) 45vw, 100vw" />
                    {next.caption ? <figcaption className="mt-4 text-sm text-subtle">{next.caption}</figcaption> : null}
                  </figure>
                </section>
              );
            }
            return (
              <Reveal key={key} as="section" className="gutter grid gap-6 md:grid-cols-12">
                <div data-reveal-item className="md:col-span-5">
                  {block.eyebrow ? <Label className="mb-5">{block.eyebrow}</Label> : null}
                  <h2 className="text-title font-medium">{block.title}</h2>
                </div>
                <p data-reveal-item className="text-lead text-muted md:col-span-6 md:col-start-7">
                  {block.body}
                </p>
              </Reveal>
            );
          }
          case "image": {
            // Already rendered beside the text block before it.
            const previous = blocks[index - 1];
            if (previous?.type === "text" && pairsWithText(block)) return null;
            return (
              <section key={key} className="gutter grid md:grid-cols-12">
                <figure
                  className={cn(
                    block.aspect === "portrait" ? "md:col-span-5" : block.aspect === "square" ? "md:col-span-6" : "md:col-span-9",
                    block.align === "right" && "md:col-start-[-6]",
                    block.align === "center" && "md:col-span-8 md:col-start-3",
                  )}
                >
                  <Media image={block.image} className={block.aspect === "portrait" ? "aspect-[4/5]" : block.aspect === "square" ? "aspect-square" : "aspect-[16/10]"} />
                  {block.caption ? <figcaption className="mt-4 text-sm text-subtle">{block.caption}</figcaption> : null}
                </figure>
              </section>
            );
          }
          case "fullWidthImage":
            return (
              <figure key={key} className="gutter">
                <FrameRise frameClassName="aspect-[16/9] bg-navy-800">
                  <Image src={block.image.src} alt={block.image.alt} fill sizes="100vw" quality={80} className="object-cover" />
                </FrameRise>
                {block.caption ? <figcaption className="mt-4 text-sm text-subtle">{block.caption}</figcaption> : null}
              </figure>
            );
          case "video":
            return (
              <figure key={key} className="gutter">
                <div className="relative aspect-[16/9] overflow-hidden rounded-card bg-navy-800">
                  <video src={block.src} poster={block.poster} aria-label={block.label} className="size-full object-cover" autoPlay muted loop playsInline preload="none" />
                </div>
                {block.caption ? <figcaption className="mt-4 text-sm text-subtle">{block.caption}</figcaption> : null}
              </figure>
            );
          case "gallery":
            return (
              <section key={key} className="gutter">
                <Heading title={block.title} />
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {block.images.map((image, i) => (
                    <Media key={image.src} image={image} className={cn("aspect-[4/5]", i % 3 === 1 && "md:translate-y-16")} sizes="(min-width: 768px) 30vw, 50vw" />
                  ))}
                </div>
              </section>
            );
          case "posts":
            return (
              <section key={key} className="gutter">
                <Heading eyebrow={block.eyebrow} title={block.title} body={block.body} />
                <div className={cn("grid gap-4 md:gap-6", block.columns === 2 ? "md:grid-cols-2" : "grid-cols-2 md:grid-cols-3")}>
                  {block.items.map((item) => (
                    <Media
                      key={item.src}
                      image={item}
                      contain
                      className={shapes[block.shape ?? "portrait"]}
                      sizes={block.columns === 2 ? "(min-width: 768px) 45vw, 100vw" : "(min-width: 768px) 30vw, 50vw"}
                    />
                  ))}
                </div>
              </section>
            );
          case "twoColumn":
            return (
              <section key={key} className="gutter grid items-center gap-10 md:grid-cols-12">
                <div className={cn("md:col-span-6", block.reverse && "md:order-2 md:col-start-7")}>
                  <Media image={block.image} className="aspect-[4/5]" sizes="(min-width: 768px) 45vw, 100vw" />
                </div>
                <Reveal className={cn("md:col-span-5", block.reverse ? "md:order-1" : "md:col-start-8")}>
                  {block.eyebrow ? (
                    <div data-reveal-item>
                      <Label className="mb-5">{block.eyebrow}</Label>
                    </div>
                  ) : null}
                  <h2 data-reveal-item className="text-title font-medium">
                    {block.title}
                  </h2>
                  <p data-reveal-item className="mt-5 text-muted">
                    {block.body}
                  </p>
                </Reveal>
              </section>
            );
          case "quote":
            return (
              <Reveal key={key} as="section" className="gutter">
                <figure data-reveal-item className="mx-auto max-w-4xl">
                  <blockquote className="text-[clamp(1.6rem,3.2vw,3rem)] font-medium leading-[1.15] tracking-[-0.02em]">“{block.quote}”</blockquote>
                  <figcaption className="mt-8 text-sm text-muted">
                    <span className="text-fg">{block.author}</span> — {block.role}
                  </figcaption>
                </figure>
              </Reveal>
            );
          case "stats":
            return (
              <section key={key} className="gutter">
                {block.title ? <Label className="mb-10">{block.title}</Label> : null}
                <CaseStats items={block.items} />
              </section>
            );
          case "3d":
            return (
              <section key={key} className="gutter grid items-center gap-10 md:grid-cols-12">
                <Media image={block.poster} className="aspect-square md:col-span-6" sizes="(min-width: 768px) 45vw, 100vw" />
                <div className="md:col-span-5 md:col-start-8">
                  {block.eyebrow ? <Label className="mb-5">{block.eyebrow}</Label> : null}
                  <h2 className="text-title font-medium">{block.title}</h2>
                  <p className="mt-5 text-muted">{block.body}</p>
                </div>
              </section>
            );
          case "interactive":
            return (
              <section key={key} className="gutter">
                <Heading eyebrow={block.eyebrow} title={block.title} body={block.body} />
                <CompareSlider before={block.before} after={block.after} />
              </section>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
