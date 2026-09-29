"use client";

import { Magnetic } from "@/versions/option-2/components/animations/Magnetic";
import { useContent } from "@/versions/option-2/i18n/LocaleProvider";
import { useLenis } from "lenis/react";
import { ArrowUp } from "lucide-react";

export function BackToTop() {
  const lenis = useLenis();
  const { t } = useContent();
  return (
    <Magnetic>
      <button
        type="button"
        onClick={() => {
          if (lenis) lenis.scrollTo(0, { duration: 1.4 });
          else window.scrollTo({ top: 0 });
        }}
        className="text-label flex items-center gap-2 py-2 text-muted transition-colors hover:text-fg"
      >
        {t.common.backToTop} <ArrowUp aria-hidden className="size-3.5" />
      </button>
    </Magnetic>
  );
}
