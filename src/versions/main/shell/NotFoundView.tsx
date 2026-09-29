import { getServerCopy } from "@/versions/main/server";
import { StretchHeading } from "@/versions/main/motion/StretchHeading";
import { ButtonLink } from "@/versions/main/ui/Button";
import { FlutedGlass } from "@/versions/main/ui/FlutedGlass";
import { Label } from "@/versions/main/ui/Label";
import Image from "next/image";

/** The 404 of the main design. Renders inside AppShell's <main>, so it must not add another. */
export async function NotFoundView() {
  const { copy } = await getServerCopy();
  const page = copy.notFound;

  return (
    <section className="relative isolate flex min-h-svh flex-col justify-center overflow-hidden pb-16 pt-32">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image src="/images/site/cover.webp" alt="" fill sizes="100vw" className="object-cover opacity-45" />
        <FlutedGlass className="absolute inset-0" flute={40} />
      </div>
      <div className="gutter">
        <Label className="mb-8">{page.label}</Label>
        <StretchHeading as="h1" lines={page.title} immediate delay={0.2} className="text-display" />
        <p className="text-lead mt-10 max-w-md text-muted">{page.body}</p>
        <div className="mt-10">
          <ButtonLink href="/" transitionLabel={copy.ui.home}>
            {page.action}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
