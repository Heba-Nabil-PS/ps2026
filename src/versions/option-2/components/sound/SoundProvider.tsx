"use client";

import { soundManager } from "@/versions/option-2/audio/SoundManager";
import type { SoundName } from "@/versions/option-2/audio/sound";
import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";

type SoundContextValue = {
  enabled: boolean;
  toggle: () => void;
  play: (name: SoundName) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

/** React binding for the framework-agnostic SoundManager. Sound is OFF by default. */
export function SoundProvider({ children }: { children: ReactNode }) {
  const enabled = useSyncExternalStore(soundManager.subscribe, soundManager.isEnabled, () => false);

  const value = useMemo<SoundContextValue>(
    () => ({
      enabled,
      toggle: soundManager.toggle,
      play: (name) => (name === "hover" ? soundManager.playHover() : soundManager.play(name)),
    }),
    [enabled],
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const context = useContext(SoundContext);
  if (!context) throw new Error("useSound must be used inside <SoundProvider>");
  return context;
}
