"use client";

import dynamic from "next/dynamic";

// The WebGL field is decoration: kept out of the server render and the first bundle (three.js loads with it).
const InteractiveHeroBackground = dynamic(() => import("@/versions/main/home/InteractiveHeroBackground").then((m) => m.InteractiveHeroBackground), {
  ssr: false,
});

/**
 * The home page's backdrop: the interactive particle field fixed to the viewport,
 * behind every section, so the page scrolls over it and the field follows the scroll.
 * It is a full screen tall (100vh, which on phones is the height with the address
 * bar hidden), so the canvas does not resize each time that bar slides in or out.
 */
export function PageBackdrop() {
  return (
    <div aria-hidden data-page-backdrop className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-screen">
      <InteractiveHeroBackground />
    </div>
  );
}
