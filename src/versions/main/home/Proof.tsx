import { getServerCopy } from "@/versions/main/server";
import { ProofStage } from "@/versions/main/home/ProofStage";
import { SectionHead } from "@/versions/main/ui/SectionHead";

/**
 * Home — "Numbers from real projects": proof placed right after the selected
 * work. Each figure is a tab that opens the client's own words about it, so the
 * number and the voice behind it read as one claim instead of two sections.
 */
export async function Proof() {
  const { copy } = await getServerCopy();
  const section = copy.home.proof;

  return (
    <section data-thread-hidden className="gutter section-y">
      <SectionHead label={section.label} title={section.title} intro={section.intro} />
      <ProofStage section={section} />
    </section>
  );
}
