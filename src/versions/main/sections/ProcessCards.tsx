import { Reveal } from "@/versions/main/motion/Reveal";
import { Asterisk } from "@/versions/main/ui/Label";
import { PointerLight } from "@/versions/main/ui/PointerLight";
import { SectionHead } from "@/versions/main/ui/SectionHead";
import Image from "next/image";

/**
 * "Our Process" (moodboard ref 09): numbered ✳ glass cards over ribbed light.
 * Used on Home, About and Services so the process always reads the same way.
 */
export function ProcessCards({ label, title, steps }: { label: string; title: readonly string[]; steps: readonly { title: string; body: string }[] }) {
  return (
    <section className="relative isolate overflow-hidden section-y">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/site/cover.webp" alt="" fill sizes="100vw" quality={70} className="object-cover opacity-35 [mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]" />
        <PointerLight className="opacity-60 [mask-image:linear-gradient(180deg,transparent,black_25%,black_75%,transparent)]" />
      </div>
      <div className="gutter">
        <SectionHead label={label} title={title} />
        <Reveal as="ol" className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 xl:grid-cols-4" stagger={0.12}>
          {steps.map((step, index) => (
            <li key={step.title} data-reveal-item className="glass group flex min-h-60 flex-col rounded-card p-7 md:p-8">
              <div className="flex items-center justify-between text-sky">
                <Asterisk className="size-6" />
                <span className="text-label tabular-nums text-subtle">{String(index + 1).padStart(2, "0")}</span>
              </div>
              <h3 className="text-title mt-auto pt-10 font-medium">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">{step.body}</p>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
