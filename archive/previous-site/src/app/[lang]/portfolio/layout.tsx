import { PortfolioFooter } from "@/components/portfolio/PortfolioFooter";
import { PortfolioShell } from "@/components/portfolio/PortfolioShell";

export default function PortfolioLayout({ children }: LayoutProps<"/[lang]/portfolio">) {
  return (
    <PortfolioShell>
      <main id="main">{children}</main>
      <PortfolioFooter />
    </PortfolioShell>
  );
}
