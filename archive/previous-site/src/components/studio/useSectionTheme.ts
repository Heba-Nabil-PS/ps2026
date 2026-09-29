"use client";

import { useStudio, type HeaderTheme } from "@/components/studio/StudioProvider";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { RefObject } from "react";

/** Switches the fixed header's colours while this section sits underneath it. */
export function useSectionTheme(ref: RefObject<HTMLElement | null>, theme: HeaderTheme) {
  const { setHeaderTheme } = useStudio();

  useGSAP(
    () => {
      if (!ref.current) return;
      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 40px",
        end: "bottom 40px",
        onToggle: (self) => {
          if (self.isActive) setHeaderTheme(theme);
        },
      });
    },
    { dependencies: [theme, setHeaderTheme] },
  );
}
