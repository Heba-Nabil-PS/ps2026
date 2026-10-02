import { getServerCopy } from "@/versions/main/server";
import { TestimonialStage } from "@/versions/main/home/TestimonialStage";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/**
 * Home — "In our clients' words": social proof placed right after the client
 * logos, where the visitor has just seen who we work with. Each quote is paired
 * with the client's mark and the result behind it. Entries marked `pending` are placeholders awaiting
 * a real, approved quote; they render in a dashed "to collect" state so they are
 * never mistaken for a real testimonial.
 */
export async function Testimonials() {
  const { copy } = await getServerCopy();
  const section = copy.home.testimonials;

  return (
    <section data-thread-hidden className="gutter section-y">
      <SectionHead label={section.label} title={section.title} />
      <TestimonialStage section={section} />
    </section>
  );
}
