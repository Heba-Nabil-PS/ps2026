import { Project3D } from "@/versions/main/portfolio/blocks/Project3D";
import { ProjectFullWidthImage } from "@/versions/main/portfolio/blocks/ProjectFullWidthImage";
import { ProjectFullWidthVideo } from "@/versions/main/portfolio/blocks/ProjectFullWidthVideo";
import { ProjectGallery } from "@/versions/main/portfolio/blocks/ProjectGallery";
import { ProjectHorizontalGallery } from "@/versions/main/portfolio/blocks/ProjectHorizontalGallery";
import { ProjectImage } from "@/versions/main/portfolio/blocks/ProjectImage";
import { ProjectInteractive } from "@/versions/main/portfolio/blocks/ProjectInteractive";
import { ProjectPosts } from "@/versions/main/portfolio/blocks/ProjectPosts";
import { ProjectQuote } from "@/versions/main/portfolio/blocks/ProjectQuote";
import { ProjectStatement } from "@/versions/main/portfolio/blocks/ProjectStatement";
import { ProjectStats } from "@/versions/main/portfolio/blocks/ProjectStats";
import { ProjectText } from "@/versions/main/portfolio/blocks/ProjectText";
import { ProjectTwoColumn } from "@/versions/main/portfolio/blocks/ProjectTwoColumn";
import { ProjectVideo } from "@/versions/main/portfolio/blocks/ProjectVideo";
import type { ContentBlock, MediaRef, PortfolioProject } from "@/data/portfolio";
import { getServerContent } from "@/versions/main/portfolio/server";

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
      return <ProjectPosts eyebrow={block.eyebrow} title={block.title} body={block.body} items={block.items} shape={block.shape} columns={block.columns} emerge={block.emerge} />;
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

/** Every still the case study shows, hero first, once each — the strip for the horizontal gallery. */
function galleryImages(project: PortfolioProject, galleryImage: string): MediaRef[] {
  const found: MediaRef[] = [{ src: project.heroImage, alt: `${project.title} — ${galleryImage} 1` }];
  for (const block of project.content) {
    if (block.type === "hero" && block.image) found.push(block.image);
    else if (block.type === "image" || block.type === "fullWidthImage" || block.type === "twoColumn") found.push(block.image);
    else if (block.type === "gallery") found.push(...block.images);
    else if (block.type === "posts") found.push(...block.items);
    else if (block.type === "3d") found.push(block.poster);
  }
  const seen = new Set<string>();
  return found.filter((image) => !seen.has(image.src) && seen.add(image.src)).slice(0, 8);
}

export async function ProjectContent({ project }: { project: PortfolioProject }) {
  const { t } = await getServerContent();
  const images = galleryImages(project, t.projects.galleryImage);
  // A case's numbers live in `results`, shown by the results section after this content.
  return (
    <div>
      {/* The stretch of story a 3D subject (see `emerge` on posts) swims through. */}
      <div data-case-content>
        {project.content.map((block, i) => (
          <Block key={`${block.type}-${i}`} block={block} project={project} />
        ))}
      </div>
      {images.length >= 3 ? <ProjectHorizontalGallery images={images} tone={project.color} label={t.projects.gallery} /> : null}
    </div>
  );
}
