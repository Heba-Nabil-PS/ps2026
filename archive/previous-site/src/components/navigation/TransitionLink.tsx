"use client";

import { usePageTransition } from "@/components/animations/PageTransition";
import { useLocalizeHref } from "@/i18n/LocaleProvider";
import { isPlainLeftClick } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Short text shown on the transition layer. */
  transitionLabel?: string;
};

/** next/link (prefetching, a11y, modifier-click behaviour) + animated page transition. Internal paths get the current locale prefix. */
export function TransitionLink({ href: path, transitionLabel, onClick, target, ...props }: TransitionLinkProps) {
  const { navigate } = usePageTransition();
  const href = useLocalizeHref()(path);

  return (
    <Link
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !isPlainLeftClick(event) || (target && target !== "_self")) return;
        event.preventDefault();
        navigate(href, transitionLabel);
      }}
      {...props}
    />
  );
}
