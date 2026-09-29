/** Retired route group — pages redirect to /work (see src/app/[lang]/retired.ts). */
export default function RetiredLayout({ children }: { children: React.ReactNode }) {
  return <main id="main">{children}</main>;
}
