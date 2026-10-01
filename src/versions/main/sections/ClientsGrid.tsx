import { clientMarks } from "@/data/client-marks";
import type { ClientLogo } from "@/versions/main/sections/ClientLogoSection";
import { Reveal } from "@/versions/main/motion/Reveal";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * The client wall in the site's dark theme, using the same transparent white
 * marks as the client field. On hover each tile fills white from below and the
 * mark turns into the original, full-colour logo.
 */
export function ClientsGrid({ label, title, intro, clients }: { label: string; title: readonly string[]; intro?: string; clients: readonly ClientLogo[] }) {
  return (
    <section className="gutter section-y">
      <SectionHead label={label} title={title} intro={intro} />
      <Reveal as="ul" stagger={0.04} className="mt-14 grid grid-cols-2 border-s border-t border-line sm:grid-cols-3 md:mt-20 lg:grid-cols-5">
        {clients.map((client) => {
          const size = clientMarks[client.file];
          if (!size) return null;
          return (
            <li
              key={client.file}
              data-reveal-item
              className="group relative flex aspect-[3/2] items-center justify-center overflow-hidden border-e border-b border-line px-6 py-8"
            >
              <span aria-hidden className="absolute inset-0 translate-y-full bg-white transition-transform duration-700 ease-[var(--ease-expo)] group-hover:translate-y-0" />
              <span className="relative grid max-w-[72%] place-items-center">
                <Image
                  src={`/images/clients/marks/${client.file}.webp`}
                  alt={client.name}
                  width={size.width}
                  height={size.height}
                  unoptimized
                  className="col-start-1 row-start-1 max-h-14 w-auto max-w-full object-contain opacity-70 transition-opacity duration-500 group-hover:opacity-0"
                />
                {/* The original artwork, on its own white, shown as the tile fills. */}
                <Image
                  src={`/images/clients/${client.file}.png`}
                  alt=""
                  aria-hidden
                  width={size.width}
                  height={size.height}
                  unoptimized
                  className="col-start-1 row-start-1 max-h-14 w-auto max-w-full object-contain opacity-0 transition-opacity delay-150 duration-500 group-hover:opacity-100"
                />
              </span>
            </li>
          );
        })}
      </Reveal>
    </section>
  );
}
