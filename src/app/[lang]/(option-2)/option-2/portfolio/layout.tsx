import { PortfolioFrame } from "@/versions/option-2/components/portfolio/PortfolioFrame";

export default function PortfolioLayout({ children }: LayoutProps<"/[lang]/option-2/portfolio">) {
  return <PortfolioFrame>{children}</PortfolioFrame>;
}
