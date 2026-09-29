"use client";

import { useLocalizeHref } from "@/i18n/locale-context";
import { isPlainLeftClick } from "@/lib/utils";
import { useRouteTransition } from "@/versions/main/shell/RouteTransition";
import Link from "next/link";
import type { ComponentProps } from "react";

type AppLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Word shown on the glass while the page changes. */
  transitionLabel?: string;
};

/**
 * next/link with the locale prefix and the glass page transition. Modifier
 * clicks, new tabs and external URLs behave natively.
 */
export function AppLink({ href: path, transitionLabel, onClick, target, ...props }: AppLinkProps) {
  const navigate = useRouteTransition();
  const localize = useLocalizeHref();
  const internal = path.startsWith("/") && !path.startsWith("//");
  const href = internal ? localize(path) : path;

  return (
    <Link
      href={href}
      target={target}
      onClick={(event) => {
        onClick?.(event);
        if (!internal || event.defaultPrevented || !isPlainLeftClick(event) || (target && target !== "_self")) return;
        event.preventDefault();
        navigate(href, transitionLabel);
      }}
      {...props}
    />
  );
}
