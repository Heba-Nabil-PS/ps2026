"use client";

import { useMediaQuery } from "@/lib/hooks";
import dynamic from "next/dynamic";

// The thread is desktop-only and a large module: fetched only on wide screens, once the page is up.
const Thread = dynamic(() => import("./LogoThreadScene").then((m) => m.Thread), { ssr: false });

/**
 * The home page's thread (see LogoThreadScene): the hero mark's own line, pulled out of its stem by the
 * scroll and run down the page into the footer mark. Desktop widths only: below 64rem the content spans
 * the screen, so the line could only cross the copy, and phones are spared the download.
 */
export function LogoThread() {
  return useMediaQuery("(min-width: 64rem)") ? <Thread /> : null;
}
