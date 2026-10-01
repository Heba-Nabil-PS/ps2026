import { getServerCopy } from "@/versions/main/server";
import { PositioningStage } from "@/versions/main/home/PositioningStage";
import { Reveal } from "@/versions/main/motion/Reveal";
import { ScrollHighlight } from "@/versions/main/motion/ScrollHighlight";
import { Label } from "@/versions/main/ui/Label";
import { ReelSlides } from "@/versions/main/home/ReelSlides";

/**
 * Who we are: the positioning line from the deck, read word by word, beside
 * the showreel's slides in motion. Three pillars close the thought. As the
 * page scrolls, the reel is pulled down out of the columns and becomes the
 * showreel's opening frame (PositioningStage), its edges waving as it grows.
 */
export async function Positioning() {
  const { copy } = await getServerCopy();
  const section = copy.home.positioning;

  return (
    <PositioningStage
      media={
        // Laid out at the screen's size, like the showreel it becomes: the same image file, the same crop.
        <ReelSlides slides={copy.home.showreel.slides} sizes="100vw" />
      }
    >
      <Label className="mb-10">{section.label}</Label>
      <ScrollHighlight
        text={section.statement}
        highlight={section.pillars.map((pillar) => pillar.title)}
        className="text-[clamp(1.4rem,2.5vw,2.5rem)] font-medium leading-[1.12] tracking-[-0.025em]"
      />
      <Reveal as="dl" className="mt-12 grid gap-8 sm:grid-cols-3" stagger={0.1}>
        {section.pillars.map((pillar, index) => (
          <div key={pillar.title} data-reveal-item className="border-t border-line-strong pt-5">
            <dt className="flex items-baseline gap-3 font-medium">
              <span className="text-label tabular-nums text-sky">{String(index + 1).padStart(2, "0")}</span>
              {pillar.title}
            </dt>
            <dd className="mt-2 text-sm text-muted">{pillar.body}</dd>
          </div>
        ))}
      </Reveal>
    </PositioningStage>
  );
}
