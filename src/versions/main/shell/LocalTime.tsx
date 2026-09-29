"use client";

import { useLocale } from "@/i18n/locale-context";
import { useSyncExternalStore } from "react";

const subscribe = (callback: () => void) => {
  const id = window.setInterval(callback, 15_000);
  return () => window.clearInterval(id);
};

/** Studio time (Cairo), updated every 15 s. Renders "--:--" on the server to stay hydration-safe. */
export function LocalTime({ timeZone, className }: { timeZone: string; className?: string }) {
  const locale = useLocale();
  const time = useSyncExternalStore(
    subscribe,
    () =>
      new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(
        // Rounded to the minute so the snapshot is stable between renders.
        Math.floor(Date.now() / 60_000) * 60_000,
      ),
    () => "--:--",
  );
  return (
    <time className={className} suppressHydrationWarning>
      {time}
    </time>
  );
}
