"use client";

import { useEffect, useState, type RefObject } from "react";

/** True while the element is near the viewport — used to pause WebGL frame loops. */
export function useCanvasActive(ref: RefObject<HTMLElement | null>, rootMargin = "10% 0px") {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return active;
}

let webglSupport: boolean | undefined;

/** Feature-detects WebGL once per session. */
export function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport;
  try {
    const canvas = document.createElement("canvas");
    webglSupport = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    webglSupport = false;
  }
  return webglSupport;
}
