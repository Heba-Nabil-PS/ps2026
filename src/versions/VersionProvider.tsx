"use client";

import { createContext, useContext, type ReactNode } from "react";
import { defaultVersion, type VersionId } from "./registry";

const VersionContext = createContext<VersionId>(defaultVersion);

/** Set by each version's root layout; every internal link built below it stays inside that version. */
export function VersionProvider({ version, children }: { version: VersionId; children: ReactNode }) {
  return <VersionContext.Provider value={version}>{children}</VersionContext.Provider>;
}

export function useVersion() {
  return useContext(VersionContext);
}
