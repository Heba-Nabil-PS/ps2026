import { LocalTime } from "@/versions/main/shell/LocalTime";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Asterisk, Label } from "@/versions/main/ui/Label";
import { ArrowUpRight } from "lucide-react";

/** Google Maps directions to an address; opens in the visitor's maps app on phones. */
const directionsHref = (address: string) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;

/**
 * The studios, each as a glass card with its city in the stretched face and its own
 * local time. Every card uses the same rows (meta, city, a two-line address slot,
 * directions), so the city names line up across cards whatever the address length.
 */
export function Offices({
  label,
  title,
  offices,
  timeZones,
  directionsLabel,
}: {
  label: string;
  title?: readonly string[];
  offices: readonly { city: string; address: string }[];
  timeZones: readonly string[];
  directionsLabel: string;
}) {
  return (
    <section className="gutter section-y">
      <Label className="mb-6">{label}</Label>
      {title ? <StretchHeading lines={title} className="text-headline mb-10 md:mb-14" /> : null}
      <Reveal className="grid gap-4 md:grid-cols-2" stagger={0.12}>
        {offices.map((office, index) => (
          <address key={office.city} data-reveal-item className="glass group grid min-h-64 grid-rows-[auto_1fr_auto_auto] rounded-frame p-7 not-italic md:min-h-80 md:p-10">
            <div className="flex items-center justify-between text-subtle">
              <Asterisk className="size-5 text-sky" />
              <LocalTime timeZone={timeZones[index] ?? timeZones[0]} className="text-label tabular-nums" />
            </div>
            <p className="stretch self-end pt-10 text-[clamp(2.2rem,4.4vw,4.2rem)] leading-none">
              <span data-line className="block">
                {office.city}
              </span>
            </p>
            {/* Two lines reserved, so a one-line address keeps the same rhythm. */}
            <p className="mt-4 min-h-[3.2em] max-w-sm leading-[1.6] text-muted">{office.address}</p>
            <a
              href={directionsHref(office.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link mt-6 inline-flex w-fit items-center gap-3 rounded-full border border-line-strong py-2 pe-2 ps-5 text-sm text-fg transition-colors duration-500 hover:border-sky hover:text-sky"
            >
              {directionsLabel}
              <span aria-hidden className="grid size-8 place-items-center rounded-full bg-paper text-ink-900 transition-transform duration-500 ease-expo group-hover/link:rotate-45 rtl:-scale-x-100">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </address>
        ))}
      </Reveal>
    </section>
  );
}
