import { PortfolioFooter } from "@/versions/option-2/components/portfolio/PortfolioFooter";
import { PortfolioShell } from "@/versions/option-2/components/portfolio/PortfolioShell";
import type { ReactNode } from "react";

/** The portfolio section's layout: its runtime shell, the one <main>, its own footer. */
export function PortfolioFrame({ children }: { children: ReactNode }) {
  return (
    <PortfolioShell>
      <main id="main">{children}</main>
      <PortfolioFooter />
    </PortfolioShell>
  );
}
