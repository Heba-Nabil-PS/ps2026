import { cn } from "@/lib/utils";
import { Reveal } from "@/versions/main/motion/Reveal";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import { Label } from "@/versions/main/ui/Label";
import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Opening of every inner page: the page's light source behind reeded glass,
 * a ✳ label, the stretched title and a short intro. One shell for About,
 * Services, Work, Team, Careers and Contact keeps the pages consistent.
 */
export function PageHero({
  label,
  title,
  intro,
  children,
  image = "/images/site/cover.webp",
  className,
}: {
  label: string;
  title: readonly string[];
  intro: string;
  /** Extra content under the intro (actions, counts). */
  children?: ReactNode;
  image?: string;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate flex min-h-[68svh] flex-col justify-end overflow-hidden pb-14 pt-32 md:pb-16", className)}>
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src={image} alt="" fill priority sizes="100vw" quality={70} className="object-cover opacity-55" />
        <PointerLight className="opacity-70" />
        <FlutedGlass className="absolute inset-0" flute={34} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(7_18_31/0.2)_0%,rgb(7_18_31/0.55)_55%,var(--color-ink-900)_100%)]" />
      </div>

      <div className="gutter">
        <Label className="mb-8">{label}</Label>
        <StretchHeading as="h1" lines={title} immediate delay={0.35} className="text-display" lineClassNames={[undefined, "md:ps-[8vw]"]} />
        <Reveal immediate delay={0.9} className="mt-10 grid gap-8 md:mt-14 md:grid-cols-12">
          <p data-reveal-item className="text-lead max-w-xl text-muted md:col-span-6 md:col-start-7">
            {intro}
          </p>
          {children ? (
            <div data-reveal-item className="md:col-span-6 md:col-start-7">
              {children}
            </div>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
