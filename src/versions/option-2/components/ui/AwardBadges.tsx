import { cn } from "@/lib/utils";

type Award = { file: string; surface: string; title: string; issuer: string };

/** The award and partner badges as a small row, for the footers. No hooks, so server and client footers share it. */
export function AwardBadges({ label, awards, className, labelClassName }: { label: string; awards: readonly Award[]; className?: string; labelClassName?: string }) {
  return (
    <div className={className}>
      <p className={cn("text-label mb-5 text-muted", labelClassName)}>{label}</p>
      <ul className="flex flex-wrap items-center gap-3">
        {awards.map((award) => (
          <li key={award.file} className="flex h-14 items-center overflow-hidden rounded-md p-1" style={{ backgroundColor: award.surface }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG badge, nothing to optimize */}
            <img src={`/images/awards/${award.file}.svg`} alt={`${award.title}, ${award.issuer}`} title={`${award.title}, ${award.issuer}`} className="h-full w-auto" loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  );
}
