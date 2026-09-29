import { Preloader } from "@/components/studio/Preloader";
import { StudioFooter } from "@/components/studio/StudioFooter";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { StudioProvider } from "@/components/studio/StudioProvider";

/** Immersive home shell: its own header, preloader and footer on a light canvas. */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
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
