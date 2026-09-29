/** Header and footer live in the root layout; each page fills the main landmark. */
export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
