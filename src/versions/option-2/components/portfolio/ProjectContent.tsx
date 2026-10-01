import { Project3D } from "@/versions/option-2/components/portfolio/blocks/Project3D";
import { ProjectFullWidthImage } from "@/versions/option-2/components/portfolio/blocks/ProjectFullWidthImage";
import { ProjectGallery } from "@/versions/option-2/components/portfolio/blocks/ProjectGallery";
import { ProjectImage } from "@/versions/option-2/components/portfolio/blocks/ProjectImage";
import { ProjectInteractive } from "@/versions/option-2/components/portfolio/blocks/ProjectInteractive";
import { ProjectPosts } from "@/versions/option-2/components/portfolio/blocks/ProjectPosts";
import { ProjectQuote } from "@/versions/option-2/components/portfolio/blocks/ProjectQuote";
import { ProjectStatement } from "@/versions/option-2/components/portfolio/blocks/ProjectStatement";
import { ProjectStats } from "@/versions/option-2/components/portfolio/blocks/ProjectStats";
import { ProjectText } from "@/versions/option-2/components/portfolio/blocks/ProjectText";
import { ProjectTwoColumn } from "@/versions/option-2/components/portfolio/blocks/ProjectTwoColumn";
import { ProjectVideo } from "@/versions/option-2/components/portfolio/blocks/ProjectVideo";
import { ProjectFullWidthVideo } from "@/versions/main/portfolio/blocks/ProjectFullWidthVideo";
import type { ContentBlock, PortfolioProject } from "@/data/portfolio";

/** Maps each content block `type` to its component. Add a block type here and in the ContentBlock union. */
function Block({ block, project }: { block: ContentBlock; project: PortfolioProject }) {
  switch (block.type) {
    case "hero":
      return <ProjectStatement eyebrow={block.eyebrow} title={block.title} image={block.image} />;
    case "image":
      return <ProjectImage image={block.image} caption={block.caption} aspect={block.aspect} align={block.align} />;
    case "fullWidthImage":
      return <ProjectFullWidthImage image={block.image} caption={block.caption} />;
    case "fullWidthVideo":
      return <ProjectFullWidthVideo src={block.src} label={block.label} caption={block.caption} />;
    case "video":
      return <ProjectVideo src={block.src} poster={block.poster} label={block.label} caption={block.caption} />;
    case "gallery":
      return <ProjectGallery title={block.title} images={block.images} />;
    case "posts":
      return <ProjectPosts eyebrow={block.eyebrow} title={block.title} body={block.body} items={block.items} shape={block.shape} columns={block.columns} />;
    case "twoColumn":
      return <ProjectTwoColumn eyebrow={block.eyebrow} title={block.title} body={block.body} image={block.image} reverse={block.reverse} />;
    case "text":
      return <ProjectText eyebrow={block.eyebrow} title={block.title} body={block.body} />;
    case "quote":
      return <ProjectQuote quote={block.quote} author={block.author} role={block.role} />;
    case "stats":
      return <ProjectStats title={block.title} items={block.items} />;
    case "3d":
      return <Project3D eyebrow={block.eyebrow} title={block.title} body={block.body} poster={block.poster} tone={project.color} />;
    case "interactive":
      return <ProjectInteractive eyebrow={block.eyebrow} title={block.title} body={block.body} before={block.before} after={block.after} />;
    default: {
      const exhaustive: never = block;
      return exhaustive;
    }
  }
}

export function ProjectContent({ project }: { project: PortfolioProject }) {
  // A case's numbers live in `results`; this layout still shows them as a closing stats block.
  const blocks: ContentBlock[] = project.results?.stats?.length ? [...project.content, { type: "stats", items: project.results.stats }] : project.content;
  return (
    <div>
      {blocks.map((block, i) => (
        <Block key={`${block.type}-${i}`} block={block} project={project} />
      ))}
    </div>
  );
}
