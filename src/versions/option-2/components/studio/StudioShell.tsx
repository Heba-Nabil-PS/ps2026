import { Preloader } from "@/versions/option-2/components/studio/Preloader";
import { StudioFooter } from "@/versions/option-2/components/studio/StudioFooter";
import { StudioHeader } from "@/versions/option-2/components/studio/StudioHeader";
import { StudioProvider } from "@/versions/option-2/components/studio/StudioProvider";
import type { ReactNode } from "react";

/** Immersive home shell: its own header, preloader and footer on a light canvas. */
export function StudioShell({ children }: { children: ReactNode }) {
  return (
    <StudioProvider>
      <noscript>
        <style>{`.split-reveal{visibility:visible!important}.preloader{display:none!important}`}</style>
      </noscript>
      <Preloader />
      <StudioHeader />
      <main id="main">{children}</main>
      <StudioFooter />
    </StudioProvider>
  );
}
