"use client";

import { useEffect, useRef } from "react";

export type PointerState = {
  /** Normalised device coordinates (-1 → 1), y up. */
  x: number;
  y: number;
  active: boolean;
};

/**
 * Window-level pointer tracking for WebGL scenes. Canvases sit beneath text
 * overlays, so R3F's own pointer events would miss most movement.
 */
export function usePointer() {
  const pointer = useRef<PointerState>({ x: 0, y: 0, active: false });

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      pointer.current.active = true;
    };
    const onLeave = () => {
      pointer.current.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return pointer;
}
