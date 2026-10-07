"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Copy } from "./copy-build";

/*
 * The current locale's Copy, for Client Components. Provided once, by the locale's own
 * provider module (copy-provider.en / copy-provider.ar, chosen in AppShell), so the client
 * bundle of an English page carries no Arabic content and vice versa.
 */

const CopyContext = createContext<Copy | null>(null);

export function CopyProvider({ value, children }: { value: Copy; children: ReactNode }) {
  return <CopyContext.Provider value={value}>{children}</CopyContext.Provider>;
}

export function useCopyContext(): Copy {
  const value = useContext(CopyContext);
  if (!value) throw new Error("useCopy() needs the main design's copy provider (see AppShell).");
  return value;
}
