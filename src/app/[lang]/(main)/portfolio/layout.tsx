import { PortfolioShell } from "@/versions/main/portfolio/PortfolioShell";

/** The portfolio's runtime (scroll sync, card → project transitions) wraps the index and every project. */
export default function PortfolioLayout({ children }: LayoutProps<"/[lang]/portfolio">) {
  return <PortfolioShell>{children}</PortfolioShell>;
}
