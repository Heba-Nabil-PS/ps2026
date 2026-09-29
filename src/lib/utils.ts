import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Custom type-scale utilities from globals.css must be known as font sizes,
// otherwise tailwind-merge treats them as colours and drops them next to text-muted etc.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["mega", "display", "headline", "title", "lead", "label"] }],
    },
  },
});

/** Merge conditional Tailwind classes without conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Split a multi-line string (or array) into trimmed, non-empty lines. */
export function toLines(text: string | string[]) {
  return (Array.isArray(text) ? text : text.split("\n")).map((line) => line.trim()).filter(Boolean);
}

/** True for plain left-clicks that should be handled client-side. */
export function isPlainLeftClick(event: React.MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/**
 * HTML tags accepted by polymorphic `as` props. React's ElementType would also
 * include React Three Fiber's JSX elements, which collapses the props to never.
 */
export type TextTag = "div" | "p" | "span" | "h1" | "h2" | "h3" | "h4" | "ul" | "ol" | "li" | "dl" | "figcaption" | "blockquote";

/** Renders a TextTag with loose HTMLElement typing (ref included). */
export type TextComponent = import("react").ComponentType<
  import("react").HTMLAttributes<HTMLElement> & { ref?: import("react").Ref<HTMLElement | null> }
>;
