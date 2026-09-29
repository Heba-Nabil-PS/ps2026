import { StudioShell } from "@/versions/option-2/components/studio/StudioShell";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <StudioShell>{children}</StudioShell>;
}
