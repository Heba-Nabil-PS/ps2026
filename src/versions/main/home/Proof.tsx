import { getServerCopy } from "@/versions/main/server";
import { VoicesStage } from "@/versions/main/home/VoicesStage";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/**
 * Home — "Heard from the other side": proof placed right after the selected work. Each
 * testimonial carries its own result, counted and drawn beside the quote, so the number
 * and the voice behind it read as one claim.
 */
export async function Proof() {
  const { copy } = await getServerCopy();
  const section = copy.home.proof;

  return (
    <section data-thread-hidden className="gutter section-y">
      <SectionHead label={section.label} title={section.title} />
      <VoicesStage section={section} />
    </section>
  );
}
