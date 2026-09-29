"use client";

import { siteConfig } from "@/lib/site";
import { useSyncExternalStore } from "react";

const formatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: siteConfig.timeZone,
});

function subscribe(callback: () => void) {
  const id = window.setInterval(callback, 10_000);
  return () => window.clearInterval(id);
}

/** Studio local time — rendered client-side only to avoid hydration mismatches. */
export function LocalTime({ className }: { className?: string }) {
  const time = useSyncExternalStore(subscribe, () => formatter.format(new Date()), () => "--:--");
  return (
    <time className={className} suppressHydrationWarning>
      {time}
    </time>
  );
}
