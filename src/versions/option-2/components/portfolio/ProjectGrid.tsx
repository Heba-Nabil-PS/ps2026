import { ProjectCard, type CardLayout } from "@/versions/option-2/components/portfolio/ProjectCard";
import type { PortfolioProject } from "@/data/portfolio";

/**
 * A six-beat editorial rhythm that repeats for any number of projects:
 * wide → pair (offset) → pair (offset) → wide.
 */
const rhythm: CardLayout[] = [
  { className: "md:col-span-12", aspect: "aspect-[4/5] md:aspect-[16/8]", sizes: "100vw", size: "lg" },
  { className: "md:col-span-7", aspect: "aspect-[4/5] md:aspect-[4/3]", sizes: "(min-width: 768px) 58vw, 100vw", size: "md" },
  { className: "md:col-span-5 md:mt-[10vh]", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
  { className: "md:col-span-5 md:col-start-2", aspect: "aspect-[4/5]", sizes: "(min-width: 768px) 42vw, 100vw", size: "md" },
  { className: "md:col-span-6 md:col-start-7 md:mt-[12vh]", aspect: "aspect-[4/5] md:aspect-[16/11]", sizes: "(min-width: 768px) 50vw, 100vw", size: "md" },
  { className: "md:col-span-10 md:col-start-2", aspect: "aspect-[4/5] md:aspect-[16/9]", sizes: "(min-width: 768px) 84vw, 100vw", size: "lg" },
];

export function ProjectGrid({ projects }: { projects: PortfolioProject[] }) {
  return (
    <ul className="grid grid-cols-1 gap-y-24 md:grid-cols-12 md:gap-x-8 md:gap-y-40">
      {projects.map((project, i) => {
        const layout = rhythm[i % rhythm.length];
        return (
          <li key={project.slug} className={layout.className}>
            <ProjectCard project={project} layout={{ ...layout, className: "" }} preload={i === 0} />
          </li>
        );
      })}
    </ul>
  );
}
