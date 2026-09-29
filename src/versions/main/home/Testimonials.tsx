import { getServerCopy } from "@/versions/main/server";
import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { Label } from "@/versions/main/ui/Label";

/**
 * Home — "In our clients' words": social proof placed right after the client
 * logos, where the visitor has just seen who we work with. Entries marked
 * `pending` are placeholders awaiting a real, approved quote; they render in a
 * dashed "to collect" state so they are never mistaken for a real testimonial.
 */
export async function Testimonials() {
  const { copy } = await getServerCopy();
  const section = copy.home.testimonials;

  return (
    <section className="gutter section-y">
      <Label className="mb-10 md:mb-14">{section.label}</Label>
      <Reveal className="grid gap-4 md:grid-cols-2" stagger={0.12}>
        {section.items.map((item, index) => (
          <figure
            key={index}
            data-reveal-item
            className={cn(
              "glass relative flex flex-col gap-6 rounded-frame p-7 md:p-10",
              item.pending && "border-dashed border-sky/40",
            )}
          >
            <span aria-hidden className="stretch text-[4.5rem] leading-[0.6] text-sky">
              &ldquo;
            </span>
            <blockquote className="text-lead text-fg">{item.quote}</blockquote>
            <figcaption className="mt-auto flex flex-wrap items-center justify-between gap-4">
              <span className="text-sm">
                <span className="font-medium text-fg">{item.name}</span>
                <span className="text-muted"> · {item.role}</span>
              </span>
              {item.pending ? <span className="text-label rounded-full bg-sky px-3 py-1.5 text-ink-900">{section.pending}</span> : null}
            </figcaption>
          </figure>
        ))}
      </Reveal>
    </section>
  );
}
