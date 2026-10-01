import { getServerCopy } from "@/versions/main/server";
import { InsightsIndex } from "@/versions/main/insights/InsightsIndex";
import { ClosingCta } from "@/versions/main/ui/ClosingCta";
import { PageHero } from "@/versions/main/ui/PageHero";
import { Suspense } from "react";

/** Insights — practical notes written from the work, filterable by topic. */
export async function InsightsView() {
  const { copy } = await getServerCopy();
  const page = copy.insights;
  const closing = copy.home.closing;

  return (
    <>
      <PageHero title={page.hero.title} intro={page.hero.intro} image="/images/site/why.webp" />
      <Suspense fallback={null}>
        <InsightsIndex />
      </Suspense>
      <ClosingCta label={closing.label} title={closing.title} body={closing.body} primary={{ label: closing.primary, href: "/start" }} secondary={{ label: copy.nav.contact.label, href: "/contact" }} />
    </>
  );
}
