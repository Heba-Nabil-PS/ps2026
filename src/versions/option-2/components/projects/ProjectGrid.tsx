import { ProjectCard } from "@/versions/option-2/components/projects/ProjectCard";
import type { Project } from "@/versions/option-2/data/projects";
import { cn } from "@/lib/utils";

type Slot = {
  className: string;
  aspect: string;
  sizes: string;
  size: "lg" | "md";
};

/**
 * Editorial rhythms — slot styles repeat in order, so any number of
 * projects keeps the same asymmetric composition.
 */
const layouts = {
  featured: [
    { className: "md:col-span-12", aspect: "aspect-[4/5] md:aspect-[16/9]", sizes: "100vw", size: "lg" },
    { className: "md:col-span-7", aspect: "aspect-[4/5] md:aspect-[5/4]", sizes: "(min-width: 768px) 58vw, 100vw", size: "md" },
    { className: "md:col-span-4 md:col-start-9 md:mt-[16vh]", aspect: "aspect-[4/5] md:aspect-[3/4]", sizes: "(min-width: 768px) 33vw, 100vw", size: "md" },
  ],
  editorial: [
    { className: "md:col-span-12", aspect: "aspect-[4/5] md:aspect-[16/9]", sizes: "100vw", size: "lg" },
    { className: "md:col-span-5", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
    { className: "md:col-span-6 md:col-start-7 md:mt-[12vh]", aspect: "aspect-[4/5] md:aspect-[4/3]", sizes: "(min-width: 768px) 50vw, 100vw", size: "md" },
    { className: "md:col-span-8 md:col-start-3", aspect: "aspect-[4/3] md:aspect-[16/10]", sizes: "(min-width: 768px) 66vw, 100vw", size: "lg" },
    { className: "md:col-span-6", aspect: "aspect-square", sizes: "(min-width: 768px) 50vw, 100vw", size: "md" },
    { className: "md:col-span-5 md:col-start-8 md:mt-[10vh]", aspect: "aspect-[4/5] md:aspect-[3/4]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
  ],
} satisfies Record<string, Slot[]>;

type ProjectGridProps = {
  projects: Project[];
  layout?: keyof typeof layouts;
  className?: string;
  /** Preload the first visual when it sits near the top of the page. */
  preloadFirst?: boolean;
};

export function ProjectGrid({ projects, layout = "editorial", className, preloadFirst = false }: ProjectGridProps) {
  const slots: Slot[] = layouts[layout];

  return (
    <ul className={cn("grid grid-cols-1 gap-y-20 md:grid-cols-12 md:gap-x-6 md:gap-y-36 3xl:gap-y-48", className)}>
      {projects.map((project, i) => {
        const slot = slots[i % slots.length];
        return (
          <li key={project.slug} className={slot.className}>
            <ProjectCard
              project={project}
              aspectClassName={slot.aspect}
              sizes={slot.sizes}
              size={slot.size}
              preload={preloadFirst && i === 0}
            />
          </li>
        );
      })}
    </ul>
  );
}
