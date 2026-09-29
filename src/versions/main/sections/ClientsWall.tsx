import { Reveal } from "@/versions/main/motion/Reveal";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

type Client = { name: string; file: string };

/**
 * Trust, quietly. Logos sit as white silhouettes in glass cells and regain
 * their own colour on hover (principle P5: monochrome until lit).
 */
export function ClientsWall({ label, title, intro, clients }: { label: string; title: readonly string[]; intro?: string; clients: readonly Client[] }) {
  return (
    <section className="gutter section-y">
      <SectionHead label={label} title={title} intro={intro} />
      <Reveal as="ul" className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line bg-line sm:grid-cols-3 md:mt-20 lg:grid-cols-5" stagger={0.04}>
        {clients.map((client) => (
          <li key={client.file} data-reveal-item className="group relative grid aspect-[3/2] place-items-center bg-ink-900 transition-colors duration-700 hover:bg-paper">
            {/* The logo files sit on opaque white. Inverted and screen-blended, the white drops
                out and the mark reads as a white silhouette; on hover the cell turns paper and
                the logo shows in its own colours. */}
            <Image
              src={`/images/clients/${client.file}.png`}
              alt={client.name}
              width={200}
              height={120}
              sizes="160px"
              className="h-auto max-h-[46%] w-auto max-w-[56%] object-contain opacity-75 mix-blend-screen transition-[filter,opacity] duration-700 [filter:grayscale(1)_invert(1)_contrast(1.35)] group-hover:opacity-100 group-hover:mix-blend-normal group-hover:[filter:none]"
            />
          </li>
        ))}
      </Reveal>
    </section>
  );
}
