import { cn } from "@/lib/utils";
import { Counter } from "@/versions/main/motion/Counter";
import { Reveal } from "@/versions/main/motion/Reveal";

export type NumberItem = { readonly value: number; readonly suffix?: string; readonly label: string };

/**
 * A row of headline figures under a hairline: each counts up the first time it
 * scrolls into view, with its caption beneath. Two across on phones, four
 * across from desktop. Same figure treatment as the About page's numbers.
 */
export function NumbersGrid({ items, className }: { items: readonly NumberItem[]; className?: string }) {
  return (
    <Reveal as="dl" className={cn("grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-10 md:gap-x-8 md:pt-14 lg:grid-cols-4", className)} stagger={0.08}>
      {items.map((item) => (
        <div key={item.label} data-reveal-item className="flex flex-col gap-3">
          <dt className="order-2 max-w-[18rem] text-sm text-muted">{item.label}</dt>
          <dd className="stretch order-1 text-[clamp(2.08rem,4.5vw,4.5rem)] leading-none text-sky">
            <span data-line className="block">
              <Counter value={item.value} suffix={item.suffix} className="text-grain" />
            </span>
          </dd>
        </div>
      ))}
    </Reveal>
  );
}
