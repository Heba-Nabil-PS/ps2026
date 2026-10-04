import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ButtonLink } from "@/versions/main/ui/Button";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { Label } from "@/versions/main/ui/Label";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import Image from "next/image";

type Action = { label: string; href: string };

/** Smaller buttons on phones, so the two actions fit side by side. */
const compact = "max-sm:min-h-11 max-sm:gap-2 max-sm:ps-4 max-sm:pe-1.5 max-sm:text-[0.8125rem] max-sm:[&>span:last-child]:size-7";

/**
 * The conversion moment at the end of each page ("Let's build your brand
 * together"). A light sits behind reeded glass and follows the pointer, the
 * moodboard's hand-behind-glass tile made interactive. One primary action,
 * one glass action.
 */
export function ClosingCta({ label, title, body, primary, secondary, bleed = true }: { label: string; title: readonly string[]; body: string; primary: Action; secondary?: Action; bleed?: boolean }) {
  return (
    <section className={bleed ? "relative isolate overflow-hidden section-y" : "gutter section-y"}>
      {bleed ? (
        // Full-bleed ribbed light, the same backdrop as ProcessCards. In light mode it is inverted
        // (hue kept), so the ribs read as frosted glass instead of a grey wash behind dark text.
        <div aria-hidden className="absolute inset-0 -z-10">
          <Image src="/images/site/cover.webp" alt="" fill sizes="100vw" quality={70} className="object-cover opacity-35 light:opacity-60 light:[filter:invert(1)_hue-rotate(180deg)] [mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]" />
          <PointerLight className="opacity-60 [mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]" />
        </div>
      ) : null}
      <div className={bleed ? "gutter" : "theme-dark relative isolate overflow-hidden rounded-frame border border-line px-[clamp(1rem,5vw,5rem)] py-[clamp(2.25rem,6.5vw,6rem)]"}>
        {bleed ? null : (
          <div aria-hidden className="absolute inset-0 -z-10">
            <Image src="/images/site/cover.webp" alt="" fill sizes="100vw" quality={70} className="object-cover opacity-40" />
            <PointerLight />
            <FlutedGlass className="absolute inset-0" flute={26} />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(3_7_13/0.85)_0%,rgb(3_7_13/0.35)_60%,transparent_100%)] rtl:bg-[linear-gradient(270deg,rgb(3_7_13/0.85)_0%,rgb(3_7_13/0.35)_60%,transparent_100%)]" />
          </div>
        )}

        <Label className="mb-5 md:mb-8">{label}</Label>
        {/* Phones set the title smaller and let it run the full width, so it sits on two or three lines instead of one word a line. */}
        <StretchHeading lines={title} className="text-display max-w-[14ch] max-sm:max-w-none max-sm:text-[1.6rem]" />
        <Reveal className="mt-5 flex max-w-xl flex-col gap-6 md:mt-10 md:gap-7">
          <p data-reveal-item className="text-lead text-muted">
            {body}
          </p>
          {/* Both actions share one row on phones: compact buttons, wrapping only on the narrowest screens. */}
          <div data-reveal-item className="flex flex-wrap gap-2 sm:gap-4">
            <ButtonLink href={primary.href} transitionLabel={primary.label} className={compact}>
              {primary.label}
            </ButtonLink>
            {secondary ? (
              <ButtonLink href={secondary.href} variant="glass" transitionLabel={secondary.label} className={compact}>
                {secondary.label}
              </ButtonLink>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
