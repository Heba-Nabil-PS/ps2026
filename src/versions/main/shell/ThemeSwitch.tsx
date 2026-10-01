"use client";

import { cn } from "@/lib/utils";
import { useCopy } from "@/versions/main/use-copy";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

/** localStorage key, also read by the head script in the root layout before first paint. */
export const THEME_KEY = "ps-theme";

type Theme = "dark" | "light";

const read = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function apply(theme: Theme) {
  const root = document.documentElement;
  if (theme === "light") root.dataset.theme = "light";
  else delete root.dataset.theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

/**
 * Dark (the brand default) or light. The choice is kept in localStorage and set on <html> as
 * data-theme="light"; the tokens in styles.css do the rest. Cross-fades where the browser can.
 */
export function ThemeSwitch({ className }: { className?: string }) {
  const { copy } = useCopy();
  const theme = useSyncExternalStore(subscribe, read, () => "dark" as Theme);
  const next: Theme = theme === "light" ? "dark" : "light";

  const toggle = () => {
    // Read live, not from render: the head script may have set the theme before hydration caught up.
    const target: Theme = read() === "light" ? "dark" : "light";
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && document.startViewTransition) document.startViewTransition(() => apply(target));
    else apply(target);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={next === "light" ? copy.ui.lightMode : copy.ui.darkMode}
      title={next === "light" ? copy.ui.lightMode : copy.ui.darkMode}
      className={cn(
        "relative grid size-11 place-items-center rounded-full text-muted transition-colors duration-500 hover:text-fg",
        className,
      )}
    >
      {/* Both icons render on the server; CSS picks one, so the right icon shows before hydration. */}
      <Sun aria-hidden className="size-[1.15rem] transition-transform duration-500 ease-expo light:hidden" />
      <Moon aria-hidden className="hidden size-[1.1rem] transition-transform duration-500 ease-expo light:block" />
    </button>
  );
}
