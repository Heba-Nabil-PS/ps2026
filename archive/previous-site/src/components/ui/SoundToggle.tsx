"use client";

import { useSound } from "@/components/sound/SoundProvider";
import { useContent } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/** Accessible sound switch with a tiny equaliser that only moves while sound is on. */
export function SoundToggle({ className }: { className?: string }) {
  const { enabled, toggle } = useSound();
  const { t } = useContent();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? t.common.turnSoundOff : t.common.turnSoundOn}
      className={cn("text-label group flex items-center gap-2 py-2", className)}
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0, 1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn(
              "w-[2px] origin-bottom bg-current transition-[height] duration-300",
              enabled ? "animate-[eq_900ms_ease-in-out_infinite_alternate] h-3" : "h-[3px]",
            )}
            style={enabled ? { animationDelay: `${bar * -220}ms` } : undefined}
          />
        ))}
      </span>
      <span>{enabled ? t.common.soundOn : t.common.soundOff}</span>
    </button>
  );
}
