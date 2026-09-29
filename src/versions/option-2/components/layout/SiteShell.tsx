import { Footer } from "@/versions/option-2/components/layout/Footer";
import type { ReactNode } from "react";

/** Shell of the (site) pages: about, projects and the previous home. */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
